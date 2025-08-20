import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';

const StartScreen = () => {
  const [username, setUsername] = useState('Učitavanje...');
  const [bestScore, setBestScore] = useState(null);
  const navigation = useNavigation();

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData.username);
          setBestScore(userData.bestScore);
        } else {
          setUsername("Korisnik");
          setBestScore(null);
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju korisničkih podataka:", error);
        setUsername("Korisnik");
        setBestScore(null);
      }
    } else {
      navigation.replace('index');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('index');
    } catch (error) {
      console.error('Greška kod odjave:', error.message);
      Alert.alert('Greška kod odjave', error.message);
    }
  };

  const formattedBestScore = bestScore === null ? "-" : `${bestScore.toFixed(2)}s`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dobrodošli,{"\n"}{username}!</Text>
      <Text style={styles.subtitle}>Najbolji rezultat: {formattedBestScore}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('game')}
      >
        <Text style={styles.buttonText}>IGRAJ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ranking')}
      >
        <Text style={styles.buttonText}>RANG LISTA</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonLogout}
        onPress={handleLogout}
      >
        <Text style={styles.buttonTextLogout}>ODJAVI SE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34656D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#34656D',
    width: '100%',
    maxWidth: 300,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#34656D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonLogout: {
    color: '#34656D',
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 50,
  },
  buttonTextLogout: {
    color: '#34656D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StartScreen;