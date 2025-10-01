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

  // Auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(user);
    };
    getUser();
  }, []);

  // Fetch kiosks
  useEffect(() => {
    if (user) fetchKiosks();
  }, [user]);

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
    await fetchTransactions(cash);
    setOpenTransactionsDialog(true);
  };

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

          {/* Liste des caisses */}
          {kioskCashes.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.cashItem}
              onPress={() => handleOpenTransactions(c)}
            >
              <Text>{c.name} - Solde: {c.balance?.toLocaleString("fr-FR")} XOF</Text>
              <Text style={styles.link}>Voir opérations</Text>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
    );
  };

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
                />
              ))}
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
