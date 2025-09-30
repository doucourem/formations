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
  useTheme,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TransactionsList() {
  const theme = useTheme();
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
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else {
      const cashBalances = {};
      const enriched = (data || []).map((t) => {
        const isCredit = t.type === "CREDIT";
        const prevBalance = cashBalances[t.cash_id] || 0;
        const newBalance = isCredit ? prevBalance + t.amount : prevBalance - t.amount;
        cashBalances[t.cash_id] = newBalance;

        return {
          ...t,
          cash_name: getCashName(t.cash_id)
        };
      });
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
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.onSurface }}>{isCredit ? "Crédit" : "Débit"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.onSurface }}>{item.cash_name}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: isCredit ? "green" : "red", fontWeight: "bold" }}>
              {formatCFA(item.amount)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.onSurface }}>{item.operator_name}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.onSurface }}>
              {new Date(item.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={styles.deleteButton}>
            <MaterialCommunityIcons name="delete" size={20} color="white" />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Transactions
        </Text>

        <Button
          mode="contained"
          onPress={() => setOpen(true)}
          style={styles.addButton}
          buttonColor={theme.colors.primary}
          icon="plus"
        >
          Nouvelle transaction
        </Button>

        <View style={styles.headerRow}>
          {["Type", "Caisse", "Montant", "Date"].map((h, i) => (
            <Text key={i} style={{ flex: 1, fontWeight: "bold", color: theme.colors.onSurface }}>
              {h}
            </Text>
          ))}
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
            <Dialog.Title style={{ color: theme.colors.onSurface }}>Créer une transaction</Dialog.Title>
            <Dialog.Content>
              <View style={styles.inputContainer}>
                <Text style={{ color: theme.colors.onSurface, marginBottom: 4 }}>Caisse</Text>
                <RNPickerSelect
                  onValueChange={setCashId}
                  items={cashes.map((c) => ({ label: `${c.name} (ID: ${c.id})`, value: c.id }))}
                  value={cashId}
                  placeholder={{ label: "Sélectionner une caisse...", value: null }}
                  style={{
                    inputIOS: { ...pickerSelectStyles.inputIOS, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
                    inputAndroid: { ...pickerSelectStyles.inputAndroid, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
                  }}
                />
              </View>

              <TextInput
                label="Montant en CFA"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
                textColor={theme.colors.onSurface}
              />

              <View style={styles.inputContainer}>
                <Text style={{ color: theme.colors.onSurface, marginBottom: 4 }}>Type</Text>
                <RNPickerSelect
                  onValueChange={setType}
                  items={[
                    { label: "Crédit", value: "CREDIT" },
                    { label: "Débit", value: "DEBIT" },
                  ]}
                  value={type}
                  style={{
                    inputIOS: { ...pickerSelectStyles.inputIOS, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
                    inputAndroid: { ...pickerSelectStyles.inputAndroid, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
                  }}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpen(false)}>Annuler</Button>
              <Button onPress={createTransaction} mode="contained" buttonColor={theme.colors.primary}>
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
  container: { flex: 1, padding: 16 },
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
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: "gray", borderRadius: 4, paddingRight: 30 },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: "gray", borderRadius: 8, paddingRight: 30 },
});
