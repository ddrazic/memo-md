import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Firebase Imports
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // PRILAGODI OVU PUTANJU AKO JE POTREBNO

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
                // Dohvaćamo sve korisnike. Sortiranje i filtriranje radimo klijentski
                // jer Firestore orderBy() zahtijeva indeks, a za dinamičko sortiranje
                // po najboljem vremenu bez indeksa je jednostavnije klijentski.
                const querySnapshot = await getDocs(usersRef);

                let usersWithScores = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Provjeravamo ima li korisnik 'bestResult' i je li broj
                    if (data.username && typeof data.bestResult === 'number') {
                        usersWithScores.push({
                            id: doc.id,
                            username: data.username,
                            bestResult: data.bestResult,
                        });
                    }
                });

                // Sortiraj rezultate: najkraće vrijeme je najbolje (uzlazno)
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
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        fontFamily: 'monospace',
    },
    list: {
        width: '100%',
    },
    listContent: {
        paddingBottom: 20,
    },
    rankingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    rankText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        width: 30, // Fiksna širina za rang
    },
    usernameText: {
        flex: 1, // Zauzima preostali prostor
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff', // Plava boja za rezultat
        marginLeft: 10,
    },
    loadingText: {
        fontSize: 18,
        color: '#555',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    noDataText: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginTop: 50,
    },
    backButton: {
        backgroundColor: '#6c757d', // Siva boja za natrag
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    backButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RankingScreen;
