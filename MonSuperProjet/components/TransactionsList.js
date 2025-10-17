import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Text,
  Provider as PaperProvider,
  Card,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import supabase from "../supabaseClient";

// Types de transaction autorisés par la base
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
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [user, setUser] = useState(null);

  const [open, setOpen] = useState(false);
  const [cashId, setCashId] = useState(null);
  const [cashQuery, setCashQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [transactionType, setTransactionType] = useState("Vente UV");

  // =====================
  // Récupération utilisateur
  // =====================
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) return Alert.alert("Erreur Auth", error.message);
      setUser(user);
    };
    getUser();
  }, []);

  // =====================
  // Récupérer kiosks et cashes
  // =====================
  useEffect(() => {
    if (user) fetchCashesAndKiosks();
  }, [user]);

  const fetchCashesAndKiosks = async () => {
    const { data: kiosksData, error: kiosksError } = await supabase
      .from("kiosks")
      .select("id, name")
      .eq("owner_id", user.id);
    if (kiosksError) return Alert.alert("Erreur", kiosksError.message);
    setKiosks(kiosksData);

    const { data: cashesData, error: cashesError } = await supabase
      .from("cashes")
      .select("id, name, kiosk_id")
      .in("kiosk_id", kiosksData.map((k) => k.id));
    if (cashesError) return Alert.alert("Erreur", cashesError.message);
    setCashes(cashesData);

    fetchTransactions(cashesData);
  };

  // =====================
  // Récupérer transactions
  // =====================
  const fetchTransactions = async (cashesData) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .in("cash_id", cashesData.map((c) => c.id))
      .order("created_at", { ascending: true });
    if (error) return console.error(error);

    // Calculer le solde par caisse
    const cashBalances = {};
    const enriched = (data || []).map((t) => {
      const isCredit = t.type === "CREDIT";
      const prevBalance = cashBalances[t.cash_id] || 0;
      const newBalance = isCredit ? prevBalance + t.amount : prevBalance - t.amount;
      cashBalances[t.cash_id] = newBalance;

      const cash = cashesData.find((c) => c.id === t.cash_id);
      const kiosk = kiosks.find((k) => k.id === cash?.kiosk_id);

      return {
        ...t,
        cash_name: cash?.name || `Caisse #${t.cash_id}`,
        kiosk_name: kiosk?.name || `Client #${cash?.kiosk_id}`,
        balance_after: newBalance,
      };
    });
    setTransactions(enriched);
  };

  // =====================
  // Création transaction
  // =====================
  const createTransaction = async () => {
    if (!cashId || !amount || !transactionType)
      return Alert.alert("Avertissement", "Veuillez remplir tous les champs !");

    if (!TRANSACTION_TYPES.includes(transactionType)) {
      return Alert.alert("Erreur", "Type de transaction invalide !");
    }

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

    setCashId(null);
    setCashQuery("");
    setAmount("");
    setType("CREDIT");
    setTransactionType("Vente UV");
    setOpen(false);
    fetchCashesAndKiosks();
  };

  const deleteTransaction = async (id) => {
    Alert.alert("Confirmation", "Voulez-vous supprimer cette transaction ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        onPress: async () => {
          const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("id", id);
          if (error) return Alert.alert("Erreur", error.message);
          fetchCashesAndKiosks();
        },
      },
    ]);
  };

  const formatCFA = (amount) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);

  // =====================
  // Render
  // =====================
  const renderItem = ({ item }) => {
    const isCredit = item.type === "CREDIT";

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.row}>
          <Text style={{ flex: 1 }}>{item.transaction_type} ({isCredit ? "Entrée" : "Sortie"})</Text>
          <Text style={{ flex: 1 }}>{item.cash_name}</Text>
          <Text style={{ flex: 1, color: isCredit ? "green" : "red", fontWeight: "bold" }}>
            {formatCFA(item.amount)}
          </Text>
          <Text style={{ flex: 1 }}>{item.kiosk_name}</Text>
          <Text style={{ flex: 1 }}>{new Date(item.created_at).toLocaleString()}</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>
            {formatCFA(item.balance_after)}
          </Text>
          <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={styles.deleteButton}>
            <MaterialCommunityIcons name="delete" size={20} color="white" />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Transactions</Text>
        <Button mode="contained" onPress={() => setOpen(true)} style={styles.addButton}>
          Nouvelle transaction
        </Button>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />

        {/* Dialog création */}
        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title>Créer une transaction</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Rechercher une caisse..."
                value={cashQuery}
                onChangeText={setCashQuery}
                style={{ marginBottom: 12 }}
              />
              {cashQuery.length > 0 && (
                <FlatList
                  data={cashes.filter((c) =>
                    c.name.toLowerCase().includes(cashQuery.toLowerCase())
                  )}
                  keyExtractor={(c) => c.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => { setCashId(item.id); setCashQuery(item.name); }}
                      style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              <TextInput
                label="Montant"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={{ marginBottom: 12 }}
              />

              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <Button mode={type === "CREDIT" ? "contained" : "outlined"} onPress={() => setType("CREDIT")} style={{ marginRight: 8 }}>Entrée</Button>
                <Button mode={type === "DEBIT" ? "contained" : "outlined"} onPress={() => setType("DEBIT")}>Sortie</Button>
              </View>

              <Text>Type de transaction</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                {TRANSACTION_TYPES.map((t) => (
                  <Button
                    key={t}
                    mode={transactionType === t ? "contained" : "outlined"}
                    onPress={() => setTransactionType(t)}
                    style={{ marginRight: 8, marginBottom: 4 }}
                  >
                    {t}
                  </Button>
                ))}
              </View>
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={() => setOpen(false)}>Annuler</Button>
              <Button mode="contained" onPress={createTransaction}>Créer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { textAlign: "center", marginBottom: 12, fontWeight: "bold" },
  addButton: { marginBottom: 12 },
  card: { marginBottom: 8, borderRadius: 10, elevation: 2 },
  deleteButton: { backgroundColor: "red", padding: 6, borderRadius: 6 },
  row: { flexDirection: "row", alignItems: "center" },
});
