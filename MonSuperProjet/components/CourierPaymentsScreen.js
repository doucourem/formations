import React, { useEffect, useState, useMemo } from "react";
import { View, FlatList, StyleSheet, Alert, Dimensions } from "react-native";
import {
  Card,
  Text,
  TextInput,
  ActivityIndicator,
  Provider as PaperProvider,
  MD3DarkTheme,
} from "react-native-paper";
import supabase from "../supabaseClient";

const { width, height } = Dimensions.get("window");

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

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) return Alert.alert("Erreur", error.message);

    setProfile(profileData);
    fetchPayments(profileData);
  };

  const fetchPayments = async (profileData) => {
    setLoading(true);

    try {
      let query = supabase
        .from("transactions_view") // vue recommandée
        .select("*")
        .eq("type", "DEBIT")
        .order("created_at", { ascending: false });

      if (profileData.role === "kiosque") query = query.eq("cashier_id", profileData.id);

      const { data, error } = await query;

      if (error) Alert.alert("Erreur", error.message);
      else setPayments(data || []);
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
        <TextInput
          placeholder="Rechercher coursier ou boutique..."
          placeholderTextColor={theme.colors.placeholder}
          value={search}
          onChangeText={setSearch}
          style={[styles.search, { backgroundColor: theme.colors.surface, color: theme.colors.onSurface }]}
          mode="outlined"
        />

        <Card style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.totalText, { color: theme.colors.success }]}>
              💰 Total payé : {total.toLocaleString("fr-FR")} FCFA
            </Text>
          </Card.Content>
        </Card>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.amount, { color: theme.colors.primary }]}>
                  {item.amount.toLocaleString("fr-FR")} FCFA
                </Text>
                <Text style={{ color: theme.colors.onSurface }}>👤 {item.cashier_name || item.cashier_email}</Text>
                <Text style={{ color: theme.colors.onSurface }}>🏪 {item.kiosk_name || "—"}</Text>
                <Text style={{ color: theme.colors.onSurface }}>
                  📅 {new Date(item.created_at).toLocaleDateString("fr-FR")}
                </Text>
                {item.note && <Text style={{ color: theme.colors.placeholder }}>📝 {item.note}</Text>}
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={{ paddingBottom: height * 0.12 }}
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
  container: { flex: 1, padding: width * 0.04 },
  search: { marginBottom: height * 0.015 },
  totalCard: {
    marginHorizontal: 0,
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
