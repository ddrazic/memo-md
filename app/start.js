import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

const StartScreen = () => {
    const navigation = useNavigation();
    const [previous, setPrevious] = useState(null);
    const [best, setBest] = useState(null);

    const handleStart = () => {
        navigation.navigate('game');
    };

    const handleLeaderboard = () => {
        navigation.navigate('ranking');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace('index');
        } catch (error) {
            console.error('Greška pri odjavi:', error.message);
            Alert.alert('Greška', 'Neuspješna odjava. Pokušajte ponovno.');
        }
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
            <Text style={styles.title}>MEMO m.d.</Text>
            <Text style={styles.text}>Najbolji rezultat:</Text>
            <Text style={styles.resultText}>{formatTime(best)}</Text>

            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>START</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLeaderboard}>
                <Text style={styles.buttonText}>RANG LISTA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>ODJAVA</Text>
            </TouchableOpacity>
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
        padding: 20,
        backgroundColor: '#e6f0ed',
    },
    title: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#4a8a79',
        marginBottom: 40,
        fontFamily: 'monospace',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
        textAlign: 'center',
    },
    text: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: 'system-ui',
        color: '#757575',
    },
    resultText: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 50,
        fontFamily: 'system-ui',
        color: '#2e5c4d',
    },
    button: {
        width: '70%',
        height: 55,
        borderColor: '#4a8a79',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        marginTop: 15,
        backgroundColor: 'transparent',
        elevation: 0,
        shadowColor: 'transparent',
    },
    buttonText: {
        color: '#4a8a79',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'system-ui',
        letterSpacing: 1,
    },
    logoutButton: {
        width: '50%',
        height: 40,
        backgroundColor: '#dcebe8',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        marginTop: 60,
        borderWidth: 0,
        elevation: 0,
        shadowColor: 'transparent',
    },
    logoutButtonText: {
        color: '#4a8a79',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'system-ui',
        letterSpacing: 1,
    },
});

export default StartScreen;
