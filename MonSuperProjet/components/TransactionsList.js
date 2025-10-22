import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

  // === Récupération données ===
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
    const enriched = txData
      .map((t) => {
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
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

    setFilteredTransactions(filtered);
  }, [dateFilter, typeFilter, transactions]);

  // === Création / Mise à jour transaction ===
  const handleSaveTransaction = async () => {
    const { cashId, amount, transactionType, type } = form;
    if (!cashId || !amount)
      return Alert.alert("Champs requis", "Veuillez remplir tous les champs.");

    if (editMode && editingId) {
      const { error } = await supabase
        .from("transactions")
        .update({
          cash_id: cashId,
          amount: parseFloat(amount),
          type,
          transaction_type: transactionType,
        })
        .eq("id", editingId);
      if (error) return Alert.alert("Erreur", error.message);
    } else {
      const { error } = await supabase.from("transactions").insert([
        {
          cash_id: cashId,
          amount: parseFloat(amount),
          type,
          transaction_type: transactionType,
          created_at: new Date(),
        },
      ]);
      if (error) return Alert.alert("Erreur", error.message);
    }

    setDialogVisible(false);
    setForm({ cashId: null, cashQuery: "", amount: "", type: "CREDIT", transactionType: "Vente UV" });
    setEditMode(false);
    setEditingId(null);
    fetchCashesAndTransactions();
  };

  // === Suppression transaction ===
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

  // === Préparation modification ===
  const openEditDialog = (item) => {
    setEditMode(true);
    setEditingId(item.id);
    setForm({
      cashId: item.cash_id,
      cashQuery: item.cash_name,
      amount: item.amount.toString(),
      type: item.type,
      transactionType: item.transaction_type,
    });
    setDialogVisible(true);
  };

  const formatCFA = (a) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(a);

  // === Rendu item ===
  const renderItem = ({ item }) => {
    const isCredit = item.type === "CREDIT";
    return (
      <Card style={styles.card}>
        <Card.Title
          title={` ${isCredit ? "Entrée" : "Paiement"}`}
          subtitle={`${item.cash_name} — ${item.kiosk_name}`}
          left={(props) => (
            <MaterialCommunityIcons
              {...props}
              name={isCredit ? "arrow-down-bold-circle" : "arrow-up-bold-circle"}
              color={isCredit ? "green" : "red"}
              size={26}
            />
          )}
          right={() => (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => openEditDialog(item)}
                style={[styles.actionBtn, { backgroundColor: "orange", marginRight: 6 }]}
              >
                <MaterialCommunityIcons name="pencil" color="white" size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteTransaction(item.id)}
                style={[styles.actionBtn, { backgroundColor: "red" }]}
              >
                <MaterialCommunityIcons name="delete" color="white" size={18} />
              </TouchableOpacity>
            </View>
          )}
        />
        <Card.Content>
          <Text>
            Montant :{" "}
            <Text style={{ fontWeight: "bold", color: isCredit ? "green" : "red" }}>
              {formatCFA(item.amount)}
            </Text>
          </Text>
          <Text>Date : {new Date(item.created_at).toLocaleString()}</Text>
          <Text>Solde après : {formatCFA(item.balance_after)}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Transactions
        </Text>

        <SegmentedButtons
          value={dateFilter}
          onValueChange={setDateFilter}
          buttons={[
            { value: "all", label: "Toutes" },
            { value: "today", label: "Aujourd’hui" },
            { value: "week", label: "Cette semaine" },
            { value: "month", label: "Ce mois" },
          ]}
          style={{ marginBottom: 8 }}
        />

        <SegmentedButtons
          value={typeFilter}
          onValueChange={setTypeFilter}
          buttons={[
            { value: "all", label: "Tous" },
            { value: "CREDIT", label: "Paiement" },
            { value: "DEBIT", label: "Entrée" },
            { value: "Vente UV", label: "Vente UV" },
          ]}
          style={{ marginBottom: 12 }}
        />

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(i) => i.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text>Aucune transaction trouvée.</Text>}
          />
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          label="Nouvelle transaction"
          onPress={() => {
            setEditMode(false);
            setEditingId(null);
            setForm({
              cashId: null,
              cashQuery: "",
              amount: "",
              type: "CREDIT",
              transactionType: "Vente UV",
            });
            setDialogVisible(true);
          }}
        />

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>
              {editMode ? "Modifier la transaction" : "Créer une transaction"}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Rechercher une caisse"
                value={form.cashQuery}
                onChangeText={(text) => setForm({ ...form, cashQuery: text })}
                style={{ marginBottom: 12 }}
              />
              {form.cashQuery.length > 0 && (
                <FlatList
                  data={cashes.filter((c) =>
                    c.name.toLowerCase().includes(form.cashQuery.toLowerCase())
                  )}
                  keyExtractor={(c) => c.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        setForm({
                          ...form,
                          cashId: item.id,
                          cashQuery: item.name,
                        })
                      }
                      style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 120 }}
                />
              )}

              <TextInput
                label="Montant"
                keyboardType="numeric"
                value={form.amount}
                onChangeText={(text) => setForm({ ...form, amount: text })}
                style={{ marginBottom: 12 }}
              />

              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <Button
                  mode={form.type === "CREDIT" ? "contained" : "outlined"}
                  onPress={() => setForm({ ...form, type: "CREDIT" })}
                  style={{ marginRight: 8 }}
                >
                  Paiement
                </Button>
                <Button
                  mode={form.type === "DEBIT" ? "contained" : "outlined"}
                  onPress={() => setForm({ ...form, type: "DEBIT" })}
                >
                  Entrée
                </Button>
              </View>

              <Text style={{ marginBottom: 4 }}>Type de transaction :</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {TRANSACTION_TYPES.map((t) => (
                  <Button
                    key={t}
                    mode={form.transactionType === t ? "contained" : "outlined"}
                    onPress={() => setForm({ ...form, transactionType: t })}
                    style={{ marginRight: 8, marginBottom: 4 }}
                  >
                    {t}
                  </Button>
                ))}
              </View>
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Annuler</Button>
              <Button mode="contained" onPress={handleSaveTransaction}>
                {editMode ? "Mettre à jour" : "Créer"}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { textAlign: "center", marginBottom: 12, fontWeight: "bold" },
  card: { marginBottom: 10, borderRadius: 10, elevation: 2 },
  actionBtn: { padding: 6, borderRadius: 8 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
