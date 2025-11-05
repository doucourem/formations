import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../../api/api';

export default function BalanceHistory() {
  const [history, setHistory] = useState([]);

  const fetchBalance = async () => {
    try {
      const res = await api.get('/balance');
      setHistory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Montant: {item.amount}</Text>
            <Text>Type: {item.type}</Text>
            <Text>Date: {new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { padding: 15, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
});
