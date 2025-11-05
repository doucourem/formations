import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Text,
  Provider as PaperProvider,
  Card,
  FAB,
  SegmentedButtons,
  MD3DarkTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

const TRANSACTION_TYPES = ["Vente UV", "Dépôt cash", "Retrait cash", "Transfert", "Autre"];

// Fonction responsive pour texte
const responsiveFont = (f) => Math.round(f * (width / 375));

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    cashId: null,
    cashQuery: "",
    amount: "",
    type: "CREDIT",
    transactionType: "Vente UV",
    otherType: "",
  });

  // === Auth utilisateur ===
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(data.user);
    };
    loadUser();
  }, []);

  // === Récupération données ===
  const fetchCashesAndTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const { data: kiosksData } = await supabase.from("kiosks").select("id, name");
      const kioskIds = kiosksData.map((k) => k.id);

      let cashesData;
      if (profile?.role === "kiosque") {
        const { data, error } = await supabase
          .from("cashes")
          .select("id, name, kiosk_id, balance")
          .eq("cashier_id", user.id);
        cashesData = data; if (error) throw error;
      } else {
        const { data, error } = await supabase.from("cashes").select("id, name, kiosk_id, balance");
        cashesData = data; if (error) throw error;
      }

      const cashIds = cashesData.map((c) => c.id);
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .in("cash_id", cashIds)
        .order("created_at", { ascending: false });

      const cashBalances = {};
      const enriched = txData.map((t) => {
        const isCredit = t.type === "CREDIT";
        const prev = cashBalances[t.cash_id] || 0;
        const newBal = isCredit ? prev + t.amount : prev - t.amount;
        cashBalances[t.cash_id] = newBal;

        const cash = cashesData.find((c) => c.id === t.cash_id);
        const kiosk = kiosksData.find((k) => k.id === cash?.kiosk_id);

        return {
          ...t,
          cash_name: cash?.name,
          kiosk_name: kiosk?.name,
          balance_after: newBal,
        };
      });

      setTransactions(enriched);
      setCashes(cashesData);
      setKiosks(kiosksData);
      setLoading(false);
    } catch (err) {
      Alert.alert("Erreur", err.message);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCashesAndTransactions();
  }, [fetchCashesAndTransactions]);

  // === Filtrage combiné ===
  useEffect(() => {
    if (!transactions.length) return;
    const now = new Date();
    let filtered = transactions;

    if (dateFilter === "today") {
      filtered = filtered.filter((t) => {
        const d = new Date(t.created_at);
        return d.toDateString() === now.toDateString();
      });
    } else if (dateFilter === "week") {
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - now.getDay());
      filtered = filtered.filter((t) => new Date(t.created_at) >= firstDay);
    } else if (dateFilter === "month") {
      filtered = filtered.filter(
        (t) => new Date(t.created_at).getMonth() === now.getMonth() &&
               new Date(t.created_at).getFullYear() === now.getFullYear()
      );
    }

    if (typeFilter !== "all") filtered = filtered.filter((t) => t.type === typeFilter);

    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter((t) =>
        t.cash_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [dateFilter, typeFilter, searchQuery, transactions]);

  // === CRUD ===
  const handleSaveTransaction = async () => {
    const { cashId, amount, transactionType, type, otherType } = form;
    if (!cashId || !amount) return Alert.alert("Champs requis", "Veuillez remplir tous les champs.");

    try {
      if (editMode && editingId) {
        const { error } = await supabase
          .from("transactions")
          .update({
            cash_id: cashId,
            amount: parseFloat(amount),
            type,
            transaction_type: transactionType === "Autre" ? otherType : transactionType,
          })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert([{
          cash_id: cashId,
          amount: parseFloat(amount),
          type,
          transaction_type: transactionType === "Autre" ? otherType : transactionType,
          created_at: new Date(),
        }]);
        if (error) throw error;

        const selectedCash = cashes.find((c) => c.id === cashId);
        if (selectedCash) {
          const newBalance =
            type === "CREDIT"
              ? selectedCash.balance + parseFloat(amount)
              : selectedCash.balance - parseFloat(amount);
          await supabase.from("cashes").update({ balance: newBalance }).eq("id", cashId);
        }
      }

      setDialogVisible(false);
      setForm({ cashId: null, cashQuery: "", amount: "", type: "CREDIT", transactionType: "Vente UV", otherType: "" });
      setEditMode(false);
      setEditingId(null);
      fetchCashesAndTransactions();
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    Alert.alert("Confirmation", "Supprimer cette transaction ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
        const { error } = await supabase.from("transactions").delete().eq("id", id);
        if (error) return Alert.alert("Erreur", error.message);
        fetchCashesAndTransactions();
      }},
    ]);
  };

  const openEditDialog = (item) => {
    setEditMode(true);
    setEditingId(item.id);
    setForm({
      cashId: item.cash_id,
      cashQuery: item.cash_name,
      amount: item.amount.toString(),
      type: item.type,
      transactionType: TRANSACTION_TYPES.includes(item.transaction_type) ? item.transaction_type : "Autre",
      otherType: !TRANSACTION_TYPES.includes(item.transaction_type) ? item.transaction_type : "",
    });
    setDialogVisible(true);
  };

  const formatCFA = (a) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(a);

  const renderItem = ({ item }) => {
    const isCredit = item.type === "CREDIT";
    return (
      <Card style={[styles.card, { borderRadius: width * 0.02 }]}>
        <Card.Title
          title={isCredit ? "Entrée" : "Paiement"}
          subtitle={`${item.cash_name} — ${item.kiosk_name}`}
          left={(props) => (
            <MaterialCommunityIcons
              {...props}
              name={isCredit ? "arrow-down-bold-circle" : "arrow-up-bold-circle"}
              color={isCredit ? theme.colors.success : theme.colors.error}
              size={width * 0.07}
            />
          )}
          right={() => (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => openEditDialog(item)} style={[styles.actionBtn, { backgroundColor: "orange", marginRight: width * 0.02 }]}>
                <MaterialCommunityIcons name="pencil" color="white" size={width * 0.045} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)} style={[styles.actionBtn, { backgroundColor: "red" }]}>
                <MaterialCommunityIcons name="delete" color="white" size={width * 0.045} />
              </TouchableOpacity>
            </View>
          )}
        />
        <Card.Content>
          <Text>
            Montant : <Text style={{ fontWeight: "bold", color: isCredit ? theme.colors.success : theme.colors.error }}>{formatCFA(item.amount)}</Text>
          </Text>
          <Text>Date : {new Date(item.created_at).toLocaleString()}</Text>
          <Text>Type : {item.transaction_type}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={[styles.title, { fontSize: responsiveFont(22), color: theme.colors.onBackground }]}>
          Transactions
        </Text>

        <TextInput
          placeholder="🔍 Rechercher une caisse..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: height * 0.015 }}
          mode="outlined"
        />

        <SegmentedButtons
          value={dateFilter}
          onValueChange={setDateFilter}
          buttons={[
            { value: "all", label: "Toutes" },
            { value: "today", label: "Aujourd’hui" },
            { value: "week", label: "Cette semaine" },
            { value: "month", label: "Ce mois" },
          ]}
          style={{ marginBottom: height * 0.01 }}
        />

        <SegmentedButtons
          value={typeFilter}
          onValueChange={setTypeFilter}
          buttons={[
            { value: "all", label: "Tous" },
            { value: "CREDIT", label: "Entrée" },
            { value: "DEBIT", label: "Paiement" },
          ]}
          style={{ marginBottom: height * 0.02 }}
        />

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: height * 0.05 }} />
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(i) => i.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: height * 0.12 }}
            ListEmptyComponent={<Text style={{ color: theme.colors.onSurface, textAlign: "center" }}>Aucune transaction trouvée.</Text>}
          />
        )}

        <FAB
          icon="plus"
          style={[styles.fab, { bottom: height * 0.03, right: width * 0.04 }]}
          onPress={() => {
            setEditMode(false);
            setEditingId(null);
            setForm({ cashId: null, cashQuery: "", amount: "", type: "CREDIT", transactionType: "Vente UV", otherType: "" });
            setDialogVisible(true);
          }}
          color="white"
          label="Nouvelle"
        />

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: width * 0.04 }}>
            <Dialog.Title style={{ textAlign: "center", color: theme.colors.onSurface, fontWeight: "bold", fontSize: responsiveFont(18) }}>
              {editMode ? "Modifier la transaction" : "Nouvelle transaction"}
            </Dialog.Title>
            <Dialog.ScrollArea style={{ maxHeight: height * 0.7, paddingHorizontal: width * 0.03 }}>
              <Dialog.Content>
                <TextInput
                  label="Rechercher une caisse"
                  value={form.cashQuery}
                  onChangeText={(text) => setForm({ ...form, cashQuery: text })}
                  mode="outlined"
                  style={{ marginBottom: height * 0.01 }}
                  right={<TextInput.Icon icon="magnify" />}
                />
                {form.cashQuery.length > 0 && (
                  <View style={{ maxHeight: height * 0.25, borderWidth: 1, borderColor: "#475569", borderRadius: width * 0.02, overflow: "hidden", marginBottom: height * 0.015 }}>
                    <FlatList
                      data={cashes.filter((c) => c.name.toLowerCase().includes(form.cashQuery.toLowerCase()))}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => setForm({ ...form, cashId: item.id, cashQuery: item.name })} style={{ paddingVertical: height * 0.012, paddingHorizontal: width * 0.03, backgroundColor: form.cashId === item.id ? "#1E3A8A" : "transparent" }}>
                          <Text style={{ color: form.cashId === item.id ? "white" : theme.colors.onSurface, fontWeight: form.cashId === item.id ? "600" : "normal" }}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
                <TextInput label="Montant" keyboardType="numeric" value={form.amount} onChangeText={(text) => setForm({ ...form, amount: text })} mode="outlined" style={{ marginBottom: height * 0.015 }} />

                <Text style={{ marginBottom: 6, fontWeight: "600", color: theme.colors.onSurface }}>Type :</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: height * 0.02 }}>
                  <Button mode={form.type === "CREDIT" ? "contained" : "outlined"} onPress={() => setForm({ ...form, type: "CREDIT" })} style={{ flex: 1, marginRight: width * 0.01 }} buttonColor={form.type === "CREDIT" ? theme.colors.success : undefined} textColor={form.type === "CREDIT" ? "white" : theme.colors.onSurface}>Entrée</Button>
                  <Button mode={form.type === "DEBIT" ? "contained" : "outlined"} onPress={() => setForm({ ...form, type: "DEBIT" })} style={{ flex: 1, marginLeft: width * 0.01 }} buttonColor={form.type === "DEBIT" ? theme.colors.error : undefined} textColor={form.type === "DEBIT" ? "white" : theme.colors.onSurface}>Paiement</Button>
                </View>

                <Text style={{ marginBottom: 6, fontWeight: "600", color: theme.colors.onSurface }}>Type de transaction :</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: height * 0.015 }}>
                  {TRANSACTION_TYPES.map((t) => (
                    <Button key={t} mode={form.transactionType === t ? "contained" : "outlined"} onPress={() => setForm({ ...form, transactionType: t, otherType: "" })} style={{ marginVertical: 4, flexBasis: "48%", minWidth: width * 0.4, maxWidth: width * 0.48 }} buttonColor={form.transactionType === t ? theme.colors.primary : undefined} textColor={form.transactionType === t ? "white" : theme.colors.onSurface}>{t}</Button>
                  ))}
                </View>

                {form.transactionType === "Autre" && (
                  <TextInput label="Précisez le type de transaction" value={form.otherType} onChangeText={(text) => setForm({ ...form, otherType: text })} mode="outlined" style={{ marginBottom: height * 0.015 }} />
                )}
              </Dialog.Content>
            </Dialog.ScrollArea>

            <Dialog.Actions style={{ justifyContent: "space-between", paddingHorizontal: width * 0.04 }}>
              <Button onPress={() => setDialogVisible(false)} textColor="#64748B">Annuler</Button>
              <Button mode="contained" onPress={handleSaveTransaction} buttonColor={theme.colors.primary} textColor="white">{editMode ? "Modifier" : "Enregistrer"}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: width * 0.04 },
  title: { fontWeight: "bold", marginBottom: height * 0.015 },
  card: { marginBottom: height * 0.01, elevation: 2 },
  fab: { position: "absolute", backgroundColor: "#2563EB", zIndex: 10 },
  actionBtn: { padding: width * 0.015, borderRadius: width * 0.015 },
});
