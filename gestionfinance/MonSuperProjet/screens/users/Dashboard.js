import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  DeviceEventEmitter,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/api";
import Icon from "react-native-vector-icons/Feather"; // ✅ On garde Feather uniquement

export default function DashboardTab() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // --- 📊 Stats journalières ---
  const { data: dailyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/stats/daily"],
    queryFn: async () => {
      const res = await api.get("/stats/daily");
      if (!res.ok) return { totalSent: 0, totalPaid: 0, globalDebt: 0 };
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // --- 👥 Résumés utilisateurs ---
  const { data: userSummaries = [], isLoading: summariesLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        const res = await api.get("/users");
        return Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("🔴 Erreur chargement stats utilisateurs:", error);
        return [];
      }
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // --- ⚙️ Paramètres système ---
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/system/settings"],
    queryFn: async () => {
      const res = await api.get("/api/system/settings");
      if (!res.ok) return { mainBalanceGNF: "0" };
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // --- 🔁 Rafraîchissement automatique quand balance mise à jour ---
  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log("💰 Mise à jour balance reçue — rafraîchissement...");
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
    };

    const subscription = DeviceEventEmitter.addListener("balance-updated", handleBalanceUpdate);
    return () => subscription.remove();
  }, [queryClient]);

  const openReportModal = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsReportModalOpen(true);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (statsLoading || summariesLoading || settingsLoading) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* 🟠 Cartes de statistiques */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <View style={[styles.card, { backgroundColor: "#FF7F50" }]}>
          <Text style={styles.cardTitle}>Dette Globale</Text>
          <Text style={styles.cardValue}>{formatCurrency(dailyStats?.globalDebt)} FCFA</Text>
          <Icon name="alert-triangle" size={32} color="#FFDAB9" />
        </View>
        <View style={[styles.card, { backgroundColor: "#8A2BE2" }]}>
          <Text style={styles.cardTitle}>Solde Principal (GNF)</Text>
          <Text style={styles.cardValue}>
            {formatCurrency(parseFloat(settings?.mainBalanceGNF || "0"))} GNF
          </Text>
          <Icon name="dollar-sign" size={32} color="#E6E6FA" />
        </View>
      </View>

      {/* 👤 Tableau des utilisateurs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: 800 }}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Utilisateur</Text>
            <Text style={styles.tableHeaderCell}>Total Envoyé</Text>
            <Text style={styles.tableHeaderCell}>Total Payé</Text>
            <Text style={styles.tableHeaderCell}>Dette Précédente</Text>
            <Text style={styles.tableHeaderCell}>Dette Actuelle</Text>
            <Text style={styles.tableHeaderCell}>Actions</Text>
          </View>

          {userSummaries.length === 0 ? (
            <View style={{ padding: 16 }}>
              <Text>Aucun résumé utilisateur disponible</Text>
            </View>
          ) : (
            <FlatList
              data={userSummaries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2, flexDirection: "row", alignItems: "center" }]}>
                    <View style={styles.avatar}>
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>{getInitials(item.name)}</Text>
                    </View>
                    <View style={{ marginLeft: 8 }}>
                      <Text style={{ fontWeight: "bold" }}>{item.first_name}</Text>
                      <Text style={{ color: "#555" }}>{item.email}</Text>
                    </View>
                  </View>
                  <Text style={styles.tableCell}>{formatCurrency(item.totalSent)} FCFA</Text>
                  <Text style={[styles.tableCell, { color: "green" }]}>{formatCurrency(item.totalPaid)} FCFA</Text>
                  <Text style={styles.tableCell}>{formatCurrency(item.previousDebt)} FCFA</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        backgroundColor: "#FFA500",
                        color: "#fff",
                        borderRadius: 4,
                        paddingHorizontal: 4,
                      },
                    ]}
                  >
                    {formatCurrency(item.currentDebt)} FCFA
                  </Text>
                  <TouchableOpacity
                    style={styles.reportButton}
                    onPress={() => openReportModal(item.id, item.name)}
                  >
                    <Icon name="file-text" size={16} color="#000" />
                    <Text style={{ marginLeft: 4 }}>Rapport</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* 🧾 Modal (à implémenter) */}
      {/* 
      <UserReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userId={selectedUserId || 0}
        userName={selectedUserName}
      /> 
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 100,
  },
  cardTitle: { color: "#fff", fontSize: 12 },
  cardValue: { color: "#fff", fontSize: 20, fontWeight: "bold", marginVertical: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#EEE", paddingVertical: 8 },
  tableHeaderCell: { flex: 1, fontSize: 12, fontWeight: "bold", paddingHorizontal: 8 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    alignItems: "center",
  },
  tableCell: { flex: 1, paddingHorizontal: 8, fontSize: 12 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6200EE",
    justifyContent: "center",
    alignItems: "center",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: "#DDD",
    borderRadius: 4,
  },
});
