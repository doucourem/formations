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
import api from "../../api/api"; // ton API helper
import Icon from 'react-native-vector-icons/Feather';// ou FontAwesome, MaterialIcons, etc.



export default function HistoryTab() {
  const queryClient = useQueryClient();
  const [searchClient, setSearchClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Récupération des transactions
  const { data: transactionsData = [], isLoading, error } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await api.get("/transactions");
      // Assure-toi que res.data est un tableau
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 0,
    retry: 3,
  });

  // Suppression optimiste
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(["transactions"]);
      const previous = queryClient.getQueryData(["transactions"]);
      queryClient.setQueryData(["transactions"], (old) =>
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

  // Filtrage
  const filteredTransactions = Array.isArray(transactionsData)
    ? transactionsData.filter((t) => {
        if (t.isDeleted) return false;
        if (searchClient && !t.clientName?.toLowerCase().includes(searchClient.toLowerCase())) return false;
        if (selectedDate) {
          const tDate = new Date(t.createdAt).toISOString().split("T")[0];
          if (tDate !== selectedDate) return false;
        }
        return true;
      })
    : [];

  const totalSent = filteredTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amountFCFA || 0),
    0
  );
  const totalFees = filteredTransactions.reduce(
    (sum, t) => sum + parseFloat(t.feeAmount || 0),
    0
  );

  const renderItem = ({ item }) => (
    <View style={[styles.row, item.status === "cancelled" && styles.cancelledRow]}>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
      <Text style={styles.client}>{item.clientName}</Text>
      <Text style={styles.phone}>{item.phoneNumber}</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{item.amountFCFA} FCFA</Text>
        <Text style={styles.fee}>{item.feeAmount || 0} FCFA</Text>
      </View>
     <View style={styles.status}>
  {item.status === "pending" && <Icon name="clock" size={16} color="orange" />}
  {item.status === "seen" && <Icon name="eye" size={16} color="blue" />}
  {item.status === "validated" && <Icon name="check" size={16} color="green" />}
  {item.status === "cancelled" && <Icon name="x" size={16} color="red" />}
  <Text>{item.status}</Text>
</View>

      <View style={styles.actions}>
        {item.status === "pending" && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Confirmer", "Supprimer cette transaction ?", [
                { text: "Annuler" },
                { text: "Supprimer", onPress: () => deleteMutation.mutate(item.id) },
              ])
            }
          >
            <Text style={styles.delete}>Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur chargement</Text>;

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
