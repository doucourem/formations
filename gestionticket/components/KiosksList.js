import React, { useEffect, useState, useMemo } from "react";
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
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 état recherche
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

  // === Auth ===
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => { 
    if (user) fetchKiosks(); 
  }, [user]);

  // === Fetch kiosks ===
const fetchKiosks = async () => {
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name, location, created_at")
      .eq("owner_id", user.id); // 🔹 Filtrer par utilisateur

    if (error) throw error;

    setKiosks(data || []);
    fetchCashesAndBalances(data || []);
  } catch (err) {
    Alert.alert("Erreur", err.message);
  }
};


  // === Calculate cash balance ===
  const calculateCashBalance = async (cashId) => {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("cash_id", cashId);

    if (error) {
      Alert.alert("Erreur", error.message);
      return 0;
    }

    return transactions.reduce(
      (sum, t) => sum + (t.type === "DEBIT" ? t.amount : -t.amount),
      0
    );
  };

  // === Fetch cashes and balances ===
  const fetchCashesAndBalances = async (kiosksData) => {
    const balancesTemp = {};
    const cashesTemp = {};

    for (const k of kiosksData) {
      const { data: cashes, error } = await supabase
        .from("cashes")
        .select("*")
        .eq("kiosk_id", k.id);

      if (!error && cashes) {
        const cashesWithBalance = await Promise.all(
          cashes.map(async (c) => ({
            ...c,
            balance: await calculateCashBalance(c.id),
          }))
        );

        cashesTemp[k.id] = cashesWithBalance;
        balancesTemp[k.id] = cashesWithBalance.reduce((sum, c) => sum + (c.balance || 0), 0);
      }
    }

    setCashesMap(cashesTemp);
    setBalances(balancesTemp);
  };

  // === Fetch transactions ===
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

  // === Filtered & grouped transactions ===
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

  // === Total all kiosks ===
  const totalAllKiosks = useMemo(
    () => Object.values(balances).reduce((sum, b) => sum + (b || 0), 0),
    [balances]
  );

  // === Add or edit transaction ===
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

  // === Delete kiosk ===
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

  // === Filter kiosks for search ===
  const filteredKiosks = kiosks.filter(kiosk =>
    kiosk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kiosk.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // === Render kiosk ===
  const renderKiosk = ({ item }) => {
    const kioskCashes = cashesMap[item.id] || [];
    return (
      <Card style={[styles.card, { width: "100%" }]} elevation={3}>
        <Card.Content>
          <View style={styles.kioskHeader}>
            <List.Icon color={theme.colors.primary} icon="store" style={styles.kioskIcon} />
            
            <View style={styles.kioskInfo}>
              <Text style={[styles.kioskTitle, { fontSize: isTablet ? 18 : 16 }]}>
                {item.name}
              </Text>
              <Text style={[styles.kioskDescription, { fontSize: isTablet ? 14 : 12 }]}>
                Lieu: {item.location}
              </Text>
              <Text
                style={[
                  styles.kioskBalance,
                  { 
                    fontSize: isTablet ? 18 : 16,
                  color: (balances[item.id] || 0) >= 0 ? theme.colors.success : theme.colors.error,
                  }
                ]}
              >
                {balances[item.id] < 0
                  ? `⚠️ Il nous doit : ${(balances[item.id] || 0).toLocaleString("fr-FR")} FCFA`
                  : `💰 Il a une avance : ${(balances[item.id] || 0).toLocaleString("fr-FR")} FCFA`}
              </Text>
            </View>

            <View style={styles.kioskActions}>
              <IconButton
                icon="pencil"
                iconColor={theme.colors.accent}
                size={isTablet ? 28 : 24}
                onPress={() => {
                  setCurrentKiosk(item);
                  setOpenPopup(true);
                }}
              />
              <IconButton
                icon="delete"
                iconColor={theme.colors.error}
                size={isTablet ? 28 : 24}
                onPress={() => deleteKiosk(item.id)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.title}>Clients & Transactions</Text>

        {/* Carte du total de tous les kiosques */}
       <Card style={{ marginBottom: 16, backgroundColor: theme.colors.primary }}>
  <Card.Content>
    <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
      CRÉDIT TOTAL DE TOUS LES CLIENTS
    </Text>
    <Text
      style={{
        color: totalAllKiosks >= 0 ? theme.colors.success : theme.colors.error, // 🔹 couleur selon montant
        fontSize: 18,
        textAlign: "center",
        marginTop: 4,
      }}
    >
      {totalAllKiosks.toLocaleString("fr-FR")} XOF
    </Text>
  </Card.Content>
</Card>


        {/* Champ de recherche */}
        <TextInput
          label="Rechercher un client ou un lieu"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: 16 }}
          mode="outlined"
          placeholder="Tapez le nom ou le lieu..."
        />

        <Button
          mode="contained"
          onPress={() => setOpenPopup(true)}
          style={styles.addButton}
        >
          Ajouter un client
        </Button>

        <FlatList
          data={filteredKiosks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKiosk}
        />

        {/* Popup et Dialogs (inchangés) */}
        {/* ... ici le reste de ton code pour Popup et Dialog ... */}

        <Portal>
  <Dialog
    visible={openPopup}
    onDismiss={() => {
      setOpenPopup(false);
      setCurrentKiosk({ id: null, name: "", location: "" });
    }}
  >
    <Dialog.Title>{currentKiosk.id ? "Modifier client" : "Ajouter client"}</Dialog.Title>
    <Dialog.Content>
      <TextInput
        label="Nom du client"
        value={currentKiosk.name}
        onChangeText={(text) => setCurrentKiosk({ ...currentKiosk, name: text })}
        style={styles.input}
        mode="outlined"
        placeholder="Entrez le nom..."
      />
      <TextInput
        label="Lieu"
        value={currentKiosk.location}
        onChangeText={(text) => setCurrentKiosk({ ...currentKiosk, location: text })}
        style={styles.input}
        mode="outlined"
        placeholder="Entrez le lieu..."
      />
    </Dialog.Content>
    <Dialog.Actions>
      <Button
        onPress={() => {
          setOpenPopup(false);
          setCurrentKiosk({ id: null, name: "", location: "" });
        }}
      >
        Annuler
      </Button>
      <Button
        mode="contained"
        onPress={async () => {
          if (!currentKiosk.name || !currentKiosk.location) {
            return Alert.alert("Remplissez tous les champs !");
          }

          try {
            if (currentKiosk.id) {
              // Édition
              await supabase
                .from("kiosks")
                .update({
                  name: currentKiosk.name,
                  location: currentKiosk.location,
                })
                .eq("id", currentKiosk.id);
              Alert.alert("Succès", "Client modifié avec succès !");
            } else {
              // Création
              if (!currentKiosk.id) {
  await supabase
    .from("kiosks")
    .insert([{
      name: currentKiosk.name,
      location: currentKiosk.location,
      user_id: user.id ,// 🔹 Obligatoire avec RLS
      owner_id: user.id
    }]);
}

              Alert.alert("Succès", "Client ajouté avec succès !");
            }

            fetchKiosks(); // Recharger la liste
            setOpenPopup(false);
            setCurrentKiosk({ id: null, name: "", location: "" });
          } catch (err) {
            Alert.alert("Erreur", err.message);
          }
        }}
      >
        Enregistrer
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
  kioskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  kioskIcon: { marginRight: 8 },
  kioskInfo: { flex: 1, minWidth: 150 },
  kioskTitle: { color: theme.colors.onSurface, fontWeight: "bold" },
  kioskDescription: { color: theme.colors.placeholder },
  kioskBalance: { marginTop: 2 },
  kioskActions: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
});