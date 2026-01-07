import React, { useEffect, useState, useMemo } from "react";
import { View, FlatList, StyleSheet, Alert, Dimensions } from "react-native";
import {
  Card,
  Text,
  TextInput,
  ActivityIndicator,
  Provider as PaperProvider,
  MD3DarkTheme,
  Button,
} from "react-native-paper";
import supabase from "../supabaseClient";

const { width, height } = Dimensions.get("window");

/* ===== THEME ===== */
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2563EB",
    secondary: "#10B981",
    accent: "#FACC15",
    error: "#EF4444",
    success: "#22C55E",
    background: "#0A0F1A",
    surface: "#1E293B",
    onSurface: "#F8FAFC",
    onBackground: "#F8FAFC",
    disabled: "#64748B",
    placeholder: "#94A3B8",
  },
};

export default function CourierPaymentsScreen() {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    init();
  }, []);

  /* ===== INIT ===== */
  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }

    setProfile(profileData);
    fetchPayments(profileData);
  };

  /* ===== FETCH PAYMENTS ===== */
  const fetchPayments = async (profileData) => {
    setLoading(true);
    try {
      let query = supabase
        .from("transactions_view")
        .select("*")
        .eq("type", "DEBIT")
        .order("created_at", { ascending: false });

      // kiosque voit seulement ses paiements
      if (profileData.role === "kiosque") {
        query = query.eq("cashier_id", profileData.id);
      }

      const { data, error } = await query;

      if (error) Alert.alert("Erreur", error.message);
      else setPayments(data || []);
    } catch (err) {
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== VALIDATION ADMIN ===== */
  const validatePayment = async (transactionId) => {
    Alert.alert(
      "Validation du paiement",
      "Confirmer la validation de ce paiement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Valider",
          onPress: async () => {
            const { error } = await supabase
              .from("transactions")
              .update({ status: "APPROVED" })
              .eq("id", transactionId);

            if (error) {
              Alert.alert("Erreur", error.message);
            } else {
              Alert.alert("Succès", "Paiement validé ✅");
              fetchPayments(profile);
            }
          },
        },
      ]
    );
  };

  /* ===== SEARCH ===== */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        p.cashier_name?.toLowerCase().includes(q) ||
        p.cashier_email?.toLowerCase().includes(q) ||
        p.kiosk_name?.toLowerCase().includes(q)
    );
  }, [payments, search]);

  /* ===== TOTAL ===== */
  const total = useMemo(() => {
    return filtered.reduce((sum, p) => sum + Number(p.amount), 0);
  }, [filtered]);

  if (loading)
    return (
      <PaperProvider theme={theme}>
        <ActivityIndicator style={{ marginTop: 30 }} />
      </PaperProvider>
    );

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* SEARCH */}
        <TextInput
          placeholder="Rechercher coursier ou boutique..."
          placeholderTextColor={theme.colors.placeholder}
          value={search}
          onChangeText={setSearch}
          style={[styles.search, { backgroundColor: theme.colors.surface }]}
          mode="outlined"
        />

        {/* TOTAL */}
        <Card style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.totalText, { color: theme.colors.success }]}>
              💰 Total payé : {total.toLocaleString("fr-FR")} FCFA
            </Text>
          </Card.Content>
        </Card>

        {/* LIST */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: height * 0.12 }}
          renderItem={({ item }) => (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
  <Card.Content>
    <Text style={[styles.amount, { color: theme.colors.primary }]}>
      {item.amount.toLocaleString("fr-FR")} FCFA
    </Text>

    <Text style={{ color: theme.colors.onSurface }}>
      👤 {item.cashier_name || item.cashier_email}
    </Text>

    <Text style={{ color: theme.colors.onSurface }}>
      🏪 {item.kiosk_name || "—"}
    </Text>

    <Text style={{ color: theme.colors.onSurface }}>
      📅 {new Date(item.created_at).toLocaleDateString("fr-FR")}
    </Text>

    <Text style={{ color: theme.colors.onSurface }}>
      🔄 Type :{" "}
      <Text style={{ fontWeight: "bold" }}>
        {item.transaction_type }
      </Text>
    </Text>

    <Text
      style={{
        marginTop: 6,
        fontWeight: "bold",
        color:
          item.transaction_status === "APPROVED"
            ? theme.colors.success
            : item.transaction_status === "REJECTED"
            ? theme.colors.error
            : theme.colors.accent,
      }}
    >
      Statut :{" "}
      {item.transaction_status === "APPROVED"
        ? "Approuvé"
        : item.transaction_status === "REJECTED"
        ? "Rejeté"
        : "En attente"}
    </Text>

    {profile?.role === "admin" && item.transaction_status === "PENDING" && (
      <Button
        mode="contained"
        style={{ marginTop: 10 }}
        buttonColor={theme.colors.success}
        onPress={() => validatePayment(item.id)}
      >
        Valider le paiement
      </Button>
    )}
  </Card.Content>
</Card>

          )}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.onSurface, textAlign: "center", marginTop: 20 }}>
              Aucune transaction trouvée.
            </Text>
          }
        />
      </View>
    </PaperProvider>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.04,
  },
  search: {
    marginBottom: height * 0.015,
  },
  totalCard: {
    marginBottom: 10,
    borderRadius: 12,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
});
