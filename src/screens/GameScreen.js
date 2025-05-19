import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, FlatList } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const CARD_MARGIN = 5;
const NUM_COLUMNS = 4;

const CARD_SIZE = (screenWidth - CARD_MARGIN * 2 * NUM_COLUMNS - 20) / NUM_COLUMNS;


const imagePairs = [
    { id: '1', type: 'image', content: require('../../assets/firebase.png'), pairId: 'firebase' },
    { id: '2', type: 'text', content: 'Firebase', pairId: 'firebase' },

    { id: '3', type: 'image', content: require('../../assets/flutter.png'), pairId: 'flutter' },
    { id: '4', type: 'text', content: 'Flutter', pairId: 'flutter' },

    { id: '5', type: 'image', content: require('../../assets/java.png'), pairId: 'java' },
    { id: '6', type: 'text', content: 'Java', pairId: 'java' },

    { id: '7', type: 'image', content: require('../../assets/kotlin.png'), pairId: 'kotlin' },
    { id: '8', type: 'text', content: 'Kotlin', pairId: 'kotlin' },

    { id: '9', type: 'image', content: require('../../assets/python.png'), pairId: 'python' },
    { id: '10', type: 'text', content: 'Python', pairId: 'python' },

    { id: '11', type: 'image', content: require('../../assets/react.png'), pairId: 'react' },
    { id: '12', type: 'text', content: 'React', pairId: 'react' },

    { id: '13', type: 'image', content: require('../../assets/ruby.png'), pairId: 'ruby' },
    { id: '14', type: 'text', content: 'Ruby', pairId: 'ruby' },

    { id: '15', type: 'image', content: require('../../assets/sql.png'), pairId: 'sql' },
    { id: '16', type: 'text', content: 'SQL', pairId: 'sql' },

    { id: '17', type: 'image', content: require('../../assets/swift.png'), pairId: 'swift' },
    { id: '18', type: 'text', content: 'Swift', pairId: 'swift' },

    { id: '19', type: 'image', content: require('../../assets/vsc.png'), pairId: 'vsc' },
    { id: '20', type: 'text', content: 'VS Code', pairId: 'vsc' },
];

const GameScreen = () => {

    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);

    useEffect(() => {

        imagePairs
            .filter((item) => item.type === 'image')
            .forEach((item) => {
                Image.prefetch(Image.resolveAssetSource(item.content).uri);
            });

        shuffleCards();
    }, []);

    const shuffleCards = () => {

        const shuffled = [...imagePairs].sort(() => Math.random() - 0.5);
        setCards(shuffled);

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
                setMatchedPairs([...matchedPairs, newSelected[0].pairId]);
                setTimeout(() => setSelectedCards([]), 1000);
            } else {
                setTimeout(() => setSelectedCards([]), 1000);
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
                        <Text style={styles.text}>{item.content}</Text>
                    )
                ) : (
                    <View style={styles.cardBack} />
                )}
            </TouchableOpacity>
        );

    };

    return (
        <View style={styles.container}>
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


        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
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
    }

});

export default GameScreen;
