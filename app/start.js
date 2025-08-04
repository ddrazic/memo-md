import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';

const StartScreen = () => {
    const navigation = useNavigation();
    const [previous, setPrevious] = useState(null);
    const [best, setBest] = useState(null);

    const handleStart = () => {
        navigation.navigate('game');
    };

    useEffect(() => {
        const fetchResults = async () => {
            const prev = await AsyncStorage.getItem('previousResult');
            const best = await AsyncStorage.getItem('bestResult');
            setPrevious(prev);
            setBest(best);
        };
        fetchResults();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Najbolji rezultat: {formatTime(best)}</Text>
            <Button title="START" onPress={handleStart} />
        </View>
    );
};

const formatTime = (ms) => {
    if (!ms) return '—';
    const sec = Math.floor(ms / 1000);
    const cent = Math.floor((ms % 1000) / 10);
    return `${sec}.${cent < 10 ? '0' : ''}${cent} sekundi`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,

    },
    text: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'monospace',
    },
});

export default StartScreen;
