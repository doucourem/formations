// WholesalerTransactionsList.js
import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Card, Text, List, Provider as PaperProvider, Button, Dialog, Portal, TextInput } from "react-native-paper";
import supabase from "../supabaseClient";

const formatCFA = (amount) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount);

export default function WholesalerTransactionsList({ wholesalerId }) {
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");

  useEffect(() => {
    if (wholesalerId) fetchTransactions();
  }, [wholesalerId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("wholesaler_transactions")
        .select("*")
        .eq("wholesaler_id", Number(wholesalerId))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error("Erreur chargement transactions:", err.message);
    }
  };

  const createTransaction = async () => {
    if (!amount) {
      alert("Veuillez entrer un montant");
      return;
    }

    if (!wholesalerId) {
      alert("ID du vendeur manquant");
      return;
    }

    try {
      const { error } = await supabase.from("wholesaler_transactions").insert([
        {
          wholesaler_id: Number(wholesalerId),
          amount: parseFloat(amount),
          type,
        },
      ]);

      if (error) throw error;

      setAmount("");
      setType("CREDIT");
      setOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error("Erreur création transaction:", err.message);
      alert("Erreur lors de la création");
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Transactions du vendeur
        </Text>

        <Button
          mode="contained"
          onPress={() => setOpen(true)}
          style={styles.addButton}
          icon="plus"
        >
          Nouvelle transaction
        </Button>

        {transactions.length === 0 ? (
          <Text style={styles.noDataText}>Aucune transaction trouvée</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Content>
                  <List.Item
                    title={`${formatCFA(item.amount)} (${item.type})`}
                    description={`Date: ${new Date(item.created_at).toLocaleString()}`}
                    left={() => <List.Icon icon="cash-multiple" color="#10b981" />}
                  />
                </Card.Content>
              </Card>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title>Créer une transaction</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Montant en CFA"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => setAmount(text)}
                style={styles.input}
              />

              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                <Button
                  mode={type === "CREDIT" ? "contained" : "outlined"}
                  onPress={() => setType("CREDIT")}
                  style={styles.typeButton}
                >
                  Crédit
                </Button>
                <Button
                  mode={type === "DEBIT" ? "contained" : "outlined"}
                  onPress={() => setType("DEBIT")}
                  style={styles.typeButton}
                >
                  Débit
                </Button>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpen(false)}>Annuler</Button>
              <Button onPress={createTransaction} mode="contained">
                Créer
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0A0F1A",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#F8FAFC",
  },
  addButton: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 12,
    backgroundColor: "#1E293B",
    elevation: 4,
  },
  noDataText: {
    textAlign: "center",
    color: "#CBD5E1",
    marginTop: 40,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    color: "#F8FAFC",
    marginBottom: 8,
    fontSize: 16,
  },
  typeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
