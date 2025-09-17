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
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [cashes, setCashes] = useState([]);
  const [operators, setOperators] = useState([]);
  const [open, setOpen] = useState(false);
  const [cashId, setCashId] = useState(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");

  useEffect(() => {
    fetchCashesAndOperators();
  }, []);

  useEffect(() => {
    if (cashes.length > 0) fetchTransactions();
  }, [cashes, operators]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from("transactions").select("*");
    if (error) console.error(error);
    else {
      const enriched = (data || []).map((t) => ({
        ...t,
        cash_name: getCashName(t.cash_id),
        operator_name: getOperatorName(t.operator_id),
      }));
      setTransactions(enriched);
    }
  };

  const fetchCashesAndOperators = async () => {
    const { data: cashesData } = await supabase.from("cashes").select("id, name");
    if (cashesData) setCashes(cashesData);

    const { data: operatorsData } = await supabase.from("operators").select("id, name");
    if (operatorsData) setOperators(operatorsData);
  };

  const deleteTransaction = async (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cette transaction ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            const { error } = await supabase.from("transactions").delete().eq("id", id);
            if (error) Alert.alert("Erreur", "Erreur lors de la suppression");
            else fetchTransactions();
          },
        },
      ]
    );
  };

  const createTransaction = async () => {
    if (!cashId || !amount) {
      Alert.alert("Avertissement", "Veuillez remplir tous les champs !");
      return;
    }
    const { error } = await supabase.from("transactions").insert([
      { cash_id: cashId, amount: parseFloat(amount), type },
    ]);
    if (error) Alert.alert("Erreur", "Erreur lors de la création");
    else {
      setCashId(null);
      setAmount("");
      setType("CREDIT");
      setOpen(false);
      fetchTransactions();
    }
  };

  const getCashName = (id) => cashes.find((c) => c.id === id)?.name || `Caisse #${id}`;
  const getOperatorName = (id) => operators.find((o) => o.id === id)?.name || `Opérateur #${id}`;

  const formatCFA = (amount) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount);

  const renderItem = ({ item }) => {
    const isCredit = item.type === "CREDIT";
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.amount, { color: isCredit ? "green" : "red" }]}>
              {formatCFA(item.amount)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>{isCredit ? "Crédit" : "Débit"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>{item.cash_name}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>{item.operator_name}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>{new Date(item.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</Text>
          </View>
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
        <Text variant="headlineMedium" style={styles.title}>
          Transactions
        </Text>

        <Button mode="contained" onPress={() => setOpen(true)} style={styles.addButton} icon="plus">
          Nouvelle transaction
        </Button>

        <View style={styles.headerRow}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Montant</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Type</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Caisse</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Opérateur</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Date</Text>
          <Text style={{ width: 40 }}></Text>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />

        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title>Créer une transaction</Dialog.Title>
            <Dialog.Content>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Caisse</Text>
                <RNPickerSelect
                  onValueChange={setCashId}
                  items={cashes.map((c) => ({ label: `${c.name} (ID: ${c.id})`, value: c.id }))}
                  value={cashId}
                  style={pickerSelectStyles}
                  placeholder={{ label: "Sélectionner une caisse...", value: null }}
                />
              </View>

              <TextInput
                label="Montant en CFA"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Type</Text>
                <RNPickerSelect
                  onValueChange={setType}
                  items={[
                    { label: "Crédit", value: "CREDIT" },
                    { label: "Débit", value: "DEBIT" },
                  ]}
                  value={type}
                  style={pickerSelectStyles}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpen(false)}>Annuler</Button>
              <Button onPress={createTransaction} mode="contained">
                Créer
              </Button>
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
  list: { paddingBottom: 20 },
  card: { marginBottom: 8, borderRadius: 10, elevation: 2 },
  deleteButton: { backgroundColor: "red", padding: 6, borderRadius: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  amount: { fontSize: 16, fontWeight: "bold" },
  headerRow: { flexDirection: "row", marginBottom: 4, paddingHorizontal: 4 },
  inputContainer: { marginBottom: 12 },
  input: { marginBottom: 12 },
  label: { fontSize: 14, color: "#555", marginBottom: 4 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: "gray", borderRadius: 4, color: "black", paddingRight: 30, backgroundColor: "white" },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: "gray", borderRadius: 8, color: "black", paddingRight: 30, backgroundColor: "white" },
});
