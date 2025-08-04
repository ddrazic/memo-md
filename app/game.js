import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Pressable } from 'react-native';


const screenWidth = Dimensions.get('window').width;

const CARD_MARGIN = 5;
const NUM_COLUMNS = 4;

const CARD_SIZE = (screenWidth - CARD_MARGIN * 2 * NUM_COLUMNS - 20) / NUM_COLUMNS;


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

    const [modalVisible, setModalVisible] = useState(false);
    const [intervalId, setIntervalId] = useState(null);

    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);

    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        shuffleCards();
        startTimer();
        return stopTimer;
    }, []);

    // ⏱️ Start i stop funkcije za štopericu
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
            clearInterval(intervalId);
            AsyncStorage.setItem('previousResult', timer.toString());
            checkBestResult();
            setModalVisible(true);
        }
    }, [matchedPairs]);

    const checkBestResult = async () => {
        const best = await AsyncStorage.getItem('bestResult');
        if (!best || timer < parseInt(best)) {
            await AsyncStorage.setItem('bestResult', timer.toString());
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

                // ✅ Provjeri kraj igre
                if (newMatchedPairs.length === imagePairs.length / 2) {
                    stopTimer();
                    saveResult(timer);
                }
            } else {
                setTimeout(() => setSelectedCards([]), 800);
            }
        }
    };

    const saveResult = async (finalTime) => {
        await AsyncStorage.setItem('previousResult', finalTime.toString());
        const best = await AsyncStorage.getItem('bestResult');
        if (!best || finalTime < parseInt(best)) {
            await AsyncStorage.setItem('bestResult', finalTime.toString());
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
                        <Text style={styles.text}>{item.content}</Text>
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
                numColumns={4}
                scrollEnabled={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            />

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.text, { marginBottom: 30 }]}>
                            Tvoj rezultat: {formatTime(timer)}
                        </Text>

                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                shuffleCards();
                                setMatchedPairs([]);
                                setSelectedCards([]);
                                setTimer(0);
                                const id = setInterval(() => setTimer(prev => prev + 10), 10);
                                setIntervalId(id);
                            }}
                            style={({ pressed }) => [
                                styles.modalButton,
                                { marginBottom: 20 },
                                pressed && { opacity: 0.6 },
                            ]}
                        >
                            <Text>Pokušaj ponovno</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('ranking');
                            }}
                            style={({ pressed }) => [
                                styles.modalButton,
                                pressed && { opacity: 0.6 },
                            ]}
                        >
                            <Text>Rang lista</Text>
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
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    timerText: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#2c3e50',
    },
    card: {
        margin: CARD_MARGIN,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#42515a',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },

    cardBack: {
        backgroundColor: '#42515a',
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },

    image: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },

    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    modalContent: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },

    modalButton: {
        fontSize: 18,
        color: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#42515a',
        textAlign: 'center',
    },

});

export default GameScreen;
