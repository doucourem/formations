import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Coins, FileText } from "lucide-react-native";
import api from "../../api/api";
import Icon from "react-native-vector-icons/Feather";

interface DailyStats {
  totalSent: number;
  totalPaid: number;
  globalDebt: number;
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
  totalSent: number;
  totalPaid: number;
  previousDebt: number;
  currentDebt: number;
  transactionCount: number;
}

interface SystemSettings {
  mainBalanceGNF: string;
}

export default function DashboardTab() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const queryClient = useQueryClient();
  

  const { data: dailyStats, isLoading: statsLoading } = useQuery<DailyStats>({
    queryKey: ["/api/stats/daily"],
    queryFn: async () => {
      const res = await fetch("/api/stats/daily", { credentials: "include" });
      if (!res.ok) return { totalSent: 0, totalPaid: 0, globalDebt: 0 };
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });



const { data: userSummaries, isLoading: summariesLoading } = useQuery<UserSummary>({
  queryKey: ["/api/stats/users"],
  queryFn: async () => {
    try {
      const res = await api.get("/stats/users"); // api.get() déjà configuré avec credentials / headers
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("🔴 Error fetching user stats:", error);
      return [];
    }
  },
  refetchInterval: 60000, // toutes les 60s
  staleTime: 30000,       // données fraîches pendant 30s
});


  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system/settings"],
    queryFn: async () => {
      const res = await fetch("/api/system/settings", { credentials: "include" });
      if (!res.ok) return { mainBalanceGNF: "0" };
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log("💰 Balance update received — refreshing queries...");
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
    };

    // ✅ Abonnement à l’événement
    const subscription = DeviceEventEmitter.addListener("balance-updated", handleBalanceUpdate);

    // ✅ Nettoyage
    return () => subscription.remove();
  }, [queryClient]);

  const openReportModal = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsReportModalOpen(true);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const getInitials = (name: string) =>
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
      {/* Stats Cards */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <View style={[styles.card, { backgroundColor: "#FF7F50" }]}>
          <Text style={styles.cardTitle}>Dette Globale</Text>
          <Text style={styles.cardValue}>{formatCurrency(dailyStats?.globalDebt || 0)} FCFA</Text>
          <AlertTriangle size={32} color="#FFDAB9" />
        </View>
        <View style={[styles.card, { backgroundColor: "#8A2BE2" }]}>
          <Text style={styles.cardTitle}>Solde Principal (GNF)</Text>
          <Text style={styles.cardValue}>{formatCurrency(parseFloat(settings?.mainBalanceGNF || "0"))} GNF</Text>
          <Coins size={32} color="#E6E6FA" />
        </View>
      </View>

      {/* Users Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
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
                    <View style={styles.avatar}>{getInitials(item.name)}</View>
                    <View style={{ marginLeft: 8 }}>
                      <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                      <Text style={{ color: "#555" }}>{item.email}</Text>
                    </View>
                  </View>
                  <Text style={styles.tableCell}>{formatCurrency(item.totalSent)} FCFA</Text>
                  <Text style={[styles.tableCell, { color: "green" }]}>{formatCurrency(item.totalPaid)} FCFA</Text>
                  <Text style={styles.tableCell}>{formatCurrency(item.previousDebt)} FCFA</Text>
                  <Text style={[styles.tableCell, { backgroundColor: "#FFA500", color: "#fff", borderRadius: 4, paddingHorizontal: 4 }]}>
                    {formatCurrency(item.currentDebt)} FCFA
                  </Text>
                  <TouchableOpacity style={styles.reportButton} onPress={() => openReportModal(item.id, item.name)}>
                    <FileText size={16} color="#000" />
                    <Text style={{ marginLeft: 4 }}>Rapport</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal */}
      <UserReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userId={selectedUserId || 0}
        userName={selectedUserName}
      />
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
  tableRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEE", alignItems: "center" },
  tableCell: { flex: 1, paddingHorizontal: 8, fontSize: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#6200EE", justifyContent: "center", alignItems: "center", color: "#fff", fontWeight: "bold" },
  reportButton: { flexDirection: "row", alignItems: "center", padding: 4, backgroundColor: "#DDD", borderRadius: 4 },
});
