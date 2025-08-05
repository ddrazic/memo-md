import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Firebase Imports
// Provjeri jesi li instalirao firebase: npm install firebase
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged // Za slušanje promjena stanja autentifikacije
    ,
    signInWithEmailAndPassword
} from 'firebase/auth';

// Uvezi svoju inicijaliziranu Firebase aplikaciju i bazu podataka iz firebase.js
// !!! VAŽNO: Provjeri je li putanja do tvoje firebase.js ispravna u odnosu na ovu datoteku !!!
// Na primjer, ako je firebase.js u folderu 'config' pored 'app', putanja bi bila '../config/firebase'
// Ako je firebase.js u istom folderu kao i ovaj fajl, putanja './firebase' je ispravna.
import { app, db } from '../firebase'; // PRILAGODI OVU PUTANJU AKO JE POTREBNO

// Inicijaliziraj Auth koristeći uvezeni 'app'
const auth = getAuth(app);

// Preimenovana komponenta iz LoginScreen u App
const LoginScreen = () => { // Komponenta sada nazvana App
    const navigation = useNavigation();

    // Stanja za polja obrasca za prijavu/registraciju
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Koristi se samo za registraciju
    const [isRegistering, setIsRegistering] = useState(false); // Prebacivanje između obrasca za prijavu i registraciju
    const [error, setError] = useState(''); // Za prikaz poruka o pogreškama
    const [loading, setLoading] = useState(false); // Za prikaz indikatora učitavanja

    // Slušaj promjene stanja autentifikacije
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Ako je korisnik prijavljen, navigiraj na 'start' ekran
            if (user) {
                // Opcionalno dohvati korisničko ime iz Firestore-a ako ga želiš proslijediti
                // Radi jednostavnosti, samo ćemo navigirati. Možeš ovo proširiti za dohvat korisničkih podataka.
                navigation.replace('start', { userId: user.uid }); // Proslijedi ID korisnika ili druge relevantne informacije
            }
            // Ako nema korisnika, ostani na ekranu za prijavu
        });

        // Očisti pretplatu prilikom odmontiranja komponente
        return unsubscribe;
    }, [navigation]);

    /**
     * Rukuje procesom prijave korisnika koristeći e-poštu i lozinku.
     */
    const handleLogin = async () => {
        setLoading(true);
        setError(''); // Očisti prethodne pogreške
        try {
            // Prijavi korisnika s e-poštom i lozinkom
            await signInWithEmailAndPassword(auth, email, password);
            // Ako je uspješno, onAuthStateChanged listener će rukovati navigacijom
            console.log('Korisnik uspješno prijavljen!');
        } catch (err) {
            // Rukovanje raznim Firebase autentifikacijskim pogreškama
            let errorMessage = 'Neuspješna prijava. Provjerite svoje vjerodajnice.';
            if (err.code === 'auth/invalid-email') {
                errorMessage = 'Nevažeća adresa e-pošte.';
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = 'Nevažeća e-pošta ili lozinka.';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Previše pokušaja prijave. Pokušajte ponovno kasnije.';
            }
            setError(errorMessage);
            console.error('Pogreška pri prijavi:', err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Rukuje procesom registracije korisnika.
     * Stvara novog korisnika s e-poštom i lozinkom, zatim sprema korisničko ime u Firestore.
     */
    const handleRegister = async () => {
        setLoading(true);
        setError(''); // Očisti prethodne pogreške
        if (!username.trim()) {
            setError('Korisničko ime ne može biti prazno.');
            setLoading(false);
            return;
        }
        try {
            // Stvori novog korisnika s e-poštom i lozinkom
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Spremi korisničko ime u Firestore pod kolekcijom 'users'
            // ID dokumenta bit će UID korisnika (jedinstveni ID iz Firebase Autentifikacije)
            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email,
                createdAt: new Date()
            });

            console.log('Korisnik registriran i korisničko ime spremljeno:', user.uid);
            // Ako je uspješno, onAuthStateChanged listener će rukovati navigacijom
        } catch (err) {
            // Rukovanje raznim Firebase autentifikacijskim pogreškama tijekom registracije
            let errorMessage = 'Neuspješna registracija. Pokušajte ponovno.';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Ova e-pošta je već u upotrebi.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Nevažeća adresa e-pošte.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Lozinka bi trebala imati najmanje 6 znakova.';
            }
            setError(errorMessage);
            console.error('Pogreška pri registraciji:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>
                    Dobrodošli u MEMO!
                </Text>

                {/* Prikaz poruke o pogrešci ako postoji */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Unos za e-poštu */}
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="E-pošta"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                />

                {/* Unos za lozinku */}
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Lozinka"
                    secureTextEntry // Skriva znakove lozinke
                    placeholderTextColor="#999"
                />

                {/* Uvjetno renderiranje za unos korisničkog imena (samo za registraciju) */}
                {isRegistering && (
                    <TextInput
                        style={styles.input}
                        onChangeText={setUsername}
                        value={username}
                        placeholder="Korisničko ime"
                        autoCapitalize="words"
                        placeholderTextColor="#999"
                    />
                )}

                {/* Glavni akcijski gumb (Prijava ili Registracija) */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={isRegistering ? handleRegister : handleLogin}
                    disabled={loading} // Onemogući gumb tijekom učitavanja
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{isRegistering ? 'Registracija' : 'Prijava'}</Text>
                    )}
                </TouchableOpacity>

                {/* Prebacivanje između prijave i registracije */}
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>
                        {isRegistering ? 'Već imate račun?' : 'Nemate račun?'}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        setIsRegistering(!isRegistering);
                        setError(''); // Očisti pogreške prilikom prebacivanja
                        setEmail(''); // Očisti polja prilikom prebacivanja
                        setPassword('');
                        setUsername('');
                    }}>
                        <Text style={styles.toggleButtonText}>
                            {isRegistering ? 'Prijava' : 'Registracija'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f0ed', // Vrlo svijetla pastelno plavo-zelena pozadina (blizu #b8e0d2)
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4a8a79', // Tamnija varijacija #b8e0d2
    marginBottom: 40,
    fontFamily: 'monospace',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.1)', // Vrlo blaga sjena
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    textAlign: 'center',
  },
  input: {
    width: '85%',
    height: 50,
    borderColor: '#4a8a79', // Tamnija varijacija #b8e0d2
    borderWidth: 2,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 0,
    backgroundColor: '#ffffff', // Čista bijela pozadina inputa
    fontSize: 16,
    color: '#4a8a79', // Tamnija varijacija #b8e0d2
    fontFamily: 'monospace',
  },
  button: {
    width: '85%',
    height: 50,
    borderColor: '#4a8a79', // Tamnija varijacija #b8e0d2
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    marginTop: 15,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#4a8a79', // Tamnija varijacija #b8e0d2
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  errorText: {
    color: '#e57373', // Pastelno crvena za pogreške
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#757575', // Srednje siva
    fontFamily: 'monospace',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#42a5f5', // Mekana plava za link
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; // Sada izvozi App kao default
