import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export default function ReportsTab() {
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Récupération des utilisateurs
  const { data: users = [], isLoading: usersLoading } = useQuery(
    ["/api/stats/users"],
    async () => {
      const res = await fetch("/api/stats/users", { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les utilisateurs");
      return res.json();
    }
  );

  // Sélection automatique du premier utilisateur
  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users]);

  // Récupération des transactions pour l'utilisateur sélectionné
  const { data: apiData = {}, isLoading: reportsLoading } = useQuery(
    ["/api/reports/user", selectedUserId],
    async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/reports/user/${selectedUserId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les rapports");
      return res.json();
    },
    { enabled: !!selectedUserId }
  );

  const transactions = apiData.transactions || [];


  console.log(transactions);
  // Transformer les transactions en rapports journaliers
  const groupedReports = transactions.reduce((acc, tx) => {
    const date = new Date(tx.created_at).toISOString().split("T")[0]; // YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = { 
        date, 
        previousDebt: 0,
        totalSent: 0, 
        totalPaid: 0, 
        totalFees: 0, 
        remainingDebt: 0 
      };
    }

    acc[date].totalSent += parseFloat(tx.amount_fcfa || 0);
    acc[date].totalPaid += parseFloat(tx.amount_to_pay || 0);
    acc[date].totalFees += parseFloat(tx.fee_amount || 0);
    acc[date].remainingDebt += parseFloat(tx.amount_fcfa || 0) - parseFloat(tx.amount_to_pay || 0);

    return acc;
  }, {});
 
 
  // Trier les rapports par date et ajouter previousDebt
  const sortedReports = Object.values(groupedReports)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((report, i, arr) => ({
      ...report,
      previousDebt: i > 0 ? arr[i - 1].remainingDebt : 0
    }));

  // Fonctions utilitaires
  const formatCurrency = (amount) => new Intl.NumberFormat("fr-FR").format(amount || 0);
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const getDebtTrend = (current, previous) =>
    current > previous ? "increase" : current < previous ? "decrease" : "stable";

  if (usersLoading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  // Rendu d'une ligne de rapport
  const renderReportItem = ({ item }) => {
    const trend = getDebtTrend(item.remainingDebt || 0, item.previousDebt || 0);

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 2 }]}>{formatDate(item.date)}</Text>
        <Text style={styles.cell}>{formatCurrency(item.previousDebt)}</Text>
        <Text style={styles.cell}>{formatCurrency(item.totalSent)}</Text>
        <Text style={[styles.cell, { color: "orange", fontWeight: "600" }]}>{formatCurrency(item.totalFees)}</Text>
        <Text style={styles.cell}>{formatCurrency(item.totalPaid)}</Text>
        <Text style={[styles.cell, { color: item.remainingDebt >= 0 ? "red" : "green" }]}>
          {formatCurrency(Math.abs(item.remainingDebt))} {item.remainingDebt < 0 ? "(Crédit)" : ""}
        </Text>
        <Text
          style={[
            styles.cell,
            { backgroundColor: trend === "increase" ? "#FECACA" : trend === "decrease" ? "#BBF7D0" : "#E5E7EB" },
          ]}
        >
          {trend === "increase" ? "Augmentation" : trend === "decrease" ? "Diminution" : "Stable"}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Sélecteur utilisateur */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            onPress={() => setSelectedUserId(user.id)}
            style={[styles.userButton, selectedUserId === user.id && styles.userButtonSelected]}
          >
            <Text style={[styles.userButtonText, selectedUserId === user.id && { color: "#fff" }]}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tableau des rapports */}
      {selectedUserId &&
        (reportsLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" />
        ) : sortedReports.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 16 }}>Aucun rapport disponible</Text>
        ) : (
          <ScrollView horizontal>
            <View>
              {/* Header */}
              <View style={[styles.row, styles.headerRow]}>
                {["Date", "Dette Précédente", "Total Envoyé", "Frais (%)", "Total Payé", "Dette Restante", "Tendance"].map(
                  (h, i) => (
                    <Text key={i} style={[styles.cell, styles.headerCell]}>
                      {h}
                    </Text>
                  )
                )}
              </View>

              {/* Contenu */}
              <FlatList data={sortedReports} keyExtractor={(item) => item.date} renderItem={renderReportItem} />
            </View>
          </ScrollView>
        ))}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingVertical: 8 },
  headerRow: { backgroundColor: "#F9FAFB" },
  cell: { paddingHorizontal: 8, minWidth: 100 },
  headerCell: { fontWeight: "bold", textTransform: "uppercase" },
  userButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#E5E7EB", borderRadius: 8, marginRight: 8 },
  userButtonSelected: { backgroundColor: "#3B82F6" },
  userButtonText: { color: "#000" },
});
