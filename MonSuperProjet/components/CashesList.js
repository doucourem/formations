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
  Card,
  List,
  Switch,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";

const CashesList = () => {
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingCash, setEditingCash] = useState(null);

  const [formData, setFormData] = useState({
    kioskId: null,
    name: "",
    balance: 0,
    closed: false,
  });

  useEffect(() => {
    fetchKiosks();
  }, []);

  useEffect(() => {
    if (kiosks.length > 0) fetchCashes();
  }, [kiosks]);

  const fetchKiosks = async () => {
    const { data, error } = await supabase.from("kiosks").select("id, name");
    if (error) console.error(error);
    else setKiosks(data || []);
  };

  const fetchCashes = async () => {
    const { data, error } = await supabase.from("cashes").select("*");
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

  const formatCFA = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const openEditDialog = (cash) => {
    setEditingCash(cash);
    setFormData({
      kioskId: cash.kiosk_id,
      name: cash.name,
      balance: cash.balance ?? 0,
      closed: cash.closed || false,
    });
    setOpen(true);
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
      balance: parseFloat(balance) || 0,
      closed,
    };

    let error;
    if (editingCash) {
      ({ error } = await supabase.from("cashes").update(payload).eq("id", editingCash.id));
    } else {
      ({ error } = await supabase.from("cashes").insert([payload]));
    }

    if (error) {
      Alert.alert("Erreur", "Erreur lors de l'enregistrement : " + error.message);
    } else {
      setFormData({ kioskId: null, name: "", balance: 0, closed: false });
      setEditingCash(null);
      setOpen(false);
      fetchCashes();
    }
  };

  const deleteCash = (id) => {
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

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <List.Item
          title={item.name}
          description={`Kiosque: ${item.kiosk_name}\nSolde: ${formatCFA(item.balance)}`}
          left={() => <List.Icon icon="cash" />}
          right={() => (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditDialog(item)} style={styles.button}>
                <Text style={styles.buttonText}>Modifier / Clore</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCash(item.id)} style={[styles.button, styles.deleteButton]}>
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <Text style={styles.closedStatus}>
          Clôturée : {item.closed ? "Oui" : "Non"}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Caisses</Text>
          <Button
            mode="contained"
            onPress={() => {
              setEditingCash(null);
              setFormData({ kioskId: null, name: "", balance: 0, closed: false });
              setOpen(true);
            }}
          >
            Créer une caisse
          </Button>
        </View>

        <FlatList
          data={cashes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />

        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title>{editingCash ? "Modifier / Clore la caisse" : "Nouvelle Caisse"}</Dialog.Title>
            <Dialog.Content>
              <View style={styles.inputContainer}>
                <Text>Kiosque</Text>
                <RNPickerSelect
                  onValueChange={(value) => setFormData({ ...formData, kioskId: value })}
                  items={kiosks.map((k) => ({ label: `${k.name} (#${k.id})`, value: k.id }))}
                  value={formData.kioskId}
                  style={pickerSelectStyles}
                  placeholder={{ label: "Sélectionner un kiosque...", value: null }}
                />
              </View>
              <TextInput
                label="Nom de la caisse"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
              />
              <TextInput
                label="Solde (XOF)"
                keyboardType="numeric"
                value={String(formData.balance)}
                onChangeText={(text) => setFormData({ ...formData, balance: text })}
                style={styles.input}
              />
              <View style={styles.switchContainer}>
                <Text>Clôturée</Text>
                <Switch
                  value={formData.closed}
                  onValueChange={(value) => setFormData({ ...formData, closed: value })}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpen(false)}>Annuler</Button>
              <Button mode="contained" onPress={saveCash}>
                {editingCash ? "Enregistrer" : "Créer"}
              </Button>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12, elevation: 4 },
  actions: { flexDirection: "column", alignItems: "flex-end", justifyContent: "center" },
  button: { backgroundColor: "blue", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginBottom: 4 },
  deleteButton: { backgroundColor: "red" },
  buttonText: { color: "white", fontSize: 12 },
  closedStatus: { marginTop: 8, marginLeft: 64, fontSize: 14, color: "#555" },
  inputContainer: { marginBottom: 16 },
  input: { marginBottom: 16 },
  switchContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 4, color: 'black', paddingRight: 30, backgroundColor: 'white' },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: 'purple', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: 'white' },
});
