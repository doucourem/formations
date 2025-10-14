import React, { useEffect, useState } from "react";
import { View, FlatList, Alert, ScrollView } from "react-native";
import { Provider as PaperProvider, Card, List, Text, Button, Portal, Dialog, TextInput, Menu } from "react-native-paper";
import { groupBy } from "lodash";
import supabase from "../supabaseClient";

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
  const [filterType, setFilterType] = useState("ALL");
  const [menuVisible, setMenuVisible] = useState(false);

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
    else setTransactionsMap(prev => ({ ...prev, [cash.id]: data || [] }));
  };

  const handleOpenTransactions = async (cash) => {
    setSelectedCash(cash);
    setEditingTransaction(null);
    setAmount("");
    setType("CREDIT");
    await fetchTransactions(cash);
    setFilterType("ALL");
    setOpenTransactionsDialog(true);
  };

  const filteredTransactions = selectedCash
    ? (filterType === "ALL"
        ? transactionsMap[selectedCash.id] || []
        : (transactionsMap[selectedCash.id] || []).filter(t => t.type === filterType))
    : [];

  const groupedTransactions = groupBy(filteredTransactions, t => new Date(t.created_at).toLocaleDateString("fr-FR"));

  const totalBalance = filteredTransactions.reduce(
    (sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount),
    0
  );

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

      // Mettre à jour solde
      const cashes = cashesMap[selectedCash.kiosk_id] || [];
      const cashIndex = cashes.findIndex(c => c.id === selectedCash.id);
      if (cashIndex !== -1) {
        let newBalance = cashes[cashIndex].balance;
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
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <List.Item
            title={item.name}
            description={`Lieu: ${item.location}\nSolde total: ${balances[item.id]?.toLocaleString("fr-FR")} XOF`}
            left={() => <List.Icon icon="store" />}
            right={() => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Button compact onPress={() => handleOpenPopup(item)}>Modifier</Button>
                <Button compact textColor="red" onPress={() => deleteKiosk(item.id)}>Supprimer</Button>
              </View>
            )}
          />
          <Text style={{ marginLeft: 16 }}>Créé le: {new Date(item.created_at).toLocaleString()}</Text>

          {kioskCashes.map((c) => (
            <List.Item
              key={c.id}
              title={`${c.name} - Solde: ${c.balance?.toLocaleString("fr-FR")} XOF`}
              description="Voir opérations"
              onPress={() => handleOpenTransactions(c)}
              left={() => <List.Icon icon="cash" />}
            />
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1, padding: 16, backgroundColor: "#f5f5f5" }}>
        <Text style={{ marginBottom: 16, textAlign: "center", fontWeight: "bold", fontSize: 20 }}>Clients</Text>
        <Button mode="contained" onPress={() => handleOpenPopup()} style={{ marginBottom: 16 }}>Ajouter un client</Button>

        <FlatList data={kiosks} keyExtractor={item => item.id.toString()} renderItem={renderItem} />

        {/* Dialog ajout/modification kiosque */}
        <Portal>
          <Dialog visible={openPopup} onDismiss={handleClosePopup}>
            <Dialog.Title>{currentKiosk.id ? "Modifier client" : "Ajouter client"}</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Nom" value={currentKiosk.name} onChangeText={text => setCurrentKiosk({ ...currentKiosk, name: text })} style={{ marginBottom: 16 }} />
              <TextInput label="Lieu" value={currentKiosk.location} onChangeText={text => setCurrentKiosk({ ...currentKiosk, location: text })} style={{ marginBottom: 16 }} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleClosePopup}>Annuler</Button>
              <Button onPress={handleSaveKiosk} mode="contained">Enregistrer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Dialog transactions */}
        <Portal>
          <Dialog visible={openTransactionsDialog} onDismiss={() => setOpenTransactionsDialog(false)} style={{ maxHeight: "85%" }}>
            <Dialog.Title>Transactions - {selectedCash?.name}</Dialog.Title>

            <Dialog.Content>
              <View style={{ marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "bold" }}>
                  Solde total affiché: {totalBalance.toLocaleString("fr-FR")} XOF
                </Text>

                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={<Button mode="outlined" onPress={() => setMenuVisible(true)}>Filtrer: {filterType}</Button>}
                >
                  <Menu.Item onPress={() => { setFilterType("ALL"); setMenuVisible(false); }} title="Toutes" />
                  <Menu.Item onPress={() => { setFilterType("CREDIT"); setMenuVisible(false); }} title="CREDIT" />
                  <Menu.Item onPress={() => { setFilterType("DEBIT"); setMenuVisible(false); }} title="DEBIT" />
                </Menu>
              </View>

              <ScrollView>
                {Object.entries(groupedTransactions).length > 0 ? Object.entries(groupedTransactions).map(([date, transactionsOfDay]) => {
                  const dayTotal = transactionsOfDay.reduce((sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount), 0);
                  return (
                    <List.Accordion key={date} title={`${date} - Total: ${dayTotal.toLocaleString("fr-FR")} XOF`} style={{ backgroundColor: "#f0f0f0", marginBottom: 8 }}>
                      {transactionsOfDay.map(t => (
                        <Card key={t.id} style={{ marginBottom: 4, backgroundColor: t.type === "CREDIT" ? "#e6f4ea" : "#fdecea" }}>
                          <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                              <Text style={{ fontWeight: "bold", color: t.type === "CREDIT" ? "green" : "red" }}>
                                {t.type} - {t.amount.toLocaleString("fr-FR")} XOF
                              </Text>
                              <Text style={{ fontSize: 12, color: "#555" }}>
                                {new Date(t.created_at).toLocaleTimeString("fr-FR")}
                              </Text>
                            </View>
                            <View style={{ flexDirection: "row" }}>
                              <Button compact onPress={() => handleEditTransaction(t)}>Modifier</Button>
                              <Button compact textColor="red" onPress={() => handleDeleteTransaction(t)}>Supprimer</Button>
                            </View>
                          </Card.Content>
                        </Card>
                      ))}
                    </List.Accordion>
                  );
                }) : <Text style={{ textAlign: "center", marginTop: 16, color: "#888" }}>Aucune transaction</Text>}
              </ScrollView>

            
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={() => setOpenTransactionsDialog(false)}>Fermer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}
