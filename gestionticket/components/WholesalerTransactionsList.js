import React, { useState, useEffect } from "react";
import { View, SectionList, StyleSheet } from "react-native";
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
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);

// Thème sombre
const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#10b981", // vert
    accent: "#EF4444", // rouge
    background: "#0A0F1A",
    surface: "#1E293B",
    text: "#F8FAFC",
    placeholder: "#CBD5E1",
  },
};

export default function WholesalerTransactionsList({ route }) {
  const { wholesalerId, wholesalerName } = route.params || {};
  const [transactions, setTransactions] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState([]);
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
      groupByDate(data || []);
    } catch (err) {
      console.error("Erreur chargement transactions:", err.message);
    }
  };

  const groupByDate = (data) => {
    const grouped = data.reduce((acc, tx) => {
      const dateKey = new Date(tx.created_at).toLocaleDateString("fr-FR");
      if (!acc[dateKey])
        acc[dateKey] = {
          transactions: [],
          totalCredit: 0,
          totalDebit: 0,
        };

      acc[dateKey].transactions.push(tx);

      const amount = Number(tx.amount);
      if (tx.type === "CREDIT") acc[dateKey].totalCredit += amount;
      else if (tx.type === "DEBIT") acc[dateKey].totalDebit += amount;

      return acc;
    }, {});

    const sections = Object.keys(grouped).map((date) => ({
      title: date,
      data: grouped[date].transactions,
      totalCredit: grouped[date].totalCredit,
      totalDebit: grouped[date].totalDebit,
    }));

    setGroupedTransactions(sections);
  };

  const createTransaction = async () => {
    if (!amount) return alert("Veuillez entrer un montant");
    if (!wholesalerId) return alert("ID du vendeur manquant");

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

  // Totaux globaux
  const totalPaiement = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDemande = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalPaiement - totalDemande;
  const cardBg = totalBalance >= 0 ? "#064e3b" : "#7f1d1d";

  return (
    <PaperProvider theme={darkTheme}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Transactions du vendeur : {wholesalerName || ""}
        </Text>

        {/* Résumé global */}
        <Card style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Résumé global</Text>
            <Text style={[styles.summaryText, { color: darkTheme.colors.primary }]}>
              💰 Paiements : {formatCFA(totalPaiement)}
            </Text>
            <Text style={[styles.summaryText, { color: darkTheme.colors.accent }]}>
              📤 Demandes : {formatCFA(totalDemande)}
            </Text>
            <Text
              style={[
                styles.summaryBalance,
                { color: totalBalance >= 0 ? "#10b981" : "#EF4444" },
              ]}
            >
              ⚖️ VOTRE DETTE : {formatCFA(totalBalance)}
            </Text>
          </Card.Content>
        </Card>

        {/* Bouton ajout */}
        <Button
          mode="contained"
          onPress={() => setOpen(true)}
          style={styles.addButton}
          icon="plus"
          textColor={darkTheme.colors.surface}
        >
          Nouvelle transaction
        </Button>

        {/* Liste groupée par jour */}
        {groupedTransactions.length === 0 ? (
          <Text style={styles.noDataText}>Aucune transaction trouvée</Text>
        ) : (
          <SectionList
            sections={groupedTransactions}
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            renderSectionHeader={({ section }) => {
              const dailyBalance = section.totalCredit - section.totalDebit;
              const balanceColor = dailyBalance >= 0 ? "#10b981" : "#EF4444";

              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={[styles.sectionInfo, { color: darkTheme.colors.primary }]}>
                    Paiements : {formatCFA(section.totalCredit)}
                  </Text>
                  <Text style={[styles.sectionInfo, { color: darkTheme.colors.accent }]}>
                    Demandes : {formatCFA(section.totalDebit)}
                  </Text>
                  <Text style={[styles.sectionBalance, { color: balanceColor }]}>
                    Balance journalière : {formatCFA(dailyBalance)}
                  </Text>
                </View>
              );
            }}
            renderItem={({ item }) => {
              const isCredit = item.type === "CREDIT";
              const color = isCredit ? "#10b981" : "#EF4444";

              return (
                <Card style={styles.card}>
                  <Card.Content>
                    <List.Item
                      title={`${isCredit ? "➕" : "➖"} ${formatCFA(item.amount)}`}
                      titleStyle={{ color, fontWeight: "bold" }}
                      description={`Type : ${
                        item.type === "CREDIT" ? "Paiement" : "Demande de fonds"
                      } | Heure : ${new Date(
                        item.created_at
                      ).toLocaleTimeString()}`}
                      descriptionStyle={{ color: darkTheme.colors.placeholder }}
                      left={() => <List.Icon icon="cash-multiple" color={color} />}
                    />
                  </Card.Content>
                </Card>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        {/* Dialog création transaction */}
        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title style={{ color: darkTheme.colors.text }}>
              Créer une transaction
            </Dialog.Title>
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
                  textColor={
                    type === "CREDIT"
                      ? darkTheme.colors.surface
                      : darkTheme.colors.primary
                  }
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
                  textColor={
                    type === "DEBIT"
                      ? darkTheme.colors.surface
                      : darkTheme.colors.accent
                  }
                >
                  Demande
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
  summaryCard: { marginBottom: 16, borderRadius: 12 },
  summaryTitle: { color: "#F8FAFC", fontWeight: "bold", fontSize: 18, textAlign: "center", marginBottom: 8 },
  summaryText: { fontSize: 16, textAlign: "center" },
  summaryBalance: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginTop: 8 },
  sectionHeader: { backgroundColor: "#1E293B", padding: 10, borderRadius: 10, marginTop: 10 },
  sectionTitle: { color: "#F8FAFC", fontWeight: "bold", fontSize: 16 },
  sectionInfo: { fontSize: 14 },
  sectionBalance: { fontSize: 15, fontWeight: "bold", marginTop: 2 },
  card: { marginVertical: 6, backgroundColor: darkTheme.colors.surface },
  noDataText: { textAlign: "center", color: darkTheme.colors.placeholder, marginTop: 40 },
  input: { marginBottom: 16, backgroundColor: darkTheme.colors.surface },
  label: { color: darkTheme.colors.text, marginBottom: 8, fontSize: 16 },
  typeButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  typeButton: { flex: 1, marginHorizontal: 4 },
});
