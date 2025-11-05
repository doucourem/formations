import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import api from '../../api/api';
import TransactionForm from './TransactionForm';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = () => {
    setEditingTransaction(null);
    setShowForm(!showForm);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/transactions/${id}`);
              fetchTransactions();
            } catch (err) {
              console.log(err);
              Alert.alert('Erreur', 'Impossible de supprimer la transaction');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Button title={showForm ? "Annuler" : "Ajouter Transaction"} onPress={handleAdd} />
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          refresh={fetchTransactions}
          onClose={() => setShowForm(false)}
        />
      )}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Montant: {item.amount}</Text>
            <Text>Type: {item.type}</Text>
            <View style={styles.buttons}>
              <Button title="Modifier" onPress={() => handleEdit(item)} />
              <Button title="Supprimer" onPress={() => handleDelete(item.id)} color="red" />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { padding: 15, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
