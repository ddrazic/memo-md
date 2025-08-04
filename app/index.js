import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [username, setUsername] = React.useState('');

    const handleLogin = () => {
        if (username.trim() !== '') {
            navigation.navigate('start', { username });
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>
                    Welcome to MEMO!{'\n'}
                    Enter username: {'\n'}
                </Text>

                <TextInput
                    style={styles.input}
                    onChangeText={setUsername}
                    value={username}
                    placeholder="Username"
                />
                <Button title="Let's go!" onPress={handleLogin} />
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },

    input: {
        width: 250,
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        textAlign: 'center',
    },

    text: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'monospace',
    }
});


export default LoginScreen;
