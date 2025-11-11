import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient"; // Ton helper API
import Toast from "react-native-toast-message";

// Schéma de validation Zod
const debtThresholdSchema = z.object({
  personalDebtThresholdFCFA: z.preprocess(
    (val) => Number(val),
    z.number().positive("Montant invalide")
  ),
});

export default function UserDebtManagementTab() {
  const [editingUserId, setEditingUserId] = useState(null);
  const queryClient = useQueryClient();

  // Formulaire
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(debtThresholdSchema),
    defaultValues: { personalDebtThresholdFCFA: 100000 },
  });

  // Fetch utilisateurs
  const { data: users = [], isLoading, error } = useQuery(["/api/users"], async () => {
    const res = await fetch("/api/users", { credentials: "include" });
    if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
    return res.json();
  });

  // Mutation pour mettre à jour le seuil
  const mutation = useMutation(
    ({ userId, threshold }) => apiRequest("PATCH", `/api/users/${userId}/debt-threshold`, { personalDebtThresholdFCFA: threshold }),
    {
      onSuccess: (_, { threshold }) => {
        queryClient.invalidateQueries(["/api/users"]);
        setEditingUserId(null);
        Toast.show({ type: "success", text1: "Seuil mis à jour", text2: `${threshold} FCFA` });
      },
      onError: (err) => {
        Toast.show({ type: "error", text1: "Erreur", text2: err.message || "Impossible de mettre à jour le seuil" });
      },
    }
  );

  const startEditing = (user) => {
    setEditingUserId(user.id);
    reset({ personalDebtThresholdFCFA: Number(user.personalDebtThresholdFCFA) });
  };

  const saveThreshold = (data) => {
    if (editingUserId) {
      mutation.mutate({ userId: editingUserId, threshold: data.personalDebtThresholdFCFA });
    }
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    reset();
  };

  if (isLoading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (error) return <Text style={styles.error}>Erreur de chargement des utilisateurs</Text>;

  const regularUsers = users.filter((u) => u.role === "user");

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {regularUsers.length === 0 && <Text style={styles.noUser}>Aucun utilisateur trouvé</Text>}

      {regularUsers.map((user) => (
        <View key={user.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.username}>@{user.username}</Text>
            </View>

            <View style={styles.thresholdContainer}>
              <Text style={styles.label}>Seuil de Dette</Text>
              {editingUserId === user.id ? (
                <Controller
                  control={control}
                  name="personalDebtThresholdFCFA"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={String(value)}
                      onChangeText={onChange}
                    />
                  )}
                />
              ) : (
                <Text style={styles.threshold}>
                  {Number(user.personalDebtThresholdFCFA).toLocaleString("fr-FR")} FCFA
                </Text>
              )}
            </View>
          </View>

          <View style={styles.buttonRow}>
            {editingUserId === user.id ? (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(saveThreshold)} disabled={mutation.isLoading}>
                  <Text style={styles.buttonText}>{mutation.isLoading ? "..." : "Valider"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing} disabled={mutation.isLoading}>
                  <Text>Annuler</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => startEditing(user)}>
                <Text>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ color: user.isActive ? "green" : "red", marginTop: 8 }}>
            {user.isActive ? "Utilisateur actif" : "Utilisateur inactif"}
          </Text>
        </View>
      ))}

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "bold", fontSize: 16 },
  username: { color: "#666" },
  thresholdContainer: { alignItems: "flex-end" },
  label: { fontSize: 12, color: "#666" },
  threshold: { fontSize: 16, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 4, width: 100, textAlign: "right" },
  buttonRow: { flexDirection: "row", marginTop: 8, justifyContent: "flex-end", gap: 8 },
  saveButton: { backgroundColor: "green", padding: 8, borderRadius: 4, marginRight: 4 },
  cancelButton: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 4 },
  editButton: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 4 },
  buttonText: { color: "white", fontWeight: "bold" },
  error: { color: "red", textAlign: "center", marginTop: 20 },
  noUser: { textAlign: "center", marginTop: 20, color: "#666" },
});
