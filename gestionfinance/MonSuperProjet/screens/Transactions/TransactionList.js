
import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Text, FAB, IconButton, Card, Button } from "react-native-paper";
import api from "../../api/api";
import TransactionForm from "./TransactionForm";
import SendMoneyForm from "./SendMoneyForm";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchData = async () => {
    try {
      const [transRes, clientsRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/clients"),
      ]);
      setTransactions(transRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingTransaction(null);
    setShowSendMoney(false);
    setShowForm(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowSendMoney(false);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    Alert.alert("Supprimer", "Voulez-vous vraiment supprimer cette transaction ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/transactions/${id}`);
            fetchData();
          } catch (err) {
            console.log(err);
            Alert.alert("Erreur", "Impossible de supprimer la transaction");
          }
        },
      },
    ]);
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Client inconnu";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!showForm && !showSendMoney && (
        <View style={styles.header}>
          <Text style={styles.title}>💳 Liste des Transactions</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="contained"
              icon="send"
              buttonColor="#2563eb"
              textColor="white"
              onPress={() => {
                setShowForm(false);
                setShowSendMoney(true);
              }}
              style={styles.actionButton}
            >
              Envoyer
            </Button>
            <Button
              mode="contained"
              icon="plus"
              buttonColor="#10b981"
              textColor="white"
              onPress={handleAdd}
              style={styles.actionButton}
            >
              Créer
            </Button>
          </View>
        </View>
      )}

      {showSendMoney ? (
        <SendMoneyForm refresh={fetchData} onClose={() => setShowSendMoney(false)} />
      ) : showForm ? (
        <TransactionForm
          transaction={editingTransaction}
          refresh={fetchData}
          onClose={() => setShowForm(false)}
        />
      ) : (
        <>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>Aucune transaction enregistrée</Text>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.clientName}>👤 {getClientName(item.client_id)}</Text>
                    <Text style={styles.text}>📞 {item.phone_number}</Text>
                    <Text style={[styles.text, styles.amount]}>
                      💰 {item.amount_fcfa} FCFA
                    </Text>
                    <Text style={styles.text}>📄 Type : {item.type}</Text>
                  </Card.Content>

                  <Card.Actions style={styles.cardActions}>
                    <IconButton
                      icon="pencil"
                      iconColor="#22c55e"
                      size={22}
                      onPress={() => handleEdit(item)}
                    />
                    <IconButton
                      icon="delete"
                      iconColor="#ef4444"
                      size={22}
                      onPress={() => handleDelete(item.id)}
                    />
                  </Card.Actions>
                </Card>
              )}
            />
          )}

          <FAB
            icon="plus"
            label="Ajouter"
            onPress={handleAdd}
            style={styles.fab}
            color="white"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#0f172a", // bleu nuit profond
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "bold",
  },
  actionButton: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#e2e8f0", marginTop: 10 },
  card: {
    marginBottom: 10,
    backgroundColor: "#1e293b", // gris bleuté
    borderRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", paddingRight: 5 },
  clientName: { fontWeight: "bold", fontSize: 16, marginBottom: 5, color: "#f8fafc" },
  text: { color: "#cbd5e1", marginVertical: 2 },
  amount: { fontWeight: "bold", color: "#10b981" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#94a3b8", fontSize: 16 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#10b981",
    elevation: 5,
    borderRadius: 30,
  },
});
