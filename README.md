# Loyal

> **Important**: This app is for demonstration purposes only

## Scenario

Imagine you're running a very successful mobile app... You want to run a Loyalty program, track users' activity on your app and reward them with points which you later translate into mobile money payments.

These two app(`backend` and `mobile`) demonstrate such a system, using Elarian to track customer activities, engage them via sms, compute their points/gains using metadata and wallets as well as sending them cash via mobile money.


### Install and Run

```sh
# backend
cd backend
# edit config/default.json and add correct values 
npm install
npm start

# mobile
cd mobile
yarn install
npm run android
```

## Elarian Concepts


|Concept|Feature|
|-------|------|
|Messaging| SMS |
|Payment| Purses, Wallets, Mobile Payment |
|Customer State| Tags, Metadata, Activities, Reminders|


## Need Help?

If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](https://github.com/ElarianLtd/demo-app-moni/issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Slack](https://elarianworkspace.slack.com/)
- on Twitter [@ElarianHq](https://twitter.com/ElarianHq)
- by email at [info@elarian.com](mailto:info@elarian.com)

[Sign up](https://dashboard.elarian.com) to get started with Elarian today.

## Authors

- [@aksalj](https://github.com/aksalj)
- [@babatush](https://github.com/babatush)
- [@davidmuchiri](https://github.com/davidmuchiri)
- [@calvinkarundu](https://github.com/calvinkarundu)
