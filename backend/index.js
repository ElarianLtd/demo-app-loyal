const config = require('config');
const express = require('express');
const { Elarian } = require('elarian');

const smsChannel = config.get('elarian.channel.sms');
const paybill = config.get('elarian.channel.paybill');
const purseId = config.get('elarian.channel.purseId');

const app = express();
const elarian = new Elarian(config.get('elarian.client'));

const handleActivityEvent = async (notification, user) => {
    console.log(`Processing activity for ${user.customerNumber.number}`);
    const { activity } = notification;
    switch (activity.key) {
        case 'join':
            await user.addReminder({ key: 'loyal', remindAt: (Date.now() + 60000) / 1000, interval: 60 });
            break;
        case 'reject':
            await user.cancelReminder('loyal');
            await user.deleteMetadata(['points']);
            break;
        case 'points':
            let { points = 0 } = await user.getMetadata();

            // Give user some points randomly
            points = points + Math.floor(Math.random() * 500);
            await user.updateMetadata({ points });

            // Translate points to cash and put in user's wallet
            const amount = points * 0.7;
            if (amount > 50) {
                const res = await elarian.initiatePayment({
                    purseId,
                }, {
                    walletId: 'loyal-wallet',
                    customerId: user.customerId,
                }, {
                    amount,
                    currencyCode: 'KES',
                }, 'virtual');
                if (!['success', 'queued', 'pending_confirmation', 'pending_validation'].includes(res.status)) {
                    console.error(`Failed to stash payment: ${res.description}(${res.status})`);
                }

                await user.updateTags([{
                    key: 'level',
                    value: amount > 500 ? 'winner' : 'starter',
                    expiresAt: new Date(2025, 1, 1).getTime() / 1000
                }]);
            }
            break;
    }
};

const handleRemiderEvent = async (notification, user) => {
    console.log(`Processing reminder for ${user.customerId}`);

    const { points = 0 } = await user.getMetadata();
    if (!points) {
        console.log('No points, sending marketing message...');
        await user.sendMessage(smsChannel, { body: { text: 'The more you click the button, the more money you win' }});
        return;
    }
    if (points >= 500) {
        const amount = points * 0.7;
        const res = await elarian.initiatePayment({
            walletId: 'loyal-wallet',
            customerId: user.customerId
        }, {
            channelNumber: paybill,
            customerNumber: user.customerNumber,
        }, {
            amount,
            currencyCode: 'KES',
        }, 'virtual');
        if (!['success', 'queued', 'pending_confirmation', 'pending_validation'].includes(res.status)) {
            console.error(`Failed to send payment: ${res.description}(${res.status})`);
        } else {
            // Reset points after cashout
            await user.updateMetadata({ points: 0 });
            await user.deleteTags(['level']);
            console.log(`Cashed out KES ${amount}`);

            // Notify all other users that someone has won
            await elarian.sendMessageByTag(
                { key: 'level', value: 'starter', expiresAt: new Date(2025, 1, 1).getTime() / 1000},
                smsChannel,
                {
                    body: {
                        text: `Hey there!\nSomeone just got their loyalty points converted to KES ${amount}. Click that button to get more points!`
                    }
                }
            );
        }
    } else {
        console.log('Not enough points to cash out');
    }
};

app.get('/', (req, res) => {
  res.send('Hello Loyal!');
});

app.get('/user', async (req, res) => {
    const { token } = await elarian.generateAuthToken();
    res.send({
        phone: '+2547xxxxxxxx',
        name: 'Dr. Alice Wambui Kamau Otieno Wa Kamanda',
        credentials: {
            authToken: token,
            orgId: config.get('elarian.client.orgId'),
            appId: config.get('elarian.client.appId'),
        }
    });
});

app.listen(3000, () => {
  console.log('App listening at http://localhost:3000');

  elarian
    .on('reminder', handleRemiderEvent)
    .on('customerActivity', handleActivityEvent)
    .on('connected', () => { console.info('Elarian connected!');})
    .on('error', (error) => { console.error(`Elarian error: ${error}`); })
    .connect();
});