import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,

    signInWithEmailAndPassword
} from 'firebase/auth';

import { app, db } from '../firebase';


const auth = getAuth(app);


const LoginScreen = () => {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {

            if (user) {

                navigation.replace('start', { userId: user.uid });
            }

        });

        return unsubscribe;
    }, [navigation]);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {

            await signInWithEmailAndPassword(auth, email, password);
            console.log('Korisnik uspješno prijavljen!');
        } catch (err) {
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

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        if (!username.trim()) {
            setError('Korisničko ime ne može biti prazno.');
            setLoading(false);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email,
                createdAt: new Date()
            });

            console.log('Korisnik registriran i korisničko ime spremljeno:', user.uid);
        } catch (err) {
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
                    MEMO m.d.
                </Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="E-pošta"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                />

                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Lozinka"
                    secureTextEntry
                    placeholderTextColor="#999"
                />

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

                <TouchableOpacity
                    style={styles.button}
                    onPress={isRegistering ? handleRegister : handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{isRegistering ? 'Registracija' : 'Prijava'}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>
                        {isRegistering ? 'Već imate račun?' : 'Nemate račun?'}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                        setEmail('');
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
        backgroundColor: '#e6f0ed',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#4a8a79',
        marginBottom: 40,
        fontFamily: 'system-ui',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
        textAlign: 'center',
    },
    input: {
        width: '85%',
        height: 50,
        borderColor: '#4a8a79',
        borderWidth: 2,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderRadius: 0,
        backgroundColor: '#ffffff',
        fontSize: 16,
        color: '#4a8a79',
        fontFamily: 'system-ui',
    },
    button: {
        width: '85%',
        height: 50,
        borderColor: '#4a8a79',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        marginTop: 15,
        backgroundColor: 'transparent',
    },
    buttonText: {
        color: '#4a8a79',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'system-ui',
        letterSpacing: 1,
    },
    errorText: {
        color: '#e57373',
        marginBottom: 15,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'system-ui',
    },
    toggleContainer: {
        flexDirection: 'row',
        marginTop: 30,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 16,
        color: '#757575',
        fontFamily: 'system-ui',
    },
    toggleButtonText: {
        fontSize: 16,
        color: '#42a5f5',
        fontWeight: 'bold',
        marginLeft: 5,
        fontFamily: 'system-ui',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
