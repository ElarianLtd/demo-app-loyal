/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {AnimatedGaugeProgress} from 'react-native-simple-gauge';
import {Elarian} from 'elarian/web';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

let elarian;

const App = () => {
  const [name, setName] = useState(null);
  const [user, setUser] = useState({});
  const [joined, setJoined] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const rejectProgram = () => {
    setRejected(false);
    setJoined(false);
    setPoints(0);
    user
      .updateActivity(
        {channel: 'mobile', number: 'maisha-ios-app'},
        {sessionId: 'ABC', key: 'reject'},
      )
      .catch(console.error);
  };

  const joinProgram = () => {
    setJoined(true);
    user
      .updateActivity(
        {channel: 'mobile', number: 'maisha-ios-app'},
        {sessionId: 'ABC', key: 'join'},
      )
      .then(() => new Promise(resolve => setTimeout(resolve, 3000)))
      .then(() => user.getMetadata())
      .then(userData => {
        setPoints(userData.points || 0);
      })
      .catch(console.error);
  };

  const addPoints = async () => {
    user
      .updateActivity(
        {channel: 'mobile', number: 'maisha-ios-app'},
        {sessionId: 'ABC', key: 'points'},
      )
      .catch(console.error);
  };

  useEffect(() => {
    fetch('http://localhost:3000/user') // Ideally authenticated call
      .then(async res => {
        const data = await res.json();
        elarian = new Elarian(data.credentials);
        elarian
          .on('error', console.error)
          .on('connected', async () => {
            const usr = new elarian.Customer({
              number: data.phone,
              provider: 'cellular',
            });
            setUser(usr);
            setName(data.name);
            setIsLoading(false);

            let userData = await usr.getMetadata();
            if (userData.points) {
              setPoints(userData.points);
              setJoined(true);
            }

            setInterval(async () => {
              userData = await usr.getMetadata();
              const newPoints = userData.points || 0;
              setPoints(newPoints);
            }, 1000);
          })
          .connect();
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  let content = (
    <View>
      <Text style={styles.contentText}>
        Shallots Vegan Ipsum Me pinch of yum figs Thai dragon pepper crumbled
        lentils Thai super chili cocoa Thai curry cozy cinnamon oatmeal Thai
        basil curry habanero golden Malaysian green bowl crunchy sweet potato
        black bean burrito lime mango crisp delightful blueberry scones miso
        turmeric glazed aubergine Italian linguine puttanesca basil seeds
        toasted hazelnuts. Summer homemade balsamic mint tasty Vegan Ipsum Me
        garlic sriracha noodles tempeh roasted butternut squash pumpkin chili
        pepper maple orange tempeh smoky maple tempeh glaze soba noodles citrusy
        kale hemp seeds summer fruit salad mediterranean luxury bowl sriracha
        pecans banana kale caesar salad jalapeño strawberry spinach salad
        coconut milk bite sized Caribbean red habanero cashew almonds.
      </Text>
      {!isLoading && (
        <View style={{justifyContent: 'center'}}>
          <TouchableOpacity style={styles.button} onPress={joinProgram}>
            <Text style={{color: 'white'}}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}
            onPress={rejectProgram}>
            <Text>No thanks!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  if (rejected) {
    content = (
      <View>
        <Text
          style={[styles.contentText, {marginTop: 30, textAlign: 'center'}]}>
          You are no longer part of this program :(
        </Text>
      </View>
    );
  } else if (joined) {
    content = (
      <View
        style={{
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          margin: 20,
        }}>
        <AnimatedGaugeProgress
          size={100}
          width={5}
          fill={(points * 100) / 1000}
          rotation={90}
          cropDegree={90}
          tintColor="#139a9c"
          delay={0}
          backgroundColor="#b0c4de"
          stroke={[2, 2]} //For a equaly dashed line
          strokeCap="circle"
        />
        <Text
          style={[styles.contentText, {marginTop: 30, textAlign: 'center'}]}>
          {points} points
        </Text>
        <TouchableOpacity style={styles.button} onPress={addPoints}>
          <Text style={{color: 'white'}}>Get Points</Text>
        </TouchableOpacity>
        <Text style={[styles.contentText, {padding: 0}]}>
          Shallots Vegan Ipsum Me pinch of yum figs Thai dragon pepper crumbled
          lentils
        </Text>
        <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            padding: 10,
          }}
          onPress={rejectProgram}>
          <Text>I am done!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#139a9c" barStyle="light-content" />
      <ScrollView>
        <View style={styles.header}>
          <Image
            style={styles.tinyLogo}
            source={{
              uri: 'https://maishameds.org/wp-content/uploads/2016/06/White-1-200.png',
            }}
            resizeMode="contain"
          />
          <Text style={[styles.sectionTitle, {color: '#efefef'}]}>
            {joined ? 'Hello' : 'Welcome'}
          </Text>
          <Text style={[styles.sectionTitle, styles.highlight]}>{name}</Text>
          {isLoading && <ActivityIndicator size="large" color="#ffffff" />}
        </View>

        <View style={styles.sectionContainer}>
          {joined && (
            <Text style={[styles.contentTitle, {textAlign: 'center'}]}>
              More points = More Money
            </Text>
          )}
          {!joined && <Text style={styles.contentTitle}>Loyalty Program</Text>}
          {content}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ECF0F1',
  },
  tinyLogo: {
    width: 150,
    height: 100,
  },
  header: {
    height: 300,
    backgroundColor: '#139a9c',
    color: '#fff',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 0,
  },
  sectionContainer: {
    flex: 1,
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontSize: 20,
    fontWeight: '700',
  },
  contentTitle: {
    fontSize: 20,
    padding: 4,
    fontWeight: '600',
    color: '#212121',
  },
  contentText: {
    fontSize: 13,
    padding: 5,
    color: '#607D8B',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#139a9c',
    padding: 10,
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
    borderRadius: 8,
  },
});

export default App;
