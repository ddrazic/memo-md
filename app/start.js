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
            <Text style={styles.title}>MEMO</Text> {/* Dodan naslov za konzistentnost */}
            <Text style={styles.text}>Najbolji rezultat:</Text>
            <Text style={styles.resultText}>{formatTime(best)}</Text>

            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>START</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLeaderboard}>
                <Text style={styles.buttonText}>RANG LISTA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}> {/* Koristi samo logoutButton stil */}
                <Text style={styles.logoutButtonText}>ODJAVA</Text> {/* Koristi logoutButtonText stil */}
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
        backgroundColor: '#e6f0ed', // Vrlo svijetla pastelno plavo-zelena pozadina (blizu #b8e0d2)
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4a8a79', // Tamnija varijacija #b8e0d2
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
        fontFamily: 'monospace',
        color: '#757575', // Srednje siva
    },
    resultText: {
        fontSize: 36, // Povećan font za isticanje
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 50, // Povećan razmak ispod rezultata
        fontFamily: 'monospace',
        color: '#2e5c4d', // Još tamnija varijacija zelene za isticanje
    },
    button: {
        width: '70%',
        height: 55,
        borderColor: '#4a8a79', // Tamnija varijacija #b8e0d2
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
        color: '#4a8a79', // Tamnija varijacija #b8e0d2
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    logoutButton: { // Novi stil za gumb za odjavu
        width: '50%', // Manja širina
        height: 40, // Manja visina
        backgroundColor: '#dcebe8', // Svjetlija pozadina (blizu pozadine ekrana)
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        marginTop: 60, // Povećan razmak za spuštanje
        borderWidth: 0, // Bez okvira
        elevation: 0,
        shadowColor: 'transparent',
    },
    logoutButtonText: { // Novi stil teksta za gumb za odjavu
        color: '#4a8a79', // Tamnija varijacija #b8e0d2 (isti kao ostali gumbi za dosljednost)
        fontSize: 16, // Manji font
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
});

export default StartScreen;
