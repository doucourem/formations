import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { Check, Copy, Eye, X, RefreshCw } from "lucide-react";
import api from "../../api/api";

export default function ValidatedTab() {

  const [searchClient, setSearchClient] = useState("");
  const [selectedProof, setSelectedProof] = useState(null);
  const [copiedProof, setCopiedProof] = useState(false);

const { data: clients = [], isLoading: clientsLoading } = useQuery({
  queryKey: ["clients"],
  queryFn: async () => {
    const res = await api.get("/clients");
    return Array.isArray(res.data) ? res.data : [];
  },
});

const { data: transactions = [], isLoading: transactionsLoading, error, refetch } = useQuery({
  queryKey: ["transactions"],
  queryFn: async () => {
    const res = await api.get("/transactions");
    return Array.isArray(res.data) ? res.data : [];
  },
  staleTime: 0,
  retry: 3,
});

const filteredTransactions = Array.isArray(transactions) && Array.isArray(clients)
  ? transactions.filter((t) => {
      const client = clients.find((c) => c.id === t.client_id);
      if (!client || t.isDeleted) return false;

      // Filtre par nom ou téléphone
      if (
        searchClient &&
        !client.name?.toLowerCase().includes(searchClient.toLowerCase()) &&
        !t.phone_number?.includes(searchClient)
      )
        return false;

      // Filtre par date
      

      return true;
    })
  : [];




  const handleCopyProof = async () => {
    if (!selectedProof) return;
    try {
      await navigator.clipboard.writeText(selectedProof.proof);
      setCopiedProof(true);
     // toast({ title: "Copié !", description: "Preuve copiée dans le presse-papiers" });
      setTimeout(() => setCopiedProof(false), 2000);
    } catch {
      //toast({ title: "Erreur", description: "Impossible de copier", variant: "destructive" });
    }
  };

  const renderTransaction = ({ item }) => {
    const client = clients.find((c) => c.id === item.client_id);
    if (!client) return null;

    const statusColors = {
      pending: "#ffb300",
      seen: "#007bff",
      validated: "#2ecc71",
      cancelled: "#e74c3c",
    };

    return  (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleTimeString()}</Text>
        <View style={[styles.avatar, { backgroundColor: '#4ade80' }]}>
          <Text style={styles.avatarText}>{client.name}</Text>
        </View>
        <Text style={styles.clientName}>{client.name}</Text>
        <Text>{item.phoneNumber}</Text>
        <Text>{parseFloat(item.amount_fcfa).toLocaleString()} FCFA</Text>
        <TouchableOpacity onPress={() => setSelectedProof(item)} style={styles.button}>
          <Eye size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

if (transactionsLoading || clientsLoading) return <Text>Chargement...</Text>;


  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions Validées</Text>
        <Text>{filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={() => { refetch(); toast({ title: "Actualisation" }); }} style={styles.refresh}>
          <RefreshCw size={20} />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Rechercher par client ou numéro..."
        value={searchClient}
        onChangeText={setSearchClient}
        style={styles.input}
      />

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {selectedProof && (
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Preuve de Paiement</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleCopyProof}>
                {copiedProof ? <Check size={20} /> : <Copy size={20} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedProof(null)}>
                <X size={20} />
              </TouchableOpacity>
            </View>
          </View>
          {selectedProof.proofType === "image" ? (
            <Image source={{ uri: selectedProof.proof }} style={styles.image} />
          ) : (
            <ScrollView style={styles.proofText}>
              <Text>{selectedProof.proof}</Text>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold" },
  refresh: { padding: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, paddingHorizontal: 8, marginBottom: 10 },
  card: { padding: 10, marginBottom: 8, backgroundColor: "#fff", borderRadius: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  date: { fontSize: 12 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "bold" },
  clientName: { flex: 1, marginLeft: 5 },
  button: { padding: 5 },
  modal: { position: "absolute", top: 50, left: 20, right: 20, bottom: 50, backgroundColor: "#fff", borderRadius: 10, padding: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: "bold" },
  modalButtons: { flexDirection: "row", gap: 10 },
  image: { width: "100%", height: 300, resizeMode: "contain", borderRadius: 8 },
  proofText: { padding: 10, backgroundColor: "#f0f0f0", borderRadius: 8 },
});
