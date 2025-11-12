import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/api"; // Assure-toi que api est configuré avec fetch ou axios

export default function ReportsTab() {
  const [selectedUserId, setSelectedUserId] = useState("");

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users"); // fetch ou axios
      if (!res.ok && !res.data) throw new Error("Erreur récupération utilisateurs");
      return res.data ?? res.json();
    },
  });

  // Fetch daily reports for the selected user
  const { data: dailyReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["reports", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await api.get(`/reports/user/${selectedUserId}`);
      if (!res.ok && !res.data) throw new Error("Erreur récupération rapports");
      return res.data ?? res.json();
    },
    enabled: !!selectedUserId,
  });

  const formatCurrency = (amount) => Number(amount).toLocaleString("fr-FR");
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const getDebtTrend = (current, previous) => {
    if (current > previous) return "increase";
    if (current < previous) return "decrease";
    return "stable";
  };

  if (usersLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User selection */}
      <View style={styles.card}>
        <Text style={styles.title}>Sélectionner un utilisateur</Text>
        {users?.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[styles.option, selectedUserId === String(user.id) && styles.selectedOption]}
            onPress={() => setSelectedUserId(String(user.id))}
          >
            <Text>{user.first_name} {user.last_name}  ({user.role})</Text>
          </TouchableOpacity>
        ))}
        {selectedUserId && (
          <TouchableOpacity style={styles.resetButton} onPress={() => setSelectedUserId("")}>
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reports */}
      {selectedUserId && (
        <View style={styles.card}>
          <Text style={styles.title}>Rapports Détaillés</Text>
          {reportsLoading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : (
            <View>
              {dailyReports && dailyReports.length > 0 ? (
                dailyReports.map((report, index) => {
                  const trend =
                    index < dailyReports.length - 1
                      ? getDebtTrend(report.remainingDebt, dailyReports[index + 1].remainingDebt)
                      : "stable";

                  return (
                    <View key={index} style={styles.reportRow}>
                      <Text style={styles.reportText}>{formatDate(report.date)}</Text>
                      <Text style={styles.reportText}>Dette Précédente: {formatCurrency(report.previousDebt)} FCFA</Text>
                      <Text style={styles.reportText}>Total Envoyé: {formatCurrency(report.totalSent)} FCFA</Text>
                      <Text style={styles.reportText}>Frais: {formatCurrency(report.totalFees)} FCFA</Text>
                      <Text style={styles.reportText}>Total Payé: {formatCurrency(report.totalPaid)} FCFA</Text>
                      <Text style={[styles.reportText, report.remainingDebt >= 0 ? styles.redText : styles.greenText]}>
                        Dette Restante: {formatCurrency(Math.abs(report.remainingDebt))} FCFA {report.remainingDebt < 0 ? "(Crédit)" : ""}
                      </Text>
                      <Text style={[styles.reportText, trend === "increase" ? styles.redText : trend === "decrease" ? styles.greenText : styles.grayText]}>
                        Tendance: {trend === "increase" ? "Augmentation" : trend === "decrease" ? "Diminution" : "Stable"}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.centerText}>Aucun rapport disponible pour cet utilisateur</Text>
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 16, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  option: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 6 },
  selectedOption: { backgroundColor: "#d0f0c0" },
  resetButton: { marginTop: 8, padding: 10, backgroundColor: "#999", borderRadius: 6, alignItems: "center" },
  resetButtonText: { color: "#fff", fontWeight: "bold" },
  reportRow: { paddingBottom: 12, borderBottomWidth: 1, borderColor: "#eee", marginBottom: 8 },
  reportText: { fontSize: 14, marginBottom: 2 },
  redText: { color: "#b91c1c", fontWeight: "bold" },
  greenText: { color: "#16a34a", fontWeight: "bold" },
  grayText: { color: "#6b7280", fontWeight: "bold" },
  centerText: { textAlign: "center", marginTop: 16, color: "#6b7280" },
});
