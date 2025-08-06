import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const RankingScreen = () => {
    const navigation = useNavigation();
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            setError('');
            try {
                const usersRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersRef);

                let usersWithScores = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.username && typeof data.bestResult === 'number') {
                        usersWithScores.push({
                            id: doc.id,
                            username: data.username,
                            bestResult: data.bestResult,
                        });
                    }
                });

                usersWithScores.sort((a, b) => a.bestResult - b.bestResult);

                setRankingData(usersWithScores);
            } catch (err) {
                console.error("Greška pri dohvatu rang liste:", err);
                setError("Nismo uspjeli dohvatiti rang listu. Pokušajte ponovno.");
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, []);

    const formatTime = (ms) => {
        if (!ms) return '—';
        const sec = Math.floor(ms / 1000);
        const cent = Math.floor((ms % 1000) / 10);
        return `${sec}.${cent < 10 ? '0' : ''}${cent} sekundi`;
    };

    const renderRankingItem = ({ item, index }) => (
        <View style={styles.rankingItem}>
            <Text style={styles.rankText}>{index + 1}.</Text>
            <Text style={styles.usernameText}>{item.username}</Text>
            <Text style={styles.scoreText}>{formatTime(item.bestResult)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rang lista</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : rankingData.length === 0 ? (
                <Text style={styles.noDataText}>Još nema rezultata na rang listi. Budi prvi!</Text>
            ) : (
                <FlatList
                    data={rankingData}
                    renderItem={renderRankingItem}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Natrag</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#e6f0ed',
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
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
    list: {
        width: '100%',
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    rankingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 0,
        borderWidth: 2,
        borderColor: '#86b3a2',
        marginBottom: 10,
        elevation: 0,
        shadowColor: 'transparent',
    },
    rankText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a8a79',
        width: 30,
        fontFamily: 'monospace',
    },
    usernameText: {
        flex: 1,
        fontSize: 18,
        color: '#757575',
        fontWeight: '600',
        fontFamily: 'monospace',
        marginLeft: 10,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e4034',
        marginLeft: 10,
        fontFamily: 'monospace',
    },
    loadingText: {
        fontSize: 18,
        color: '#757575',
        fontFamily: 'monospace',
    },
    errorText: {
        color: '#e57373',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'monospace',
    },
    noDataText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginTop: 50,
        fontFamily: 'monospace',
    },
    backButton: {
        backgroundColor: 'transparent',
        borderColor: '#4a8a79',
        borderWidth: 2,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 0,
        marginTop: 30,
        elevation: 0,
        shadowColor: 'transparent',
    },
    backButtonText: {
        color: '#4a8a79',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
});

export default RankingScreen;
