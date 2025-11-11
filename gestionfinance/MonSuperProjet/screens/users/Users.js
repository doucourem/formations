import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Toast from "react-native-toast-message";

export default function UsersTab({ onOpenUserModal }) {
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", username: "", role: "user" });
  const queryClient = useQueryClient();

  // Fetch utilisateurs
  const { data: users = [], isLoading } = useQuery(["/api/users"], async () => {
    const res = await fetch("/api/users", { credentials: "include" });
    if (!res.ok) throw new Error("Impossible de charger les utilisateurs");
    return res.json();
  });

  // Mutation pour update user
  const updateUserMutation = useMutation(
    ({ id, data }) => apiRequest("PATCH", `/api/users/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["/api/users"]);
        setEditingUser(null);
        Toast.show({ type: "success", text1: "Utilisateur modifié" });
      },
      onError: () => {
        Toast.show({ type: "error", text1: "Erreur", text2: "Impossible de modifier l'utilisateur" });
      },
    }
  );

  // Mutation pour activer/désactiver
  const toggleUserStatusMutation = useMutation(
    ({ id, isActive }) => apiRequest("PATCH", `/api/users/${id}`, { isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["/api/users"]);
        Toast.show({ type: "success", text1: "Statut modifié" });
      },
      onError: () => {
        Toast.show({ type: "error", text1: "Erreur", text2: "Impossible de modifier le statut" });
      },
    }
  );

  const startEdit = (user) => {
    setEditingUser(user.id);
    setEditData({ firstName: user.firstName, lastName: user.lastName, username: user.username, role: user.role });
  };

  const saveEdit = () => {
    if (editingUser) updateUserMutation.mutate({ id: editingUser, data: editData });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditData({ firstName: "", lastName: "", username: "", role: "user" });
  };

  const toggleStatus = (user) => toggleUserStatusMutation.mutate({ id: user.id, isActive: !user.isActive });

  const getInitials = (firstName, lastName) => `${firstName[0]}${lastName[0]}`.toUpperCase();

  const roleColor = (role) => (role === "admin" ? "#D8B4FE" : "#BFDBFE");
  const statusColor = (isActive) => (isActive ? "#BBF7D0" : "#FECACA");

  if (isLoading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity onPress={onOpenUserModal} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Créer Utilisateur</Text>
      </TouchableOpacity>

      {users.length === 0 && <Text style={styles.noUser}>Aucun utilisateur trouvé</Text>}

      {users.map((user) => (
        <View key={user.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(user.firstName, user.lastName)}</Text>
              </View>

              {editingUser === user.id ? (
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={editData.firstName}
                    onChangeText={(v) => setEditData({ ...editData, firstName: v })}
                    placeholder="Prénom"
                    style={styles.input}
                  />
                  <TextInput
                    value={editData.lastName}
                    onChangeText={(v) => setEditData({ ...editData, lastName: v })}
                    placeholder="Nom"
                    style={styles.input}
                  />
                  <TextInput
                    value={editData.username}
                    onChangeText={(v) => setEditData({ ...editData, username: v })}
                    placeholder="Nom d'utilisateur"
                    style={styles.input}
                  />
                  <TextInput
                    value={editData.role}
                    onChangeText={(v) => setEditData({ ...editData, role: v })}
                    placeholder="Rôle"
                    style={styles.input}
                  />
                </View>
              ) : (
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                  <Text style={styles.username}>{user.username}</Text>
                  <View style={[styles.badge, { backgroundColor: roleColor(user.role) }]}>
                    <Text style={styles.badgeText}>{user.role === "admin" ? "Admin" : "Utilisateur"}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              {editingUser === user.id ? (
                <>
                  <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
                    <Text style={styles.saveText}>✔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit} style={styles.cancelBtn}>
                    <Text>✖</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => startEdit(user)} style={styles.editBtn}>
                    <Text>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleStatus(user)} style={[styles.statusBtn, { backgroundColor: statusColor(user.isActive) }]}>
                    <Text>{user.isActive ? "Bloquer" : "Activer"}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      ))}

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12, backgroundColor: "#fff", borderRadius: 8, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "bold" },
  name: { fontWeight: "bold", fontSize: 16 },
  username: { color: "#666" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  badgeText: { fontSize: 12, fontWeight: "500" },
  actions: { flexDirection: "row", alignItems: "center" },
  editBtn: { marginRight: 8, padding: 6 },
  saveBtn: { marginRight: 8, padding: 6, backgroundColor: "#22C55E", borderRadius: 4 },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { padding: 6, backgroundColor: "#F87171", borderRadius: 4 },
  statusBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 4, marginBottom: 4 },
  addButton: { padding: 12, backgroundColor: "#3B82F6", borderRadius: 8, marginBottom: 16 },
  addButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  noUser: { textAlign: "center", color: "#666", marginTop: 20 },
});
