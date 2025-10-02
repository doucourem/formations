import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Text,
  Provider as PaperProvider,
  Card,
  List,
  Switch,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";

const CashesList = () => {
  const [user, setUser] = useState(null);
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);

  const [openCashDialog, setOpenCashDialog] = useState(false);
  const [editingCash, setEditingCash] = useState(null);
  const [formData, setFormData] = useState({
    kioskId: null,
    name: "",
    balance: 0,
    closed: false,
  });

  const [transactions, setTransactions] = useState([]);
  const [selectedCash, setSelectedCash] = useState(null);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [editingTransaction, setEditingTransaction] = useState(null);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  // =====================
  // Fetch user
  // =====================
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(user);
    };
    getUser();
  }, []);

  // =====================
  // Fetch kiosks
  // =====================
  useEffect(() => {
    if (user) fetchKiosks();
  }, [user]);

  const fetchKiosks = async () => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name")
      .eq("owner_id", user.id);

    if (error) console.error(error);
    else setKiosks(data || []);
  };

  // =====================
  // Fetch cashes
  // =====================
  useEffect(() => {
    if (kiosks.length > 0) fetchCashes();
  }, [kiosks]);

  const fetchCashes = async () => {
    const kioskIds = kiosks.map((k) => k.id);
    const { data, error } = await supabase
      .from("cashes")
      .select("*")
      .in("kiosk_id", kioskIds);

    if (error) console.error(error);
    else {
      const enriched = (data || []).map((c) => ({
        ...c,
        kiosk_name: kiosks.find((k) => k.id === c.kiosk_id)?.name || c.kiosk_id,
        balance: c.balance !== null ? Number(c.balance) : 0,
      }));
      setCashes(enriched);
    }
  };

  // =====================
  // Fetch transactions
  // =====================
  const fetchTransactions = async (cashId) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("cash_id", cashId)
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else setTransactions(data || []);
  };

  const formatCFA = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(value);

  // =====================
  // CRUD Cash
  // =====================
  const openEditDialog = (cash = null) => {
    if (cash) {
      setEditingCash(cash);
      setFormData({
        kioskId: cash.kiosk_id,
        name: cash.name,
        balance: cash.balance ?? 0,
        closed: cash.closed || false,
      });
    } else {
      setEditingCash(null);
      setFormData({ kioskId: null, name: "", balance: 0, closed: false });
    }
    setOpenCashDialog(true);
  };

  const saveCash = async () => {
    const { kioskId, name, balance, closed } = formData;
    if (!kioskId || !name) {
      Alert.alert("Avertissement", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    const payload = {
      kiosk_id: kioskId,
      name,
      balance: Number(balance) || 0,
      closed,
    };

    try {
      let error;
      if (editingCash) {
        ({ error } = await supabase.from("cashes").update(payload).eq("id", editingCash.id));
      } else {
        ({ error } = await supabase.from("cashes").insert([payload]));
      }

      if (error) throw error;

      setFormData({ kioskId: null, name: "", balance: 0, closed: false });
      setEditingCash(null);
      setOpenCashDialog(false);
      fetchCashes();
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", err.message);
    }
  };

  const deleteCash = async (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cette caisse ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            const { error } = await supabase.from("cashes").delete().eq("id", id);
            if (error) Alert.alert("Erreur", error.message);
            else fetchCashes();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // =====================
  // CRUD Transactions
  // =====================
  const openTransactionsDialog = (cash) => {
    setSelectedCash(cash);
    fetchTransactions(cash.id);
    setEditingTransaction(null);
    setAmount("");
    setType("CREDIT");
    setOpenTransactionDialog(true);
  };

  const createTransaction = async () => {
    if (!selectedCash || !amount) {
      Alert.alert("Avertissement", "Veuillez remplir le montant !");
      return;
    }

    const newAmount = parseFloat(amount);
    if (isNaN(newAmount)) {
      Alert.alert("Avertissement", "Montant invalide");
      return;
    }

    try {
      const { error: insertError } = await supabase.from("transactions").insert([{
        cash_id: selectedCash.id,
        amount: newAmount,
        type,
      }]);
      if (insertError) throw insertError;

      const newBalance = type === "CREDIT"
        ? selectedCash.balance + newAmount
        : selectedCash.balance - newAmount;

      const { error: updateError } = await supabase
        .from("cashes")
        .update({ balance: newBalance })
        .eq("id", selectedCash.id);
      if (updateError) throw updateError;

      fetchCashes();
      fetchTransactions(selectedCash.id);
      setAmount("");
      setType("CREDIT");
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de créer la transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    Alert.alert(
      "Confirmation",
      "Supprimer cette transaction ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            const { error } = await supabase.from("transactions").delete().eq("id", id);
            if (error) Alert.alert("Erreur", error.message);
            else fetchTransactions(selectedCash.id);
          },
        },
      ]
    );
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
  };

  const saveEditedTransaction = async () => {
    if (!editingTransaction) return;
    const newAmount = parseFloat(amount);
    if (isNaN(newAmount)) return Alert.alert("Montant invalide");

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ amount: newAmount, type })
        .eq("id", editingTransaction.id);
      if (error) throw error;

      fetchTransactions(selectedCash.id);
      setEditingTransaction(null);
      setAmount("");
      setType("CREDIT");
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  // =====================
  // Render item
  // =====================
  const renderItem = ({ item }) => {
    if (isSmallScreen) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            <Text>Kiosque: {item.kiosk_name}</Text>
            <Text>Solde: {formatCFA(item.balance)}</Text>
            <Text style={{ color: item.closed ? "red" : "green", fontWeight: "bold" }}>
              Clôturée : {item.closed ? "Oui" : "Non"}
            </Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => openEditDialog(item)} style={[styles.btn, styles.edit]}>
                <Text style={styles.btnText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCash(item.id)} style={[styles.btn, styles.delete]}>
                <Text style={styles.btnText}>Supprimer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openTransactionsDialog(item)} style={[styles.btn, styles.tx]}>
                <Text style={styles.btnText}>Transactions</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.row}>
          <Text style={{ flex: 1 }}>{item.name}</Text>
          <Text style={{ flex: 1 }}>{item.kiosk_name}</Text>
          <Text style={{ flex: 1 }}>{formatCFA(item.balance)}</Text>
          <Text style={{ flex: 1, color: item.closed ? "red" : "green", fontWeight: "bold" }}>
            {item.closed ? "Clôturée" : "Ouverte"}
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => openEditDialog(item)} style={[styles.btn, styles.edit]}>
              <Text style={styles.btnText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteCash(item.id)} style={[styles.btn, styles.delete]}>
              <Text style={styles.btnText}>Supprimer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openTransactionsDialog(item)} style={[styles.btn, styles.tx]}>
              <Text style={styles.btnText}>Transactions</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // =====================
  // Render
  // =====================
  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Caisses</Text>
          <Button mode="contained" onPress={() => openEditDialog()}>
            Créer une caisse
          </Button>
        </View>

        <FlatList
          data={cashes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />

        {/* Dialog Cash */}
        <Portal>
          <Dialog visible={openCashDialog} onDismiss={() => setOpenCashDialog(false)}>
            <Dialog.Title>{editingCash ? "Modifier caisse" : "Créer une caisse"}</Dialog.Title>
            <Dialog.Content>
              <RNPickerSelect
                onValueChange={(val) => setFormData({ ...formData, kioskId: val })}
                value={formData.kioskId}
                placeholder={{ label: "Sélectionner un kiosque", value: null }}
                items={kiosks.map((k) => ({ label: k.name, value: k.id }))}
              />
              <TextInput
                label="Nom"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={{ marginTop: 12 }}
              />
              <TextInput
                label="Balance initiale"
                value={formData.balance.toString()}
                onChangeText={(text) => setFormData({ ...formData, balance: text })}
                keyboardType="numeric"
                style={{ marginTop: 12 }}
              />
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                <Text>Clôturée</Text>
                <Switch
                  value={formData.closed}
                  onValueChange={(val) => setFormData({ ...formData, closed: val })}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenCashDialog(false)}>Annuler</Button>
              <Button onPress={saveCash} mode="contained">{editingCash ? "Enregistrer" : "Créer"}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Dialog Transactions */}
        <Portal>
          <Dialog
            visible={openTransactionDialog}
            onDismiss={() => setOpenTransactionDialog(false)}
          >
            <Dialog.Title>Transactions - {selectedCash?.name}</Dialog.Title>
            <Dialog.Content>
              {(transactions || []).map((t) => (
                <List.Item
                  key={t.id}
                  title={`${t.type} - ${formatCFA(t.amount)}`}
                  description={`Date: ${new Date(t.created_at).toLocaleString()}`}
                  left={() => <List.Icon icon="currency-usd" />}
                  right={() => (
                    <View style={{ flexDirection: "row" }}>
                      <Button compact onPress={() => handleEditTransaction(t)}>Modifier</Button>
                      <Button compact textColor="red" onPress={() => handleDeleteTransaction(t.id)}>Supprimer</Button>
                    </View>
                  )}
                />
              ))}
              <Text style={{ marginTop: 12, fontWeight: "bold" }}>
                {editingTransaction ? "Modifier transaction" : "Nouvelle transaction"}
              </Text>
              <TextInput
                label="Montant"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={{ marginTop: 8 }}
              />
              <RNPickerSelect
                onValueChange={(val) => setType(val)}
                value={type}
                items={[
                  { label: "Crédit", value: "CREDIT" },
                  { label: "Débit", value: "DEBIT" },
                ]}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenTransactionDialog(false)}>Fermer</Button>
              {editingTransaction ? (
                <Button onPress={saveEditedTransaction}>Enregistrer</Button>
              ) : (
                <Button onPress={createTransaction}>Ajouter</Button>
              )}
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
};

export default CashesList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12, elevation: 3, borderRadius: 8 },
  row: { flexDirection: "row", alignItems: "center" },
  actionsRow: { flexDirection: "row", marginTop: 8, gap: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  edit: { backgroundColor: "blue" },
  delete: { backgroundColor: "red" },
  tx: { backgroundColor: "green" },
  btnText: { color: "white", fontSize: 12 },
});
