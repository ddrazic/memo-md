import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Dodan import za 'updateDoc'
import { useEffect, useState } from 'react';
import { Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';

const imagePairs = [
  { id: '1', type: 'image', content: require('../assets/images/firebase.png'), pairId: 'firebase' },
  { id: '2', type: 'text', content: 'Firebase', pairId: 'firebase' },

  { id: '3', type: 'image', content: require('../assets/images/flutter.png'), pairId: 'flutter' },
  { id: '4', type: 'text', content: 'Flutter', pairId: 'flutter' },

  { id: '5', type: 'image', content: require('../assets/images/java.png'), pairId: 'java' },
  { id: '6', type: 'text', content: 'Java', pairId: 'java' },

  { id: '7', type: 'image', content: require('../assets/images/kotlin.png'), pairId: 'kotlin' },
  { id: '8', type: 'text', content: 'Kotlin', pairId: 'kotlin' },

  { id: '9', type: 'image', content: require('../assets/images/python.png'), pairId: 'python' },
  { id: '10', type: 'text', content: 'Python', pairId: 'python' },

  { id: '11', type: 'image', content: require('../assets/images/react.png'), pairId: 'react' },
  { id: '12', type: 'text', content: 'React', pairId: 'react' },

  { id: '13', type: 'image', content: require('../assets/images/ruby.png'), pairId: 'ruby' },
  { id: '14', type: 'text', content: 'Ruby', pairId: 'ruby' },

  { id: '15', type: 'image', content: require('../assets/images/sql.png'), pairId: 'sql' },
  { id: '16', type: 'text', content: 'SQL', pairId: 'sql' },

  { id: '17', type: 'image', content: require('../assets/images/swift.png'), pairId: 'swift' },
  { id: '18', type: 'text', content: 'Swift', pairId: 'swift' },

  { id: '19', type: 'image', content: require('../assets/images/vsc.png'), pairId: 'vsc' },
  { id: '20', type: 'text', content: 'VS Code', pairId: 'vsc' },
];

const generateCards = () => {
  return imagePairs
    .map(card => ({ ...card, isFlipped: false, isMatched: false }))
    .sort(() => Math.random() - 0.5);
};

const GameScreen = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [username, setUsername] = useState('Učitavanje...');
  const navigation = useNavigation();

  const updateBestScore = async (newScore) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const currentBestScore = userDocSnap.data().bestScore;
          if (currentBestScore === null || newScore < currentBestScore) {
            await updateDoc(userDocRef, {
              bestScore: newScore,
              timestamp: new Date()
            });
            console.log("Najbolji rezultat ažuriran!");
          } else {
            console.log("Postojeći rezultat je bolji ili isti. Nema ažuriranja.");
          }
        } else {
          console.log("Korisnički dokument ne postoji.");
        }
      } catch (error) {
        console.error("Greška pri ažuriranju rezultata:", error);
      }
    }
  };

  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUsername(userDocSnap.data().username);
        }
      }
    };
    fetchUsername();
    initializeGame();
  }, []);

  useEffect(() => {
    let timer;
    if (gameStarted) {
      timer = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 0.01);
      }, 10);
    } else if (timer) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [gameStarted]);

  useEffect(() => {
    if (matchedCards.length === imagePairs.length / 2 && imagePairs.length > 0) {
      setGameStarted(false);
      setFinalTime(timeElapsed);
      setIsModalVisible(true);
      updateBestScore(timeElapsed);
    }
  }, [matchedCards, timeElapsed]);

  const initializeGame = () => {
    setCards(generateCards());
    setFlippedCards([]);
    setMatchedCards([]);
    setGameStarted(false);
    setTimeElapsed(0);
    setIsModalVisible(false);
  };

  const handleCardPress = (id) => {
    const card = cards.find(c => c.id === id);
    if (flippedCards.length === 2 || card.isFlipped || matchedCards.includes(card.pairId)) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newCards = [...cards];
    const cardToFlip = newCards.find(c => c.id === id);
    cardToFlip.isFlipped = true;

    setCards(newCards);
    setFlippedCards(prevFlipped => [...prevFlipped, cardToFlip]);

    if (flippedCards.length === 1) {
      const firstCard = flippedCards[0];

      if (firstCard.pairId === cardToFlip.pairId) {
        setMatchedCards(prevMatched => [...prevMatched, firstCard.pairId]);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards.find(c => c.id === firstCard.id).isFlipped = false;
          resetCards.find(c => c.id === cardToFlip.id).isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const renderCard = (card) => {
    const isFlipped = card.isFlipped || matchedCards.includes(card.pairId);

    const cardContent = () => {
      if (!isFlipped) {
        return null;
      }
      if (card.type === 'image') {
        return <Image source={card.content} style={styles.cardImage} resizeMode="contain" />;
      }
      return <Text style={styles.cardText}>{card.content}</Text>;
    };

    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.card, isFlipped ? styles.cardFlipped : styles.cardDefault]}
        onPress={() => handleCardPress(card.id)}
      >
        {cardContent()}
      </TouchableOpacity>
    );
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTextUsername}>{username}</Text>
        <Text style={styles.headerText}>Vrijeme: {timeElapsed.toFixed(2)} s</Text>
      </View>
      <View style={styles.grid}>
        {cards.map(renderCard)}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Tvoj rezultat: {finalTime.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                closeModal();
                initializeGame();
              }}
            >
              <Text style={styles.modalButtonText}>Pokušaj ponovno</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                closeModal();
                navigation.navigate('ranking');
              }}
            >
              <Text style={styles.modalButtonText}>Rang lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34656D',
    marginBottom: 5,
  },
  headerTextUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34656d90',
    marginBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: Platform.select({
      ios: 75,
      android: 65,
    }),
    height: Platform.select({
      ios: 75,
      android: 65,
    }),
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#34656D',
  },
  cardDefault: {
    backgroundColor: '#95c5b985',
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34656D',
    textAlign: 'center',
  },
  cardImage: {
    width: '80%',
    height: '80%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#34656D',
  },
  modalText: {
    backgroundColor: 'white',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34656D',
  },
  modalButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#34656D',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginTop: 10,
    width: 200,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#34656D',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GameScreen;