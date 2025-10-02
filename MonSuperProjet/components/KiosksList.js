import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
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
  IconButton,
  Card,
  List,
} from "react-native-paper";

export default function KiosksList() {
  const [kiosks, setKiosks] = useState([]);
  const [balances, setBalances] = useState({});
  const [cashesMap, setCashesMap] = useState({});
  const [transactionsMap, setTransactionsMap] = useState({});
  const [user, setUser] = useState(null);

  const [openPopup, setOpenPopup] = useState(false);
  const [currentKiosk, setCurrentKiosk] = useState({ id: null, name: "", location: "" });

  const [openTransactionsDialog, setOpenTransactionsDialog] = useState(false);
  const [selectedCash, setSelectedCash] = useState(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [editingTransaction, setEditingTransaction] = useState(null);

  // =====================
  // Auth
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
  useEffect(() => { if (user) fetchKiosks(); }, [user]);

  const fetchKiosks = async () => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name, location, created_at")
      .eq("owner_id", user.id);

    if (error) Alert.alert("Erreur", error.message);
    else {
      setKiosks(data);
      fetchCashesAndBalances(data);
    }
  };

  const fetchCashesAndBalances = async (kiosksData) => {
    const balancesTemp = {};
    const cashesTemp = {};
    for (const k of kiosksData) {
      const { data: cashes, error } = await supabase
        .from("cashes")
        .select("*")
        .eq("kiosk_id", k.id);

      if (error) console.error(error);
      else {
        cashesTemp[k.id] = cashes || [];
        balancesTemp[k.id] = (cashes || []).reduce((sum, c) => sum + (c.balance || 0), 0);
      }
    }
    setCashesMap(cashesTemp);
    setBalances(balancesTemp);
  };

  // =====================
  // Transactions
  // =====================
  const fetchTransactions = async (cash) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("cash_id", cash.id)
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else {
      setTransactionsMap((prev) => ({ ...prev, [cash.id]: data || [] }));
    }
  };

  const handleOpenTransactions = async (cash) => {
    setSelectedCash(cash);
    setEditingTransaction(null);
    setAmount("");
    setType("CREDIT");
    await fetchTransactions(cash);
    setOpenTransactionsDialog(true);
  };

  const handleAddOrEditTransaction = async () => {
    if (!amount) {
      Alert.alert("Avertissement", "Veuillez remplir le montant !");
      return;
    }
    const newAmount = parseFloat(amount);
    try {
      if (editingTransaction) {
        const { error } = await supabase
          .from("transactions")
          .update({ amount: newAmount, type })
          .eq("id", editingTransaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("transactions")
          .insert([{ cash_id: selectedCash.id, amount: newAmount, type }]);
        if (error) throw error;
      }

      // Mettre à jour le solde de la caisse
      const cashes = cashesMap[selectedCash.kiosk_id] || [];
      const cashIndex = cashes.findIndex(c => c.id === selectedCash.id);
      if (cashIndex !== -1) {
        const oldBalance = cashes[cashIndex].balance;
        let newBalance = oldBalance;
        if (editingTransaction) {
          if (editingTransaction.type === "CREDIT") newBalance -= editingTransaction.amount;
          else newBalance += editingTransaction.amount;
        }
        if (type === "CREDIT") newBalance += newAmount;
        else newBalance -= newAmount;
        cashes[cashIndex].balance = newBalance;

        setCashesMap({ ...cashesMap, [selectedCash.kiosk_id]: cashes });
        setBalances({ ...balances, [selectedCash.kiosk_id]: cashes.reduce((sum, c) => sum + c.balance, 0) });
      }

      await fetchTransactions(selectedCash);
      setAmount("");
      setType("CREDIT");
      setEditingTransaction(null);
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  const handleEditTransaction = (t) => {
    setEditingTransaction(t);
    setAmount(t.amount.toString());
    setType(t.type);
  };

  const handleDeleteTransaction = async (t) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", t.id);
      if (error) throw error;

      // Ajuster le solde
      const cashes = cashesMap[selectedCash.kiosk_id] || [];
      const cashIndex = cashes.findIndex(c => c.id === selectedCash.id);
      if (cashIndex !== -1) {
        let newBalance = cashes[cashIndex].balance;
        if (t.type === "CREDIT") newBalance -= t.amount;
        else newBalance += t.amount;
        cashes[cashIndex].balance = newBalance;

        setCashesMap({ ...cashesMap, [selectedCash.kiosk_id]: cashes });
        setBalances({ ...balances, [selectedCash.kiosk_id]: cashes.reduce((sum, c) => sum + c.balance, 0) });
      }

      await fetchTransactions(selectedCash);
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  // =====================
  // Kiosk CRUD
  // =====================
  const deleteKiosk = async (id) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer ce client ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            const { error } = await supabase.from("kiosks").delete().eq("id", id).eq("owner_id", user.id);
            if (error) Alert.alert("Erreur", error.message);
            else fetchKiosks();
          },
        },
      ]
    );
  };

  const handleOpenPopup = (kiosk = null) => {
    setCurrentKiosk(kiosk || { id: null, name: "", location: "" });
    setOpenPopup(true);
  };
  const handleClosePopup = () => setOpenPopup(false);

  const handleSaveKiosk = async () => {
    try {
      const { id, name, location } = currentKiosk;
      if (!name || !location) {
        Alert.alert("Avertissement", "Nom et lieu sont obligatoires");
        return;
      }

      if (id) {
        const { error } = await supabase.from("kiosks").update({ name, location }).eq("id", id).eq("owner_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("kiosks").insert([{ name, location, owner_id: user.id }]);
        if (error) throw error;
      }

      fetchKiosks();
      handleClosePopup();
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  // =====================
  // Render
  // =====================
  const renderItem = ({ item }) => {
    const kioskCashes = cashesMap[item.id] || [];
    return (
      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title={item.name}
            description={`Lieu: ${item.location}\nSolde total: ${balances[item.id]?.toLocaleString("fr-FR")} XOF`}
            left={() => <List.Icon icon="store" />}
            right={() => (
              <View style={styles.actions}>
                <IconButton icon="pencil" color="blue" size={20} onPress={() => handleOpenPopup(item)} />
                <IconButton icon="delete" color="red" size={20} onPress={() => deleteKiosk(item.id)} />
              </View>
            )}
          />
          <Text style={styles.text}>Créé le: {new Date(item.created_at).toLocaleString()}</Text>

          {kioskCashes.map((c) => (
            <TouchableOpacity key={c.id} style={styles.cashItem} onPress={() => handleOpenTransactions(c)}>
              <Text>{c.name} - Solde: {c.balance?.toLocaleString("fr-FR")} XOF</Text>
              <Text style={styles.link}>Voir opérations</Text>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Clients</Text>
        <Button mode="contained" onPress={() => handleOpenPopup()} style={styles.addButton} icon="plus">Ajouter un client</Button>

        <FlatList data={kiosks} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} style={styles.list} />

        {/* Dialog ajout/modification kiosque */}
        <Portal>
          <Dialog visible={openPopup} onDismiss={handleClosePopup}>
            <Dialog.Title>{currentKiosk.id ? "Modifier client" : "Ajouter client"}</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Nom" value={currentKiosk.name} onChangeText={(text) => setCurrentKiosk({ ...currentKiosk, name: text })} style={styles.input} />
              <TextInput label="Lieu" value={currentKiosk.location} onChangeText={(text) => setCurrentKiosk({ ...currentKiosk, location: text })} style={styles.input} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleClosePopup}>Annuler</Button>
              <Button onPress={handleSaveKiosk} mode="contained">Enregistrer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Dialog transactions */}
        <Portal>
          <Dialog visible={openTransactionsDialog} onDismiss={() => setOpenTransactionsDialog(false)}>
            <Dialog.Title>Transactions - {selectedCash?.name}</Dialog.Title>
            <Dialog.Content>
              {(transactionsMap[selectedCash?.id] || []).map((t) => (
                <List.Item
                  key={t.id}
                  title={`${t.type} - ${t.amount?.toLocaleString("fr-FR")} XOF`}
                  description={`Date: ${new Date(t.created_at).toLocaleString()}`}
                  left={() => <List.Icon icon="currency-usd" />}
                  right={() => (
                    <View style={{ flexDirection: "row" }}>
                      <Button compact onPress={() => handleEditTransaction(t)}>Modifier</Button>
                      <Button compact textColor="red" onPress={() => handleDeleteTransaction(t)}>Supprimer</Button>
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
              <Button mode="outlined" onPress={() => setType(type === "CREDIT" ? "DEBIT" : "CREDIT")} style={{ marginTop: 8 }}>
                Type: {type}
              </Button>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenTransactionsDialog(false)}>Fermer</Button>
              <Button onPress={handleAddOrEditTransaction} mode="contained">{editingTransaction ? "Enregistrer" : "Ajouter"}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { marginBottom: 16, textAlign: "center", fontWeight: "bold" },
  addButton: { marginBottom: 16 },
  list: { flex: 1 },
  card: { marginBottom: 12, elevation: 4 },
  actions: { flexDirection: "row", alignItems: "center" },
  text: { marginTop: 4, marginLeft: 64 },
  input: { marginBottom: 16 },
  cashItem: { paddingVertical: 6, paddingHorizontal: 12, borderTopWidth: 1, borderColor: "#ddd" },
  link: { color: "blue", fontSize: 12 },
});
