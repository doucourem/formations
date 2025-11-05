import React, { useEffect, useState } from "react";
import { View, SectionList, StyleSheet } from "react-native";
import { Text, Card, ActivityIndicator, useTheme } from "react-native-paper";
import supabase from "../supabaseClient";

export default function TransactionsListCaisse({ route }) {
  const { cashId } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("cash_id", cashId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Groupement par date et calcul des totaux
      const grouped = data.reduce((acc, tx) => {
        const dateKey = new Date(tx.created_at).toLocaleDateString();
        if (!acc[dateKey])
          acc[dateKey] = { transactions: [], total: 0, totalCredit: 0, totalDebit: 0 };

        acc[dateKey].transactions.push(tx);
        const amount = Number(tx.amount);
        acc[dateKey].total += amount;
        if (tx.type === "CREDIT") acc[dateKey].totalCredit += amount;
        else acc[dateKey].totalDebit += amount;

        return acc;
      }, {});

      // Transformer en sections pour SectionList
      const sections = Object.keys(grouped).map((date) => ({
        title: date,
        data: grouped[date].transactions,
        total: grouped[date].total,
        totalCredit: grouped[date].totalCredit,
        totalDebit: grouped[date].totalDebit,
      }));

      setTransactions(sections);
    }

    setLoading(false);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  if (!transactions.length)
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.onSurface }}>Aucune transaction trouvée.</Text>
      </View>
    );

  return (
    <SectionList
      sections={transactions}
      keyExtractor={(item) => item.id.toString()}
      renderSectionHeader={({ section }) => {
        const dailyBalance = section.totalCredit - section.totalDebit;
        const balanceColor = dailyBalance >= 0 ? "#22C55E" : "#EF4444"; // vert positif, rouge négatif

        return (
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
              {section.title}
            </Text>
            <Text style={{ color: theme.colors.onSurface }}>
              Total Paiement: {section.totalCredit} FCFA | Total envoie: {section.totalDebit} FCFA
            </Text>
            <Text style={{ color: balanceColor, fontWeight: "bold" }}>
              Balance Journalière: {dailyBalance} FCFA
            </Text>
          </View>
        );
      }}
      renderItem={({ item }) => {
        const isCredit = item.type === "CREDIT";
        const color = isCredit ? "#22C55E" : "#EF4444"; // vert pour crédit, rouge pour débit

        return (
          <Card
            style={[
              styles.card,
              { backgroundColor: isCredit ? "#DCFCE7" : "#FEF2F2" },
            ]}
          >
            <Card.Title
              title={`${isCredit ? "➕" : "➖"} Montant: ${item.amount} FCFA`}
              titleStyle={{ color: color, fontWeight: "bold" }}
              subtitle={`Type: ${item.transaction_type} | Heure: ${new Date(
                item.created_at
              ).toLocaleTimeString()}`}
              subtitleStyle={{ color: theme.colors.placeholder }}
            />
          </Card>
        );
      }}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { margin: 10, borderRadius: 12 },
  sectionHeaderContainer: {
    padding: 10,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
  },
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
});
