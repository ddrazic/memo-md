import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';

const LoginScreen = ({ onToggleScreen }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                Alert.alert("Greška", "Molimo unesite email i lozinku.");
                return;
            }
            await signInWithEmailAndPassword(auth, email, password);
            navigation.navigate('start');
        } catch (error) {
            Alert.alert("Greška kod prijave", error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
        >
            <Text style={styles.title}>Dobrodošli u{"\n"}MEMO m.d.!</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="E-pošta"
                    placeholderTextColor="#34656d67"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Lozinka"
                    placeholderTextColor="#34656d67"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Prijava</Text>
            </TouchableOpacity>
            <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleText}>Nemate račun?</Text>
                <TouchableOpacity onPress={onToggleScreen}>
                    <Text style={[styles.toggleText, styles.linkText]}>Registracija</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const RegisterScreen = ({ onToggleScreen }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigation = useNavigation();

    const handleRegister = async () => {
        try {
            if (!email || !password || !username) {
                Alert.alert("Greška", "Molimo popunite sva polja.");
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                username: username,
                bestScore: null,
                timestamp: new Date()
            });
            navigation.navigate('start');
        } catch (error) {
            Alert.alert("Greška kod registracije", error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
        >
            <Text style={styles.title}>Dobrodošli u{"\n"}MEMO!</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="E-pošta"
                    placeholderTextColor="#34656d67"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Lozinka"
                    placeholderTextColor="#34656d67"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Korisničko ime"
                    placeholderTextColor="#34656d67"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Registracija</Text>
            </TouchableOpacity>
            <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleText}>Već imate račun?</Text>
                <TouchableOpacity onPress={onToggleScreen}>
                    <Text style={[styles.toggleText, styles.linkText]}>Prijava</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default function App() {
    const [isLoginScreen, setIsLoginScreen] = useState(true);

    const toggleScreen = () => {
        setIsLoginScreen(!isLoginScreen);
    };

    return (
        <View style={styles.appContainer}>
            {isLoginScreen ? (
                <LoginScreen onToggleScreen={toggleScreen} />
            ) : (
                <RegisterScreen onToggleScreen={toggleScreen} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#E7F2F1',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#34656D',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 40,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#34656D',
        width: '100%',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toggleTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    toggleText: {
        color: '#888',
        fontSize: 16,
        marginRight: 5,
    },
    linkText: {
        color: '#34656D',
        fontWeight: 'bold',
    },
});
