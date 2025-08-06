import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db } from '../firebase';

const auth = getAuth(app);

const screenWidth = Dimensions.get('window').width;

const CARD_MARGIN = 5;

const NUM_COLUMNS_WEB = 5;
const NUM_COLUMNS_DEFAULT = 4;

const ACTUAL_NUM_COLUMNS = Platform.select({
    web: NUM_COLUMNS_WEB,
    default: NUM_COLUMNS_DEFAULT,
});

const MAX_GAME_WIDTH_WEB = 600;


const calculateCardSize = (availableWidth, columns) => {
    return (availableWidth - CARD_MARGIN * 2 * columns - 20) / columns;
};

const CARD_SIZE = Platform.select({
    web: calculateCardSize(MAX_GAME_WIDTH_WEB, NUM_COLUMNS_WEB),
    default: calculateCardSize(screenWidth, NUM_COLUMNS_DEFAULT),
});


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

const GameScreen = () => {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [intervalId, setIntervalId] = useState(null);

    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);

    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    const [currentUserUsername, setCurrentUserUsername] = useState(null);

    useEffect(() => {
        const fetchUsername = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setCurrentUserUsername(userDocSnap.data().username);
                    }
                } catch (error) {
                    console.error("Greška pri dohvatu korisničkog imena:", error);
                }
            }
        };
        fetchUsername();
    }, []);


    useEffect(() => {
        shuffleCards();
        startTimer();
        return stopTimer;
    }, []);

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimer((prev) => prev + 10);
        }, 10);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const shuffleCards = () => {
        const shuffled = [...imagePairs].sort(() => Math.random() - 0.5);
        setCards(shuffled);
    };

    useEffect(() => {
        if (matchedPairs.length === imagePairs.length / 2) {
            stopTimer();
            saveResult(timer);
            setModalVisible(true);
        }
    }, [matchedPairs, timer]);

    const saveResult = async (finalTime) => {
        const user = auth.currentUser;
        if (!user) {
            console.warn("Nema prijavljenog korisnika, rezultat neće biti spremljen u Firestore.");
            return;
        }

        await AsyncStorage.setItem('previousResult', finalTime.toString());
        const bestLocal = await AsyncStorage.getItem('bestResult');
        if (!bestLocal || finalTime < parseInt(bestLocal)) {
            await AsyncStorage.setItem('bestResult', finalTime.toString());
        }

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            let currentBestFirestore = null;
            let usernameToSave = null;

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                currentBestFirestore = data.bestResult;
                usernameToSave = data.username;
            }

            if (!usernameToSave && user.email) {
                usernameToSave = user.email;
            } else if (!usernameToSave && user.displayName) {
                usernameToSave = user.displayName;
            } else if (!usernameToSave) {
                usernameToSave = "NepoznatiKorisnik";
            }


            const dataToSave = {
                bestResult: finalTime,
            };

            if (usernameToSave) {
                dataToSave.username = usernameToSave;
            } else {
                console.warn("Korisničko ime nije dostupno za spremanje rezultata.");
            }

            if (currentBestFirestore === null || finalTime < currentBestFirestore) {
                await setDoc(userDocRef, dataToSave, { merge: true });
                console.log("Najbolji rezultat spremljen u Firestore:", finalTime, "za korisnika:", usernameToSave);
            } else {
                console.log("Novi rezultat nije bolji od postojećeg najboljeg rezultata u Firestore-u.");
            }
        } catch (error) {
            console.error("Greška pri spremanju rezultata u Firestore:", error);
            Alert.alert("Greška", "Nismo uspjeli spremiti tvoj najbolji rezultat na rang listu.");
        }
    };


    const handleCardPress = (card) => {
        if (
            selectedCards.length === 2 ||
            selectedCards.find((c) => c.id === card.id) ||
            matchedPairs.includes(card.pairId)
        ) {
            return;
        }

        const newSelected = [...selectedCards, card];
        setSelectedCards(newSelected);

        if (newSelected.length === 2) {
            if (
                newSelected[0].pairId === newSelected[1].pairId &&
                newSelected[0].type !== newSelected[1].type
            ) {
                const newMatchedPairs = [...matchedPairs, newSelected[0].pairId];
                setMatchedPairs(newMatchedPairs);
                setTimeout(() => setSelectedCards([]), 800);

            } else {
                setTimeout(() => setSelectedCards([]), 800);
            }
        }
    };

    const renderCard = ({ item }) => {
        const isFlipped =
            selectedCards.find((c) => c.id === item.id) ||
            matchedPairs.includes(item.pairId);

        return (
            <TouchableOpacity
                style={[styles.card, { width: CARD_SIZE, height: CARD_SIZE }]}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.8}
                disabled={!!isFlipped}
            >
                {isFlipped ? (
                    item.type === 'image' ? (
                        <Image source={item.content} style={styles.image} />
                    ) : (
                        <Text style={styles.cardText}>{item.content}</Text>
                    )
                ) : (
                    <View style={styles.cardBack} />
                )}
            </TouchableOpacity>
        );
    };

    const formatTime = (ms) => {
        const sec = Math.floor(ms / 1000);
        const cent = Math.floor((ms % 1000) / 10);
        return `${sec}.${cent < 10 ? '0' : ''}${cent}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.timerText}>⏱️ Vrijeme: {formatTime(timer)} s</Text>

            <FlatList
                data={cards}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                numColumns={ACTUAL_NUM_COLUMNS}
                scrollEnabled={false}
                contentContainerStyle={styles.cardListContent}
            />

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalResultText, { marginBottom: 30 }]}>
                            Tvoj rezultat: {formatTime(timer)}
                        </Text>

                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                shuffleCards();
                                setMatchedPairs([]);
                                setSelectedCards([]);
                                setTimer(0);
                                startTimer();
                            }}
                            style={({ pressed }) => [
                                styles.modalButton,
                                { marginBottom: 20 },
                                pressed && { opacity: 0.6 },
                            ]}
                        >
                            <Text style={styles.modalButtonText}>Pokušaj ponovno</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('Ranking');
                            }}
                            style={({ pressed }) => [
                                styles.modalButton,
                                pressed && { opacity: 0.6 },
                            ]}
                        >
                            <Text style={styles.modalButtonText}>Rang lista</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 80,
        backgroundColor: '#e6f0ed',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: '#4a8a79',
        fontFamily: 'system-ui',
    },
    cardListContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: {
                maxWidth: MAX_GAME_WIDTH_WEB,
            },
        }),
    },
    card: {
        margin: CARD_MARGIN,
        borderRadius: 0,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#4a8a79',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 0,
        shadowColor: 'transparent',
    },
    cardBack: {
        backgroundColor: '#86b3a2',
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    image: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    cardText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a8a79',
        fontFamily: 'system-ui',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        padding: 30,
        borderRadius: 0,
        borderWidth: 2,
        borderColor: '#4a8a79',
        alignItems: 'center',
        width: '85%',
    },
    modalResultText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e4034',
        fontFamily: 'system-ui',
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: 'transparent',
        borderColor: '#4a8a79',
        borderWidth: 2,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 0,
        elevation: 0,
        shadowColor: 'transparent',
    },
    modalButtonText: {
        color: '#4a8a79',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'system-ui',
    },
});

export default GameScreen;
