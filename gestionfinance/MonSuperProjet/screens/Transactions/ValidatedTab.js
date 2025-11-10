import React, { useState, useMemo } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import api from "../../api/api";
import Icon from "react-native-vector-icons/Feather"; // pour les icônes

// Création du query client
const queryClient = new QueryClient();

export default function HistoryTab() {
  const [searchClient, setSearchClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Récupération des clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await api.get("/clients");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Récupération des transactions
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await api.get("/transactions");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Suppression transaction
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  // Filtrage des transactions avec liaison client
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || !Array.isArray(clients)) return [];

    return transactions.filter(t => {
      // Lier au client
      const client = clients.find(c => c.id === t.client_id);

      if (!client) return false;

      // Filtrage par statut non validé
      const matchesStatus = t.status !== "validated";

      // Filtrage par recherche client
      const matchesSearch = !searchClient
        || client.name.toLowerCase().includes(searchClient.toLowerCase())
        || (t.phoneNumber && t.phoneNumber.includes(searchClient));

      // Filtrage par date
      const matchesDate = !selectedDate || (new Date(t.createdAt).toISOString().split("T")[0] === selectedDate);

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [transactions, clients, searchClient, selectedDate]);

  // Totaux
  const totalSent = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amountFCFA || 0), 0);
  const totalFees = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.feeAmount || 0), 0);

  // Affichage transaction
  const renderItem = ({ item }) => {
    const client = clients.find(c => c.id === item.client_id);
    if (!client) return null;

    return (
      <View style={[styles.row, item.status === "cancelled" && styles.cancelledRow]}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        <Text style={styles.client}>{client.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{item.amount} FCFA</Text>
          <Text style={styles.fee}>{item.feeAmount || 0} FCFA</Text>
        </View>
        <View style={styles.status}>
          {item.status === "pending" && <Icon name="clock" size={16} />}
          {item.status === "seen" && <Icon name="eye" size={16} />}
          {item.status === "validated" && <Icon name="check" size={16} />}
          {item.status === "cancelled" && <Icon name="x" size={16} />}
          <Text>{item.status}</Text>
        </View>
        <View style={styles.actions}>
          {item.status === "pending" && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Confirmer", "Supprimer cette transaction ?", [
                  { text: "Annuler" },
                  { text: "Supprimer", onPress: () => deleteTransactionMutation.mutate(item.id) },
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

  if (transactionsLoading || clientsLoading) return <Text>Chargement...</Text>;
  if (transactionsError) return <Text>Erreur chargement</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          placeholder="Rechercher par client"
          value={searchClient}
          onChangeText={setSearchClient}
          style={styles.input}
        />
        <TextInput
          placeholder="Sélectionner une date (YYYY-MM-DD)"
          value={selectedDate}
          onChangeText={setSelectedDate}
          style={styles.input}
        />
      </View>

      <View style={styles.totals}>
        <Text>Total Envoyé: {totalSent} FCFA</Text>
        <Text>Total Frais: {totalFees} FCFA</Text>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Aucune transaction trouvée</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  filters: { flexDirection: "row", gap: 10, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5 },
  totals: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  row: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderColor: "#eee", alignItems: "center" },
  cancelledRow: { backgroundColor: "#ffe5e5" },
  date: { flex: 1 },
  client: { flex: 2 },
  phone: { flex: 2 },
  amountContainer: { flex: 2 },
  amount: { fontWeight: "bold" },
  fee: { color: "green" },
  status: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  actions: { flex: 1 },
  delete: { color: "red" },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
});
