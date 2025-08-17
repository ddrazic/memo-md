import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';

import GameScreen from '../app/game';
import LoginScreen from '../app/index';
import RankingScreen from '../app/ranking';
import StartScreen from '../app/start';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Start" component={StartScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Ranking" component={RankingScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}