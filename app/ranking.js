import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const RankingScreen = () => {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('bestScore'));
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.bestScore !== null) {
            users.push({
              id: doc.id,
              username: data.username,
              bestScore: data.bestScore
            });
          }
        });
        setRankingData(users);
      } catch (error) {
        console.error("Greška pri dohvaćanju rang liste:", error);
        Alert.alert("Greška", "Nije moguće dohvatiti rang listu.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRanking();
  }, []);

  const renderItem = ({ item, index }) => (
    <View style={styles.rankingItem}>
      <Text style={styles.rankingPosition}>{index + 1}.</Text>
      <Text style={styles.rankingUsername}>{item.username}</Text>
      <Text style={styles.rankingScore}>{item.bestScore.toFixed(2)}s</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#34656D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rang lista</Text>
      
      <FlatList
        data={rankingData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Nazad</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7F2F1',
    alignItems: 'center',
    padding: 20,
    paddingTop: 80,
  },
  loadingContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34656D',
    marginBottom: 20,
  },
  list: {
    width: '100%',
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  rankingPosition: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34656D',
    width: 30,
  },
  rankingUsername: {
    fontSize: 18,
    flex: 1,
    color: '#555',
  },
  rankingScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34656D',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#34656D',
    width: '100%',
    maxWidth: 300,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#34656D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RankingScreen;