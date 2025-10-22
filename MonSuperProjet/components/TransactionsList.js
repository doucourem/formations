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
  Card,
  FAB,
  SegmentedButtons,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import supabase from "../supabaseClient";

const TRANSACTION_TYPES = [
  "CREDIT",
  "DEBIT",
  "Vente UV",
  "Dépôt cash",
  "Retrait cash",
  "Transfert",
  "Autre",
];

export default function TransactionsList() {
  const { colors } = useTheme();
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
  });

  // === Auth ===
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(data.user);
    };
    loadUser();
  }, []);

  // === Fetch données ===
  const fetchCashesAndTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: kiosksData } = await supabase
      .from("kiosks")
      .select("id, name")
      .eq("owner_id", user.id);

    const kioskIds = kiosksData.map((k) => k.id);
    const { data: cashesData } = await supabase
      .from("cashes")
      .select("id, name, kiosk_id")
      .in("kiosk_id", kioskIds);

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
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    } else if (dateFilter === "week") {
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      filtered = filtered.filter((t) => new Date(t.created_at) >= firstDayOfWeek);
    } else if (dateFilter === "month") {
      filtered = filtered.filter(
        (t) =>
          new Date(t.created_at).getMonth() === now.getMonth() &&
          new Date(t.created_at).getFullYear() === now.getFullYear()
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.cash_name?.toLowerCase().includes(q) ||
          t.kiosk_name?.toLowerCase().includes(q)
      );
    }

    setFilteredTransactions(filtered);
  }, [dateFilter, typeFilter, transactions, searchQuery]);

  // === Actions ===
  const handleSaveTransaction = async () => {
    const { cashId, amount, transactionType, type } = form;
    if (!cashId || !amount) return Alert.alert("Champs requis", "Veuillez remplir tous les champs.");

    if (editMode && editingId) {
      const { error } = await supabase
        .from("transactions")
        .update({ cash_id: cashId, amount: parseFloat(amount), type, transaction_type: transactionType })
        .eq("id", editingId);
      if (error) return Alert.alert("Erreur", error.message);
    } else {
      const { error } = await supabase
        .from("transactions")
        .insert([{ cash_id: cashId, amount: parseFloat(amount), type, transaction_type: transactionType, created_at: new Date() }]);
      if (error) return Alert.alert("Erreur", error.message);
    }

    setDialogVisible(false);
    setEditMode(false);
    setEditingId(null);
    setForm({ cashId: null, cashQuery: "", amount: "", type: "CREDIT", transactionType: "Vente UV" });
    fetchCashesAndTransactions();
  };

  const handleDeleteTransaction = async (id) => {
    Alert.alert("Confirmation", "Supprimer cette transaction ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("transactions").delete().eq("id", id);
          if (error) return Alert.alert("Erreur", error.message);
          fetchCashesAndTransactions();
        },
      },
    ]);
  };

  const openEditDialog = (item) => {
    setEditMode(true);
    setEditingId(item.id);
    setForm({ cashId: item.cash_id, cashQuery: item.cash_name, amount: item.amount.toString(), type: item.type, transactionType: item.transaction_type });
    setDialogVisible(true);
  };

  const formatCFA = (a) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(a);

  const renderItem = ({ item }) => {
    const isCredit = item.type === "CREDIT";
    return (
      <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Card.Title
          title={`${isCredit ? "Entrée" : "Paiement"}`}
          subtitle={`${item.cash_name} — ${item.kiosk_name}`}
          titleStyle={{ color: colors.onSurface }}
          subtitleStyle={{ color: colors.placeholder , fontSize: 11 }}
          left={(props) => <MaterialCommunityIcons {...props} name={isCredit ? "arrow-down-bold-circle" : "arrow-up-bold-circle"} color={isCredit ? colors.success : colors.error} size={26} />}
          right={() => (
            <View style={styles.actionContainer}>
              <TouchableOpacity onPress={() => openEditDialog(item)} style={[styles.actionBtn, { backgroundColor: colors.accent }]}>
                <MaterialCommunityIcons name="pencil" color="#000" size={18} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)} style={[styles.actionBtn, { backgroundColor: colors.error }]}>
                <MaterialCommunityIcons name="delete" color="#fff" size={18} />
              </TouchableOpacity>
            </View>
          )}
        />
        <Card.Content>
          <Text style={{ color: colors.onSurface }}>
            Montant : <Text style={{ fontWeight: "bold", color: isCredit ? colors.success : colors.error }}>{formatCFA(item.amount)}</Text>
          </Text>
          <Text style={{ color: colors.placeholder }}>Date : {new Date(item.created_at).toLocaleString()}</Text>
          <Text style={{ color: colors.placeholder }}>Solde après : {formatCFA(item.balance_after)}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>Transactions</Text>

      <TextInput label="Rechercher une caisse ou un kiosque" value={searchQuery} onChangeText={setSearchQuery} mode="outlined" left={<TextInput.Icon icon="magnify" />} activeOutlineColor={colors.primary} style={{ marginBottom: 12 }} />

      <SegmentedButtons value={dateFilter} onValueChange={setDateFilter} buttons={[{ value: "all", label: "Toutes" }, { value: "today", label: "Aujourd’hui" }, { value: "week", label: "Cette semaine" }, { value: "month", label: "Ce mois" }]} style={{ marginBottom: 8 }} />

      <SegmentedButtons value={typeFilter} onValueChange={setTypeFilter} buttons={[{ value: "all", label: "Tous" }, { value: "CREDIT", label: "Entrée" }, { value: "DEBIT", label: "Paiement" }, { value: "Vente UV", label: "Vente UV" }]} style={{ marginBottom: 12 }} />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList data={filteredTransactions} keyExtractor={(i) => i.id.toString()} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 100 }} />
      )}

      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} label="Nouvelle transaction" onPress={() => { setEditMode(false); setEditingId(null); setForm({ cashId: null, cashQuery: "", amount: "", type: "CREDIT", transactionType: "Vente UV" }); setDialogVisible(true); }} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editMode ? "Modifier la transaction" : "Créer une transaction"}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Rechercher une caisse" value={form.cashQuery} onChangeText={(text) => setForm({ ...form, cashQuery: text })} style={{ marginBottom: 12 }} />
            {form.cashQuery.length > 0 && (
              <FlatList
                data={cashes.filter((c) => c.name.toLowerCase().includes(form.cashQuery.toLowerCase()))}
                keyExtractor={(c) => c.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setForm({ ...form, cashId: item.id, cashQuery: item.name })} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: colors.outline }}>
                    <Text style={{ color: colors.onSurface }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 120 }}
              />
            )}
            <TextInput label="Montant" keyboardType="numeric" value={form.amount} onChangeText={(text) => setForm({ ...form, amount: text })} style={{ marginBottom: 12 }} />
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Annuler</Button>
            <Button mode="contained" onPress={handleSaveTransaction}>{editMode ? "Mettre à jour" : "Créer"}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { textAlign: "center", marginBottom: 12, fontWeight: "bold" },
  card: { marginBottom: 10, borderRadius: 10, elevation: 3, borderWidth: 1 },
  actionContainer: { flexDirection: "row" },
  actionBtn: { padding: 6, borderRadius: 8, marginHorizontal: 2 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
