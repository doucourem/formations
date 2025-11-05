import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import {
  Card,
  Text,
  List,
  Provider as PaperProvider,
  Button,
  Dialog,
  Portal,
  TextInput,
  DefaultTheme,
} from "react-native-paper";
import supabase from "../supabaseClient";

// Format montant en CFA
const formatCFA = (amount) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount);

// Thème sombre optimisé
const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#10b981",   // vert pour Crédit / Paiement
    accent: "#EF4444",    // rouge pour Débit / Demande de fonds
    background: "#0A0F1A",
    surface: "#1E293B",
    text: "#F8FAFC",
    placeholder: "#CBD5E1",
    disabled: "#64748B",
    backdrop: "rgba(0,0,0,0.5)",
  },
};

export default function WholesalerTransactionsList({ route }) {
  const { wholesalerId, wholesalerName } = route.params || {};
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
    if (!amount) return alert("Veuillez entrer un montant");
    if (!wholesalerId) return alert("ID du vendeur manquant");

    try {
      const { error } = await supabase.from("wholesaler_transactions").insert([
        { wholesaler_id: Number(wholesalerId), amount: parseFloat(amount), type },
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
    <PaperProvider theme={darkTheme}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Transactions du vendeur: {wholesalerName || ""}
        </Text>

        <Button
          mode="contained"
          onPress={() => setOpen(true)}
          style={styles.addButton}
          icon="plus"
          textColor={darkTheme.colors.surface}
        >
          Nouvelle transaction
        </Button>

        {transactions.length === 0 ? (
          <Text style={styles.noDataText}>Aucune transaction trouvée</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const displayType = item.type === "CREDIT" ? "Paiement" : "Demande de fonds";
              const iconColor = item.type === "CREDIT" ? darkTheme.colors.primary : darkTheme.colors.accent;

              return (
                <Card style={styles.card}>
                  <Card.Content>
                    <List.Item
                      title={`${formatCFA(item.amount)} (${displayType})`}
                      titleStyle={{ color: darkTheme.colors.text, fontWeight: "bold" }}
                      description={`Date: ${new Date(item.created_at).toLocaleString()}`}
                      descriptionStyle={{ color: darkTheme.colors.placeholder }}
                      left={() => <List.Icon icon="cash-multiple" color={iconColor} />}
                    />
                  </Card.Content>
                </Card>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title style={{ color: darkTheme.colors.text }}>Créer une transaction</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Montant en CFA"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
                textColor={darkTheme.colors.text}
                placeholderTextColor={darkTheme.colors.placeholder}
              />
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                <Button
                  mode={type === "CREDIT" ? "contained" : "outlined"}
                  onPress={() => setType("CREDIT")}
                  style={[
                    styles.typeButton,
                    type === "CREDIT" && { backgroundColor: darkTheme.colors.primary },
                  ]}
                  textColor={type === "CREDIT" ? darkTheme.colors.surface : darkTheme.colors.primary}
                >
                  Paiement
                </Button>
                <Button
                  mode={type === "DEBIT" ? "contained" : "outlined"}
                  onPress={() => setType("DEBIT")}
                  style={[
                    styles.typeButton,
                    type === "DEBIT" && { backgroundColor: darkTheme.colors.accent },
                  ]}
                  textColor={type === "DEBIT" ? darkTheme.colors.surface : darkTheme.colors.accent}
                >
                  Demande de fonds
                </Button>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpen(false)} textColor={darkTheme.colors.primary}>
                Annuler
              </Button>
              <Button onPress={createTransaction} mode="contained" textColor={darkTheme.colors.surface}>
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
  container: { flex: 1, padding: 16, backgroundColor: darkTheme.colors.background },
  title: { textAlign: "center", marginBottom: 20, fontWeight: "bold", color: darkTheme.colors.text },
  addButton: { marginBottom: 20 },
  card: { marginBottom: 12, backgroundColor: darkTheme.colors.surface, elevation: 4 },
  noDataText: { textAlign: "center", color: darkTheme.colors.placeholder, marginTop: 40, fontSize: 16 },
  input: { marginBottom: 16, backgroundColor: darkTheme.colors.surface },
  label: { color: darkTheme.colors.text, marginBottom: 8, fontSize: 16 },
  typeButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  typeButton: { flex: 1, marginHorizontal: 4 },
});
