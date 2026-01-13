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
  const [validatingAll, setValidatingAll] = useState(false);

  useEffect(() => {
    init();
  }, []);

  /* ===== AUTO-REFRESH ===== */
useEffect(() => {
  if (!profile) return; // attendre que le profile soit chargé
  const interval = setInterval(() => {
    fetchPayments(profile);
  }, 30000); // toutes les 30 secondes
  return () => clearInterval(interval); // nettoyage à la destruction du composant
}, [profile]);

  /* ===== INIT ===== */
  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }

    setProfile(data);
    fetchPayments(data);
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

      if (profileData.role === "kiosque") {
        query = query.eq("cashier_id", profileData.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPayments(data || []);
    } catch (err) {
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
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

  /* ===== PENDING ===== */
  const pendingPayments = useMemo(
    () => filtered.filter(p => p.transaction_status === "PENDING"),
    [filtered]
  );

  /* ===== TOTAL ===== */
  const total = useMemo(
    () => filtered.reduce((sum, p) => sum + Number(p.amount), 0),
    [filtered]
  );

  /* ===== VALIDATION SINGLE ===== */
  const validatePayment = (id) => {
    Alert.alert(
      "Validation",
      "Confirmer la validation de ce paiement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Valider",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("transactions")
                .update({ status: "APPROVED" })
                .eq("id", id);

              if (error) throw error;

              fetchPayments(profile);
            } catch (err) {
              Alert.alert("Erreur", err.message);
            }
          },
        },
      ]
    );
  };

  /* ===== VALIDATION ALL ===== */
  const validateAllPayments = () => {
    if (pendingPayments.length === 0) return;

    Alert.alert(
      "Validation globale",
      `Valider ${pendingPayments.length} paiement(s) ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Tout valider",
          style: "destructive",
          onPress: async () => {
            try {
              setValidatingAll(true);
              const ids = pendingPayments.map(p => p.id);

              const { error } = await supabase
                .from("transactions")
                .update({ status: "APPROVED" })
                .in("id", ids);

              if (error) throw error;

              fetchPayments(profile);
            } catch (err) {
              Alert.alert("Erreur", err.message);
            } finally {
              setValidatingAll(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <ActivityIndicator style={{ marginTop: 30 }} />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* SEARCH */}
        <TextInput
          placeholder="Rechercher coursier ou boutique..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          mode="outlined"
        />

        {/* TOTAL */}
        <Card style={styles.totalCard}>
          <Card.Content>
            <Text style={[styles.totalText, { color: theme.colors.success }]}>
              💰 TOTAL DES RECOUVREMENTS : {total.toLocaleString("fr-FR")} FCFA
            </Text>

            {profile?.role === "admin" && (
              <Button
                mode="contained"
                icon="check-all"
                loading={validatingAll}
                disabled={pendingPayments.length === 0 || validatingAll}
                onPress={validateAllPayments}
                style={{ marginTop: 10 }}
              >
                {pendingPayments.length === 0
                  ? "Aucun paiement à valider"
                  : `Tout valider (${pendingPayments.length})`}
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* LIST */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: height * 0.12 }}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.amount}>
                  {item.amount.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text>👤 {item.cashier_name || item.cashier_email}</Text>
                <Text>🏪 {item.kiosk_name || "—"}</Text>
                <Text>📅 {new Date(item.created_at).toLocaleDateString("fr-FR")}</Text>

                <Text style={{ fontWeight: "bold", marginTop: 6 }}>
                  Statut :{" "}
                  <Text
                    style={{
                      color:
                        item.transaction_status === "APPROVED"
                          ? theme.colors.success
                          : item.transaction_status === "REJECTED"
                          ? theme.colors.error
                          : theme.colors.accent,
                    }}
                  >
                    {item.transaction_status === "APPROVED"
                      ? "Approuvé"
                      : item.transaction_status === "REJECTED"
                      ? "Rejeté"
                      : "En attente"}
                  </Text>
                </Text>

                {profile?.role === "admin" &&
                  item.transaction_status === "PENDING" && (
                    <Button
                      mode="contained"
                      style={{ marginTop: 10 }}
                      onPress={() => validatePayment(item.id)}
                    >
                      Valider
                    </Button>
                  )}
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Aucune transaction trouvée
            </Text>
          }
        />
      </View>
    </PaperProvider>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: { flex: 1, padding: width * 0.04 },
  search: { marginBottom: 12 },
  totalCard: { borderRadius: 12, marginBottom: 10 },
  totalText: { fontSize: 16, fontWeight: "bold" },
  card: { marginVertical: 6, borderRadius: 12 },
  amount: { fontWeight: "bold", fontSize: 16 },
});
