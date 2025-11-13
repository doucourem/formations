import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/api"; // Assure-toi que api est configuré avec fetch ou axios

export default function ReportsTab() {
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Récupération des utilisateurs
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
  });

  // Sélection automatique du premier utilisateur
  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users]);

  // Récupération des rapports pour l'utilisateur sélectionné
  const { data: apiData = {}, isLoading: reportsLoading } = useQuery({
    queryKey: ["reports", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return { transactions: [] };
      const res = await api.get(`/reports/user/${selectedUserId}`);
      return res.data;
    },
    enabled: !!selectedUserId,
  });

  // Extraire les transactions
  const dailyReports = apiData.transactions || [];

  // Fonctions utilitaires
  const formatCurrency = (amount) => Number(amount).toLocaleString("fr-FR");
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const getDebtTrend = (current, previous) =>
    current > previous ? "increase" : current < previous ? "decrease" : "stable";

  if (usersLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Sélecteur utilisateur */}
      <View style={styles.card}>
        <Text style={styles.title}>Sélectionner un utilisateur</Text>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[styles.option, selectedUserId === user.id && styles.selectedOption]}
            onPress={() => setSelectedUserId(user.id)}
          >
            <Text>{user.first_name} {user.last_name} ({user.role})</Text>
          </TouchableOpacity>
        ))}
        {selectedUserId && (
          <TouchableOpacity style={styles.resetButton} onPress={() => setSelectedUserId(null)}>
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rapports */}
      {selectedUserId && (
        <View style={styles.card}>
          <Text style={styles.title}>Rapports Détaillés</Text>
          {reportsLoading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : dailyReports.length === 0 ? (
            <Text style={styles.centerText}>Aucun rapport disponible pour cet utilisateur</Text>
          ) : (
            dailyReports.map((report, index) => {
              const previousDebt = index > 0 ? dailyReports[index - 1].remainingDebt || 0 : 0;
              const trend = getDebtTrend(report.remainingDebt || 0, previousDebt);

              return (
                <View key={index} style={styles.reportRow}>
                  <Text style={styles.reportText}>{formatDate(report.created_at)}</Text>
                  <Text style={styles.reportText}>Dette Précédente: {formatCurrency(report.previousDebt || 0)} FCFA</Text>
                  <Text style={styles.reportText}>Total Envoyé: {formatCurrency(report.totalSent || 0)} FCFA</Text>
                  <Text style={[styles.reportText, { color: "orange" }]}>Frais: {formatCurrency(report.totalFees || 0)} FCFA</Text>
                  <Text style={styles.reportText}>Total Payé: {formatCurrency(report.totalPaid || 0)} FCFA</Text>
                  <Text style={[styles.reportText, report.remainingDebt >= 0 ? styles.redText : styles.greenText]}>
                    Dette Restante: {formatCurrency(Math.abs(report.remainingDebt || 0))} FCFA {report.remainingDebt < 0 ? "(Crédit)" : ""}
                  </Text>
                  <Text style={[styles.reportText, trend === "increase" ? styles.redText : trend === "decrease" ? styles.greenText : styles.grayText]}>
                    Tendance: {trend === "increase" ? "Augmentation" : trend === "decrease" ? "Diminution" : "Stable"}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
