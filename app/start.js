import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Firebase Imports za odjavu
import { getAuth, signOut } from 'firebase/auth';
// !!! VAŽNO: Provjeri je li putanja do tvoje firebase.js ispravna u odnosu na ovu datoteku !!!
// Na primjer, ako je firebase.js u folderu 'config' pored 'app/screens', putanja bi bila '../../config/firebase'
// Ako je firebase.js u istom folderu kao i StartScreen.js, putanja './firebase' je ispravna.
import { app } from '../firebase'; // PRILAGODI OVU PUTANJU AKO JE POTREBNO

const auth = getAuth(app); // Inicijaliziraj auth instancu

const StartScreen = () => {
    const navigation = useNavigation();
    const [previous, setPrevious] = useState(null);
    const [best, setBest] = useState(null);

    const handleStart = () => {
        navigation.navigate('game');
    };

    const handleLeaderboard = () => {
        // Ovdje navigiraj na ekran s rang listom
        // Pretpostavljamo da imaš rutu 'leaderboard' definiranu u svojoj navigaciji
        navigation.navigate('ranking');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Nakon uspješne odjave, navigiraj natrag na ekran za prijavu (App/index.js)
            // Koristimo replace kako bi se korisnik ne mogao vratiti na start ekran pritiskom na back
            navigation.replace('index'); // 'App' bi trebala biti ruta za tvoj index.js
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
            <Text style={styles.text}>Najbolji rezultat: {formatTime(best)}</Text>

            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>START</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLeaderboard}>
                <Text style={styles.buttonText}>Rang lista</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Odjava</Text>
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
        padding: 16,
        backgroundColor: '#f8f8f8', // Dodana pozadina za konzistentnost
    },
    text: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20, // Povećan razmak
        fontFamily: 'monospace',
        color: '#333',
    },
    button: {
        width: '70%', // Malo širi gumbi
        height: 50,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 15, // Razmak između gumba
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#dc3545', // Crvena boja za gumb za odjavu
        marginTop: 30, // Veći razmak za gumb za odjavu
    },
});

export default StartScreen;
