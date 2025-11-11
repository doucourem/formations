import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/api";
import Icon from "react-native-vector-icons/Feather";

export default function HistoryTab() {
  const queryClient = useQueryClient();
  const [searchClient, setSearchClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // --- Clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await api.get("/clients");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // --- Transactions
  const {
    data: transactionsData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await api.get("/transactions");
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 0,
    retry: 3,
  });

  // --- Suppression optimiste
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(["transactions"]);
      const previous = queryClient.getQueryData(["transactions"]);
      queryClient.setQueryData(["transactions"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, isDeleted: true } : t))
      );
      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["transactions"], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
    },
  });

  // --- Filtrage
  const filteredTransactions = Array.isArray(transactionsData)
    ? transactionsData.filter((t) => {
        const client = clients.find((c) => c.id === t.client_id);
        if (!client || t.isDeleted) return false;

        if (
          searchClient &&
          !client.name?.toLowerCase().includes(searchClient.toLowerCase())
        )
          return false;

        if (selectedDate) {
          const tDate = new Date(t.createdAt).toISOString().split("T")[0];
          if (tDate !== selectedDate) return false;
        }

        return true;
      })
    : [];

  const totalSent = filteredTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount_fcfa || t.amountFCFA || 0),
    0
  );
  const totalFees = filteredTransactions.reduce(
    (sum, t) => sum + parseFloat(t.feeAmount || 0),
    0
  );

  // --- Rendu d'une transaction
  const renderItem = ({ item }) => {
    const client = clients.find((c) => c.id === item.client_id);
    if (!client) return null;

    const statusColors = {
      pending: "#ffb300",
      seen: "#007bff",
      validated: "#2ecc71",
      cancelled: "#e74c3c",
    };

    return (
      <View style={[styles.card, item.status === "cancelled" && styles.cancelledCard]}>
        <View style={styles.rowTop}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleTimeString()}
          </Text>
        </View>

        <Text style={styles.phone}>{client.phone}</Text>

        <View style={styles.rowBetween}>
          <Text style={styles.amount}>{item.amount_fcfa || item.amountFCFA} FCFA</Text>
          <Text style={styles.fee}>Frais: {item.feeAmount || 0} FCFA</Text>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.statusRow}>
            <Icon
              name={
                item.status === "pending"
                  ? "clock"
                  : item.status === "seen"
                  ? "eye"
                  : item.status === "validated"
                  ? "check"
                  : "x"
              }
              size={16}
              color={statusColors[item.status]}
            />
            <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
              {item.status}
            </Text>
          </View>

          {item.status === "pending" && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Confirmer", "Supprimer cette transaction ?", [
                  { text: "Annuler" },
                  {
                    text: "Supprimer",
                    onPress: () => deleteMutation.mutate(item.id),
                  },
                ])
              }
            >
              <Text style={styles.delete}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading || clientsLoading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur chargement</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Historique des Transactions</Text>

      {/* Filtres */}
      <View style={styles.filters}>
        <TextInput
          placeholder="🔍 Rechercher un client"
          value={searchClient}
          onChangeText={setSearchClient}
          style={styles.input}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="📅 Date (YYYY-MM-DD)"
          value={selectedDate}
          onChangeText={setSelectedDate}
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      {/* Totaux */}
      <View style={styles.totalsCard}>
        <Text style={styles.totalText}>💸 Total Envoyé : {totalSent} FCFA</Text>
        <Text style={styles.totalText}>⚙️ Total Frais : {totalFees} FCFA</Text>
      </View>

      {/* Liste */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune transaction trouvée</Text>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9f9fb",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  filters: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  totalsCard: {
    backgroundColor: "#eef6ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelledCard: {
    backgroundColor: "#ffeaea",
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  clientName: { fontSize: 16, fontWeight: "600", color: "#333" },
  time: { fontSize: 12, color: "#888" },
  phone: { fontSize: 13, color: "#666", marginBottom: 5 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  amount: { fontWeight: "bold", color: "#333" },
  fee: { color: "#007bff" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusText: { fontWeight: "600", textTransform: "capitalize" },
  delete: { color: "#e74c3c", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 20, color: "#999" },
});
