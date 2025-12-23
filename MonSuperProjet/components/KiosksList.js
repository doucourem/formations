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

const TRANSACTION_TYPES = ["Vente UV", "Dépôt cash", "Retrait cash", "Transfert", "Autre"];

// === Utilitaire pour convertir amount en float sûr ===
const safeAmount = (val) => (val ? parseFloat(val) : 0);

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

  // === Auth ===
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => { if (user) fetchKiosks(); }, [user]);

  // === Fetch kiosks ===
  const fetchKiosks = async () => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name, location, created_at")
      .eq("owner_id", user.id);

    if (error) Alert.alert("Erreur", error.message);
    else {
      setKiosks(data);
      fetchCashesAndBalancesOptimized(data);
    }
  };

  // === Optimized fetch of cashes and balances ===
  const fetchCashesAndBalancesOptimized = async (kiosksData) => {
    const kioskIds = kiosksData.map(k => k.id);

    // 1️⃣ Récupérer toutes les caisses d'un coup
    const { data: cashes, error: cashesError } = await supabase
      .from("cashes")
      .select("*")
      .in("kiosk_id", kioskIds);

    if (cashesError) {
      Alert.alert("Erreur", cashesError.message);
      return;
    }

    // 2️⃣ Récupérer toutes les transactions des caisses
    const cashIds = cashes.map(c => c.id);
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("cash_id, amount, type, transaction_type, id, created_at")
      .in("cash_id", cashIds);

    if (transactionsError) {
      Alert.alert("Erreur", transactionsError.message);
      return;
    }

    // 3️⃣ Calculer le solde par caisse
    const cashBalanceMap = {};
    cashes.forEach(c => {
      const cashTransactions = transactions.filter(t => t.cash_id === c.id);
      const balance = cashTransactions.reduce(
        (sum, t) => sum + (t.type === "CREDIT" ? -safeAmount(t.amount) : +safeAmount(t.amount)),
        0
      );
      cashBalanceMap[c.id] = { ...c, balance };
      // Sauver transactions
      setTransactionsMap(prev => ({ ...prev, [c.id]: cashTransactions }));
    });

    // 4️⃣ Organiser par kiosque
    const cashesMapTemp = {};
    const balancesTemp = {};
    kiosksData.forEach(k => {
      const kioskCashes = cashes.filter(c => c.kiosk_id === k.id).map(c => cashBalanceMap[c.id]);
      cashesMapTemp[k.id] = kioskCashes;
      balancesTemp[k.id] = kioskCashes.reduce((sum, c) => sum + safeAmount(c.balance), 0);
    });

    setCashesMap(cashesMapTemp);
    setBalances(balancesTemp);
  };

  // === Fetch transactions for a specific cash ===
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

  // === Total balance for selected cash ===
  const totalBalance = filteredTransactions.reduce(
    (sum, t) => sum + (t.type === "CREDIT" ? safeAmount(t.amount) : -safeAmount(t.amount)),
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
      await fetchCashesAndBalancesOptimized(kiosks); // recalculer les soldes
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

  // === Render kiosk ===
  const renderKiosk = ({ item }) => {
    const kioskCashes = cashesMap[item.id] || [];
    return (
      <Card style={[styles.card, { width: "100%" }]} elevation={3}>
        <Card.Content>
          <View style={styles.kioskHeader}>
            <List.Icon color={theme.colors.primary} icon="store" style={styles.kioskIcon} />
            <View style={styles.kioskInfo}>
              <Text style={[styles.kioskTitle, { fontSize: isTablet ? 18 : 16 }]}>{item.name}</Text>
              <Text style={[styles.kioskDescription, { fontSize: isTablet ? 14 : 12 }]}>Lieu: {item.location}</Text>
              <Text style={[styles.kioskBalance, { fontSize: isTablet ? 14 : 12, color: (balances[item.id] || 0) >= 0 ? theme.colors.success : theme.colors.error }]}>
                {balances[item.id] < 0
                  ? `⚠️ Il nous doit : ${(balances[item.id] || 0).toLocaleString("fr-FR")} FCFA`
                  : `💰 Il a une avance : ${(balances[item.id] || 0).toLocaleString("fr-FR")} FCFA`}
              </Text>
            </View>
            <View style={styles.kioskActions}>
              <IconButton icon="pencil" iconColor={theme.colors.accent} size={isTablet ? 28 : 24} onPress={() => { setCurrentKiosk(item); setOpenPopup(true); }} />
              <IconButton icon="delete" iconColor={theme.colors.error} size={isTablet ? 28 : 24} onPress={() => deleteKiosk(item.id)} />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // === JSX rendu ===
  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.title}>Clients & Transactions</Text>

        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.primary }}>
          <Card.Content>
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 18, textAlign: "center" }}>
              CRÉDIT TOTAL DE TOUS LES KIOSQUES
            </Text>
            <Text style={{ color: "#FFF", fontSize: 16, textAlign: "center", marginTop: 4 }}>
              {totalAllKiosks.toLocaleString("fr-FR")} XOF
            </Text>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={() => setOpenPopup(true)} style={styles.addButton}>
          Ajouter un client
        </Button>

        <FlatList
          data={kiosks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKiosk}
        />

        {/* Popup & Dialogs ici... */}
        {/* Tu peux garder ton code existant pour Dialog et transactions */}
      </View>
    </PaperProvider>
  );
}

// === Styles inchangés, tu peux réutiliser les tiens ===
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { marginBottom: 16, textAlign: "center", fontWeight: "bold", fontSize: 20, color: theme.colors.onSurface },
  addButton: { marginBottom: 16, backgroundColor: theme.colors.primary },
  card: { marginBottom: 12, backgroundColor: theme.colors.surface },
  kioskHeader: { flexDirection: "row", alignItems: "flex-start", flexWrap: "wrap" },
  kioskIcon: { marginRight: 8 },
  kioskInfo: { flex: 1, minWidth: 150 },
  kioskTitle: { color: theme.colors.onSurface, fontWeight: "bold" },
  kioskDescription: { color: theme.colors.placeholder },
  kioskBalance: { marginTop: 2 },
  kioskActions: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
});
