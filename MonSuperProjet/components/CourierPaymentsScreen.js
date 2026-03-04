import React, { useEffect, useState, useMemo } from "react";
import { View, FlatList, StyleSheet, Alert, Dimensions, StatusBar } from "react-native";
import {
  Card,
  Text,
  TextInput,
  ActivityIndicator,
  Button,
  useTheme, // Hook pour utiliser le thème de App.js
} from "react-native-paper";
import supabase from "../supabaseClient";

const { width, height } = Dimensions.get("window");

export default function CourierPaymentsScreen() {
  const { colors } = useTheme(); // RÉCUPÉRATION DU THÈME GLOBAL
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
    if (!profile) return;
    const interval = setInterval(() => {
      fetchPayments(profile);
    }, 30000); 
    return () => clearInterval(interval);
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

  /* ===== ACTIONS ===== */
  const validatePayment = (id) => {
    Alert.alert("Validation", "Confirmer ce paiement ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Valider",
        onPress: async () => {
          const { error } = await supabase.from("transactions").update({ status: "APPROVED" }).eq("id", id);
          if (!error) fetchPayments(profile);
        },
      },
    ]);
  };

  const validateAllPayments = async () => {
    if (pendingPayments.length === 0) return;
    Alert.alert("Validation globale", `Valider ${pendingPayments.length} paiement(s) ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Tout valider",
        onPress: async () => {
          setValidatingAll(true);
          const ids = pendingPayments.map(p => p.id);
          const { error } = await supabase.from("transactions").update({ status: "APPROVED" }).in("id", ids);
          if (!error) fetchPayments(profile);
          setValidatingAll(false);
        },
      },
    ]);
  };

  if (loading && payments.length === 0) {
    return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.background }} size="large" color={colors.primary} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* SEARCH */}
      <TextInput
        placeholder="Rechercher coursier ou boutique..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        mode="outlined"
        outlineColor={colors.outline}
        activeOutlineColor={colors.primary}
      />

      {/* TOTAL CARD */}
      <Card style={[styles.totalCard, { backgroundColor: colors.surface }]} elevation={2}>
        <Card.Content>
          <Text style={[styles.totalLabel, { color: colors.onSurfaceVariant }]}>TOTAL RECOUVREMENTS</Text>
          <Text style={[styles.totalValue, { color: colors.success }]}>
            {total.toLocaleString("fr-FR")} FCFA
          </Text>

          {profile?.role === "admin" && (
            <Button
              mode="contained"
              icon="check-all"
              loading={validatingAll}
              disabled={pendingPayments.length === 0 || validatingAll}
              onPress={validateAllPayments}
              style={styles.validateAllBtn}
            >
              Tout valider ({pendingPayments.length})
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* PAYMENTS LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={1}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={[styles.amount, { color: colors.onSurface }]}>
                  {item.amount.toLocaleString("fr-FR")} <Text style={{fontSize: 12}}>FCFA</Text>
                </Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: 
                    item.transaction_status === "APPROVED" ? colors.success + '15' : 
                    item.transaction_status === "REJECTED" ? colors.error + '15' : "#FACC1520" 
                }]}>
                  <Text style={[styles.statusText, { 
                    color: 
                      item.transaction_status === "APPROVED" ? colors.success : 
                      item.transaction_status === "REJECTED" ? colors.error : "#B45309" 
                  }]}>
                    {item.transaction_status === "APPROVED" ? "Approuvé" : item.transaction_status === "REJECTED" ? "Rejeté" : "En attente"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailRow}><Text style={{fontWeight: 'bold'}}>👤</Text> {item.cashier_name || item.cashier_email}</Text>
                <Text style={styles.detailRow}><Text style={{fontWeight: 'bold'}}>🏪</Text> {item.kiosk_name || "—"}</Text>
                <Text style={styles.detailRow}><Text style={{fontWeight: 'bold'}}>📅</Text> {new Date(item.created_at).toLocaleDateString("fr-FR")} à {new Date(item.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Text>
              </View>

              {profile?.role === "admin" && item.transaction_status === "PENDING" && (
                <Button
                  mode="contained-tonal"
                  style={{ marginTop: 12 }}
                  onPress={() => validatePayment(item.id)}
                  buttonColor={colors.primary}
                  textColor="white"
                >
                  Valider la réception
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
            Aucun recouvrement trouvé
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  search: { marginBottom: 16, backgroundColor: '#FFF' },
  totalCard: { borderRadius: 16, marginBottom: 16, borderLeftWidth: 6, borderLeftColor: "#10B981" },
  totalLabel: { textAlign: "center", fontSize: 11, fontWeight: "bold", letterSpacing: 1 },
  totalValue: { textAlign: "center", fontSize: 22, fontWeight: "900", marginVertical: 4 },
  validateAllBtn: { marginTop: 8, borderRadius: 8 },
  card: { marginVertical: 6, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  amount: { fontWeight: "900", fontSize: 18 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  detailsContainer: { gap: 4, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 },
  detailRow: { fontSize: 13, color: "#444" },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },
});