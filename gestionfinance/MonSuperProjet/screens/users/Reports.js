import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Toast from "react-native-toast-message";

export default function ReportsTab() {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data: users = [], isLoading: usersLoading } = useQuery(["/api/stats/users"], async () => {
    const res = await fetch("/api/stats/users", { credentials: "include" });
    if (!res.ok) throw new Error("Impossible de charger les utilisateurs");
    return res.json();
  });

  const { data: dailyReports = [], isLoading: reportsLoading } = useQuery(
    ["/api/reports/user", selectedUserId],
    async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/reports/user/${selectedUserId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les rapports");
      return res.json();
    },
    { enabled: !!selectedUserId }
  );

  const formatCurrency = (amount) => new Intl.NumberFormat("fr-FR").format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const getDebtTrend = (current, previous) => current > previous ? "increase" : current < previous ? "decrease" : "stable";

  if (usersLoading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  const renderReportItem = ({ item, index }) => {
    const trend = index < dailyReports.length - 1 
      ? getDebtTrend(item.remainingDebt, dailyReports[index + 1].remainingDebt)
      : "stable";

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 2 }]}>{formatDate(item.date)}</Text>
        <Text style={styles.cell}>{formatCurrency(item.previousDebt)} FCFA</Text>
        <Text style={styles.cell}>{formatCurrency(item.totalSent)} FCFA</Text>
        <Text style={[styles.cell, { color: "orange", fontWeight: "600" }]}>{formatCurrency(item.totalFees)} FCFA</Text>
        <Text style={styles.cell}>{formatCurrency(item.totalPaid)} FCFA</Text>
        <Text style={[styles.cell, { color: item.remainingDebt >= 0 ? "red" : "green" }]}>
          {formatCurrency(Math.abs(item.remainingDebt))} FCFA{item.remainingDebt < 0 ? " (Crédit)" : ""}
        </Text>
        <Text style={[styles.cell, { backgroundColor: trend === "increase" ? "#FECACA" : trend === "decrease" ? "#BBF7D0" : "#E5E7EB" }]}>
          {trend === "increase" ? "Augmentation" : trend === "decrease" ? "Diminution" : "Stable"}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Sélecteur utilisateur */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {users.map(user => (
          <TouchableOpacity
            key={user.id}
            onPress={() => setSelectedUserId(user.id)}
            style={[styles.userButton, selectedUserId === user.id && styles.userButtonSelected]}
          >
            <Text style={styles.userButtonText}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedUserId && (
        <>
          {reportsLoading ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" />
          ) : (
            <ScrollView horizontal>
              <View>
                {/* Header */}
                <View style={[styles.row, styles.headerRow]}>
                  {["Date", "Dette Précédente", "Total Envoyé", "Frais (%)", "Total Payé", "Dette Restante", "Tendance"].map((h, i) => (
                    <Text key={i} style={[styles.cell, styles.headerCell]}>{h}</Text>
                  ))}
                </View>
                {/* Contenu */}
                <FlatList
                  data={dailyReports}
                  keyExtractor={(_, i) => i.toString()}
                  renderItem={renderReportItem}
                />
                {dailyReports.length === 0 && <Text style={{ textAlign: "center", marginTop: 16 }}>Aucun rapport disponible</Text>}
              </View>
            </ScrollView>
          )}
        </>
      )}

      <Toast />
    </View>
  );
}

const styles = {
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingVertical: 8 },
  headerRow: { backgroundColor: "#F9FAFB" },
  cell: { paddingHorizontal: 8, minWidth: 100 },
  headerCell: { fontWeight: "bold", textTransform: "uppercase" },
  userButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#E5E7EB", borderRadius: 8, marginRight: 8 },
  userButtonSelected: { backgroundColor: "#3B82F6" },
  userButtonText: { color: "#000" },
};
