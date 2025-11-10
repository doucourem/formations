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
  const [showSendMoney, setShowSendMoney] = useState(false); // ✅ Ajout
  const [editingTransaction, setEditingTransaction] = useState(null);

  // 🔹 Charger transactions + clients
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

  // 🔹 Actions CRUD
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
      {/* 🔹 Barre d’action principale */}
      {!showForm && !showSendMoney && (
        <View style={styles.header}>
          <Text style={styles.title}>Liste des Transactions</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="contained"
              icon="send"
              buttonColor="#3b82f6"
              textColor="white"
              onPress={() => {
                setShowForm(false);
                setShowSendMoney(true);
              }}
              style={styles.createButton}
            >
              Envoyer
            </Button>
            <Button
              mode="contained"
              icon="plus"
              buttonColor="#10b981"
              textColor="white"
              onPress={handleAdd}
              style={styles.createButton}
            >
              Créer
            </Button>
          </View>
        </View>
      )}

      {/* 🔹 Choix du contenu à afficher */}
      {showSendMoney ? (
        <SendMoneyForm
          refresh={fetchData}
          onClose={() => setShowSendMoney(false)}
        />
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

          {/* 🔹 Bouton flottant pour accès rapide */}
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
  container: { flex: 1, padding: 10, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { color: "#f8fafc", fontSize: 18, fontWeight: "bold" },
  createButton: { borderRadius: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#f8fafc", marginTop: 10 },
  card: {
    marginBottom: 10,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    elevation: 3,
  },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", paddingRight: 5 },
  clientName: { fontWeight: "bold", fontSize: 16, marginBottom: 5, color: "#f1f5f9" },
  text: { color: "#e2e8f0", marginVertical: 2 },
  amount: { fontWeight: "bold", color: "#10b981" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#94a3b8" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#10b981",
  },
});
