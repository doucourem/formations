import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Check, X, Trash2 } from "lucide-react";

export default function ClientsTab({ onOpenClientModal }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingClient, setEditingClient] = useState(null);
  const [editName, setEditName] = useState("");
  const [deletingClient, setDeletingClient] = useState(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/clients?userId=${user.id}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, name }) => apiRequest("PATCH", `/api/clients/${id}`, { name }),
    onSuccess: () => {
      setEditingClient(null);
      setEditName("");
      toast({ title: "Client modifié" });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: () => {
      setDeletingClient(null);
      toast({ title: "Client supprimé" });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: () => {
      setDeletingClient(null);
      toast({ title: "Erreur", variant: "destructive" });
    },
  });

  const handleEditSave = () => {
    if (editingClient && editName.trim()) {
      updateClientMutation.mutate({ id: editingClient, name: editName.trim() });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingClient) deleteClientMutation.mutate(deletingClient);
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.initialsCircle}>
          <Text style={styles.initials}>{getInitials(item.name)}</Text>
        </View>

        {editingClient === item.id ? (
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Nom du client"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleEditSave} style={styles.iconButton}>
              <Check size={20} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingClient(null)} style={styles.iconButton}>
              <X size={20} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.clientName}>{item.name}</Text>
        )}

        {editingClient !== item.id && deletingClient !== item.id && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => { setEditingClient(item.id); setEditName(item.name); }} style={styles.iconButton}>
              <Edit size={20} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeletingClient(item.id)} style={styles.iconButton}>
              <Trash2 size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}

        {deletingClient === item.id && (
          <View style={styles.actionButtons}>
            <Text>Supprimer ?</Text>
            <TouchableOpacity onPress={handleDeleteConfirm} style={styles.iconButton}>
              <Check size={20} color="red" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeletingClient(null)} style={styles.iconButton}>
              <X size={20} color="#555" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) return <Text>Chargement...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Clients</Text>
        <TouchableOpacity onPress={onOpenClientModal} style={styles.addButton}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter Client</Text>
        </TouchableOpacity>
      </View>

      {clients?.length > 0 ? (
        <FlatList data={clients} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
      ) : (
        <View style={styles.noClients}>
          <Text>Aucun client trouvé</Text>
          <TouchableOpacity onPress={onOpenClientModal} style={styles.addButton}>
            <Plus size={16} color="#fff" />
            <Text style={styles.addButtonText}>Ajouter votre premier client</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold" },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "green", padding: 8, borderRadius: 5 },
  addButtonText: { color: "#fff", marginLeft: 4 },
  card: { padding: 10, marginBottom: 8, backgroundColor: "#fff", borderRadius: 8, elevation: 2 },
  row: { flexDirection: "row", alignItems: "center" },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "green", alignItems: "center", justifyContent: "center", marginRight: 10 },
  initials: { color: "#fff", fontWeight: "bold" },
  clientName: { flex: 1, fontSize: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, paddingHorizontal: 8, height: 36 },
  iconButton: { marginLeft: 5 },
  actionButtons: { flexDirection: "row", alignItems: "center" },
  noClients: { alignItems: "center", marginTop: 20 },
});
