import React, { useEffect, useState } from "react";
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
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import supabase from "../supabaseClient";

export default function TransactionsList() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  const [transactions, setTransactions] = useState([]);
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [user, setUser] = useState(null);

  const [open, setOpen] = useState(false);
  const [cashId, setCashId] = useState(null);
  const [cashQuery, setCashQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");

  // =====================
  // Récupérer utilisateur
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
  // Fetch kiosks et caisses
  // =====================
  useEffect(() => {
    if (user) fetchCashesAndKiosks();
  }, [user]);

  useEffect(() => {
    if (cashes.length > 0) fetchTransactions();
  }, [cashes]);

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
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .in("cash_id", cashes.map((c) => c.id))
      .order("created_at", { ascending: true });

    if (error) return console.error(error);

    const cashBalances = {};
    const enriched = (data || []).map((t) => {
      const isCredit = t.type === "CREDIT";
      const prevBalance = cashBalances[t.cash_id] || 0;
      const newBalance = isCredit ? prevBalance + t.amount : prevBalance - t.amount;
      cashBalances[t.cash_id] = newBalance;

      const cash = cashes.find((c) => c.id === t.cash_id);
      const kiosk = kiosks.find((k) => k.id === cash?.kiosk_id);

      return {
        ...t,
        cash_name: cash?.name || `Caisse #${t.cash_id}`,
        kiosk_name: kiosk?.name || `Kiosque #${cash?.kiosk_id}`,
        balance_after: newBalance,
      };
    });
    setTransactions(enriched);
  };

  // =====================
  // Création / suppression
  // =====================
  const createTransaction = async () => {
    if (!cashId || !amount)
      return Alert.alert("Avertissement", "Veuillez remplir tous les champs !");
    const { error } = await supabase.from("transactions").insert([
      { cash_id: cashId, amount: parseFloat(amount), type },
    ]);
    if (error) return Alert.alert("Erreur", error.message);

    setCashId(null);
    setCashQuery("");
    setAmount("");
    setType("CREDIT");
    setOpen(false);
    fetchTransactions();
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
          fetchTransactions();
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
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={isSmallScreen ? {} : styles.row}>
          <Text style={{ flex: 1, color: theme.colors.onSurface }}>
            {isCredit ? "Crédit" : "Débit"}
          </Text>
          <Text style={{ flex: 1, color: theme.colors.onSurface }}>
            {item.cash_name}
          </Text>
          <Text
            style={{
              flex: 1,
              color: isCredit ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {formatCFA(item.amount)}
          </Text>
          <Text style={{ flex: 1, color: theme.colors.onSurface }}>
            {item.kiosk_name}
          </Text>
          <Text style={{ flex: 1, color: theme.colors.onSurface }}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
          <Text style={{ flex: 1, color: theme.colors.onSurface, fontWeight: "bold" }}>
            {formatCFA(item.balance_after)}
          </Text>
          <TouchableOpacity
            onPress={() => deleteTransaction(item.id)}
            style={styles.deleteButton}
          >
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
        <Button mode="contained" onPress={() => setOpen(true)} style={styles.addButton} icon="plus">
          Nouvelle transaction
        </Button>

        {!isSmallScreen && (
          <View style={styles.headerRow}>
            {["Type", "Caisse", "Montant", "Kiosque", "Date", "Solde après"].map((h, i) => (
              <Text key={i} style={{ flex: 1, fontWeight: "bold", color: theme.colors.onSurface }}>
                {h}
              </Text>
            ))}
            <Text style={{ width: 40 }}></Text>
          </View>
        )}

        <FlatList data={transactions} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />

        {/* Dialog création */}
        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title>Créer une transaction</Dialog.Title>
            <Dialog.Content>
              {/* AUTOCOMPLETE CAISSE */}
              <View style={{ position: "relative", marginBottom: 12 }}>
                <TextInput
                  label="Rechercher une caisse..."
                  value={cashQuery}
                  onChangeText={setCashQuery}
                  mode="outlined"
                  style={{ backgroundColor: theme.colors.surface }}
                  textColor={theme.colors.onSurface}
                />
                {cashQuery.length > 0 && (
                  <Card
                    style={{
                      position: "absolute",
                      top: 60,
                      left: 0,
                      right: 0,
                      zIndex: 10,
                      maxHeight: 200,
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                  >
                    <FlatList
                      data={cashes.filter((c) =>
                        c.name.toLowerCase().includes(cashQuery.toLowerCase())
                      )}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            setCashId(item.id);
                            setCashQuery(item.name);
                          }}
                          style={{
                            padding: 10,
                            backgroundColor:
                              cashId === item.id
                                ? theme.colors.primaryContainer
                                : theme.colors.surface,
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.outlineVariant,
                          }}
                        >
                          <Text style={{ color: theme.colors.onSurface }}>
                            {item.name} (
                            {kiosks.find((k) => k.id === item.kiosk_id)?.name})
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </Card>
                )}
              </View>

              {/* MONTANT */}
              <TextInput
                label="Montant"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={{ marginBottom: 12 }}
                mode="outlined"
                textColor={theme.colors.onSurface}
              />

              {/* TYPE */}
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <Button
                  mode={type === "CREDIT" ? "contained" : "outlined"}
                  onPress={() => setType("CREDIT")}
                  style={{ marginRight: 8 }}
                >
                  Crédit
                </Button>
                <Button
                  mode={type === "DEBIT" ? "contained" : "outlined"}
                  onPress={() => setType("DEBIT")}
                >
                  Débit
                </Button>
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
  container: { flex: 1, padding: 16 },
  title: { textAlign: "center", marginBottom: 12, fontWeight: "bold" },
  addButton: { marginBottom: 12 },
  card: { marginBottom: 8, borderRadius: 10, elevation: 2 },
  deleteButton: { backgroundColor: "red", padding: 6, borderRadius: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  headerRow: { flexDirection: "row", marginBottom: 4 },
});
