import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ScrollView,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  Provider as PaperProvider,
  Card,
  List,
  Text,
  Button,
  Portal,
  Dialog,
  TextInput,
  Menu,
  IconButton,
  MD3DarkTheme,
} from "react-native-paper";
import { groupBy } from "lodash";
import supabase from "../supabaseClient";

// === THÈME GLOBAL SOMBRE ===
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2563EB",
    secondary: "#10B981",
    accent: "#FACC15",
    error: "#EF4444",
    success: "#22C55E",
    background: "#0A0F1A",
    surface: "#1E293B",
    onSurface: "#F8FAFC",
    onBackground: "#F8FAFC",
    disabled: "#64748B",
    placeholder: "#94A3B8",
  },
};

const TRANSACTION_TYPES = [
  "Vente UV",
  "Dépôt cash",
  "Retrait cash",
  "Transfert",
  "Autre",
];

export default function KiosksTransactions() {
  const [user, setUser] = useState(null);
  const [kiosks, setKiosks] = useState([]);
  const [cashesMap, setCashesMap] = useState({});
  const [balances, setBalances] = useState({});
  const [transactionsMap, setTransactionsMap] = useState({});
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  // Popup & transactions
  const [openPopup, setOpenPopup] = useState(false);
  const [currentKiosk, setCurrentKiosk] = useState({ id: null, name: "", location: "" });
  const [openTransactionsDialog, setOpenTransactionsDialog] = useState(false);
  const [selectedCash, setSelectedCash] = useState(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [transactionType, setTransactionType] = useState("Vente UV");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [menuVisible, setMenuVisible] = useState(false);

  // Auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(user);
    };
    getUser();
  }, []);

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
      if (!error && cashes) {
        cashesTemp[k.id] = cashes;
        balancesTemp[k.id] = cashes.reduce((sum, c) => sum + (c.balance || 0), 0);
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
    if (!error) setTransactionsMap(prev => ({ ...prev, [cash.id]: data || [] }));
  };

  const handleOpenTransactions = async (cash) => {
    setSelectedCash(cash);
    setEditingTransaction(null);
    setAmount("");
    setType("CREDIT");
    setTransactionType("Vente UV");
    await fetchTransactions(cash);
    setFilterType("ALL");
    setOpenTransactionsDialog(true);
  };

  const filteredTransactions = selectedCash
    ? (filterType === "ALL"
        ? transactionsMap[selectedCash.id] || []
        : (transactionsMap[selectedCash.id] || []).filter(t => t.type === filterType))
    : [];

  const groupedTransactions = groupBy(
    filteredTransactions,
    t => new Date(t.created_at).toLocaleDateString("fr-FR")
  );

  const totalBalance = filteredTransactions.reduce(
    (sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount),
    0
  );

  const handleAddOrEditTransaction = async () => {
    if (!amount || !transactionType) return Alert.alert("Remplissez tous les champs !");
    const newAmount = parseFloat(amount);

    try {
      if (editingTransaction) {
        await supabase
          .from("transactions")
          .update({ amount: newAmount, type, transaction_type: transactionType })
          .eq("id", editingTransaction.id);
      } else {
        await supabase
          .from("transactions")
          .insert([{ cash_id: selectedCash.id, amount: newAmount, type, transaction_type: transactionType }]);
      }
      await fetchTransactions(selectedCash);
      setAmount("");
      setTransactionType("Vente UV");
      setEditingTransaction(null);
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  const deleteKiosk = async (id) => {
    Alert.alert("Confirmation", "Supprimer ce client ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("kiosks").delete().eq("id", id);
          if (!error) fetchKiosks();
        },
      },
    ]);
  };

  const renderKiosk = ({ item }) => {
    const kioskCashes = cashesMap[item.id] || [];
    return (
      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title={item.name}
            description={`Lieu: ${item.location}\nSolde total: ${balances[item.id]?.toLocaleString("fr-FR")} XOF`}
            titleStyle={{ color: theme.colors.onSurface, fontSize: isTablet ? 18 : 16 }}
            descriptionStyle={{ color: theme.colors.placeholder, fontSize: isTablet ? 14 : 12 }}
            left={() => <List.Icon color={theme.colors.primary} icon="store" />}
            right={() => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconButton icon="pencil" iconColor={theme.colors.accent} onPress={() => handleOpenPopup(item)} />
                <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => deleteKiosk(item.id)} />
              </View>
            )}
          />

          {kioskCashes.map((c) => (
            <List.Item
              key={c.id}
              title={`${c.name} - Solde: ${c.balance?.toLocaleString("fr-FR")} XOF`}
              description="Voir opérations"
              titleStyle={{ color: theme.colors.onSurface, fontSize: isTablet ? 16 : 14 }}
              descriptionStyle={{ color: theme.colors.placeholder, fontSize: isTablet ? 13 : 11 }}
              left={() => <List.Icon color={theme.colors.success} icon="cash" />}
              right={() => (
                <IconButton
                  icon="eye"
                  iconColor={theme.colors.primary}
                  onPress={() => handleOpenTransactions(c)}
                />
              )}
              onPress={() => handleOpenTransactions(c)}
            />
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.title}>Clients & Transactions</Text>
        <Button
          mode="contained"
          onPress={() => setOpenPopup(true)}
          style={styles.addButton}
        >
          Ajouter un client
        </Button>

        <FlatList
          data={kiosks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKiosk}
        />

        {/* Dialog popup client */}
        <Portal>
          <Dialog visible={openPopup} onDismiss={() => setOpenPopup(false)}>
            <Dialog.Title>
              {currentKiosk.id ? "Modifier client" : "Ajouter client"}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nom"
                value={currentKiosk.name}
                onChangeText={(text) =>
                  setCurrentKiosk({ ...currentKiosk, name: text })
                }
                style={styles.input}
              />
              <TextInput
                label="Lieu"
                value={currentKiosk.location}
                onChangeText={(text) =>
                  setCurrentKiosk({ ...currentKiosk, location: text })
                }
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenPopup(false)}>Annuler</Button>
              <Button mode="contained" onPress={() => setOpenPopup(false)}>
                Enregistrer
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Dialog transactions */}
        <Portal>
          <Dialog
            visible={openTransactionsDialog}
            onDismiss={() => setOpenTransactionsDialog(false)}
            style={{ maxHeight: "85%", backgroundColor: theme.colors.surface }}
          >
            <Dialog.Title style={{ color: theme.colors.onSurface }}>
              Transactions - {selectedCash?.name}
            </Dialog.Title>
            <Dialog.Content>
              <View style={styles.transactionsHeader}>
                <Text style={{ color: theme.colors.onSurface }}>
                  Solde: {totalBalance.toLocaleString("fr-FR")} XOF
                </Text>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      textColor={theme.colors.onSurface}
                      onPress={() => setMenuVisible(true)}
                    >
                      Filtrer: {filterType}
                    </Button>
                  }
                >
                  <Menu.Item onPress={() => { setFilterType("ALL"); setMenuVisible(false); }} title="Toutes" />
                  <Menu.Item onPress={() => { setFilterType("CREDIT"); setMenuVisible(false); }} title="CREDIT" />
                  <Menu.Item onPress={() => { setFilterType("DEBIT"); setMenuVisible(false); }} title="DEBIT" />
                </Menu>
              </View>

              <ScrollView>
                {Object.entries(groupedTransactions).length > 0 ? (
                  Object.entries(groupedTransactions).map(([date, transactionsOfDay]) => (
                    <List.Accordion
                      key={date}
                      title={`${date}`}
                      titleStyle={{ color: theme.colors.onSurface }}
                      style={{ backgroundColor: "#1E293B" }}
                    >
                      {transactionsOfDay.map((t) => (
                        <Card
                          key={t.id}
                          style={[
                            styles.transactionCard,
                            { backgroundColor: t.type === "CREDIT" ? "#064E3B" : "#7F1D1D" },
                          ]}
                        >
                          <Card.Content
                            style={styles.transactionContent}
                          >
                            <View>
                              <Text style={{ color: theme.colors.onSurface }}>
                                {t.transaction_type} - {t.amount.toLocaleString("fr-FR")} XOF
                              </Text>
                              <Text style={{ color: "#CBD5E1", fontSize: 12 }}>
                                {new Date(t.created_at).toLocaleTimeString("fr-FR")}
                              </Text>
                            </View>
                            <View style={{ flexDirection: "row" }}>
                              <IconButton icon="pencil" iconColor={theme.colors.accent} onPress={() => setEditingTransaction(t)} />
                              <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => handleDeleteTransaction(t)} />
                            </View>
                          </Card.Content>
                        </Card>
                      ))}
                    </List.Accordion>
                  ))
                ) : (
                  <Text style={{ textAlign: "center", color: "#94A3B8" }}>
                    Aucune transaction
                  </Text>
                )}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenTransactionsDialog(false)}>
                Fermer
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { marginBottom: 16, textAlign: "center", fontWeight: "bold", fontSize: 20, color: theme.colors.onSurface },
  addButton: { marginBottom: 16, backgroundColor: theme.colors.primary },
  card: { marginBottom: 12, backgroundColor: theme.colors.surface },
  input: { marginBottom: 12 },
  transactionsHeader: { marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  transactionCard: { marginBottom: 6 },
  transactionContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
