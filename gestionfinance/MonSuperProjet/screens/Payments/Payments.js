import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/api";
const queryClient = new QueryClient();

const paymentSchema = z.object({
  userId: z.string().min(1, "Utilisateur requis"),
  amountFCFA: z.string().min(1, "Montant requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
});

export default function PaymentsTab() {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Form
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { userId: "", amountFCFA: "" },
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await  api.get("/users");
      if (!res.ok) throw new Error("Erreur récupération utilisateurs");
      return res.json();
    },
  });

  // Fetch user summary
  const { data: userSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["userSummary", selectedUserId],
    queryFn: async () => {
      const res = await  api.get(`/reports/user/${selectedUserId}`);
      if (!res.ok) throw new Error("Impossible de récupérer le résumé utilisateur");
      const dailyReports = await res.json();
      const totalSent = dailyReports.reduce((sum, day) => sum + day.totalSent, 0);
      const totalPaid = dailyReports.reduce((sum, day) => sum + day.totalPaid, 0);
      const previousDebt = dailyReports.length > 0 ? dailyReports[dailyReports.length - 1].previousDebt : 0;
      const currentDebt = dailyReports.length > 0 ? dailyReports[0].remainingDebt : 0;
      return { totalSent, totalPaid, previousDebt, currentDebt };
    },
    enabled: !!selectedUserId,
  });

  // Mutation paiement
  const validatePaymentMutation = useMutation({
    mutationFn: async (data) => {
      const res = await  api.get("/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: parseInt(data.userId), amount: data.amountFCFA, validatedBy: 3 }),
      });
      if (!res.ok) throw new Error("Erreur validation paiement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userSummary", selectedUserId]);
      reset();
      setSelectedUserId("");
      setToastMessage("Paiement validé avec succès");
      setTimeout(() => setToastMessage(null), 3000);
    },
    onError: () => {
      setToastMessage("Erreur lors de la validation");
      setTimeout(() => setToastMessage(null), 3000);
    },
  });

  const onSubmit = (data) => validatePaymentMutation.mutate(data);

  const formatCurrency = (amount) => Number(amount).toLocaleString("fr-FR");

  return (
    <ScrollView style={styles.container}>
      {toastMessage && <Text style={styles.toast}>{toastMessage}</Text>}

      <View style={styles.card}>
        <Text style={styles.title}>Validation de Paiement</Text>

        {/* Select user */}
        <Controller
          control={control}
          name="userId"
          render={({ field }) => (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sélectionner un utilisateur</Text>
              {usersLoading ? (
                <ActivityIndicator />
              ) : (
                users
                  ?.filter((u) => u.role === "user")
                  .map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={[styles.option, field.value === user.id.toString() && styles.selectedOption]}
                      onPress={() => {
                        field.onChange(user.id.toString());
                        setSelectedUserId(user.id.toString());
                      }}
                    >
                      <Text>{user.first_name} {user.last_name} ({user.username})</Text>
                    </TouchableOpacity>
                  ))
              )}
            </View>
          )}
        />

        {/* Amount input */}
        <Controller
          control={control}
          name="amountFCFA"
          render={({ field }) => (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Montant Reçu (FCFA)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ex: 50000"
                value={field.value}
                onChangeText={field.onChange}
              />
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.button, !selectedUserId && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={!selectedUserId || validatePaymentMutation.isLoading}
        >
          <Text style={styles.buttonText}>Valider le Paiement</Text>
        </TouchableOpacity>
      </View>

      {/* User summary */}
      <View style={styles.card}>
        <Text style={styles.title}>Résumé Utilisateur</Text>
        {summaryLoading ? (
          <ActivityIndicator />
        ) : userSummary ? (
          <View>
            <Text>Total Envois: {formatCurrency(userSummary.totalSent)}</Text>
            <Text>Total Paiements: {formatCurrency(userSummary.totalPaid)}</Text>
            <Text>Dette Précédente: {formatCurrency(userSummary.previousDebt)}</Text>
            <Text>Dette Actuelle: {formatCurrency(userSummary.currentDebt)}</Text>
          </View>
        ) : (
          <Text>Sélectionnez un utilisateur pour voir son résumé</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 16, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8 },
  button: { backgroundColor: "green", padding: 12, borderRadius: 6, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#999" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  option: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#ccc", marginBottom: 4 },
  selectedOption: { backgroundColor: "#d0f0c0" },
  toast: { backgroundColor: "#333", color: "#fff", padding: 8, textAlign: "center", marginBottom: 16, borderRadius: 6 },
});
