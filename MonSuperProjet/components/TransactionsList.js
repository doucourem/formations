import React, { useEffect, useState, useCallback } from "react"; 
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Text,
  Provider as PaperProvider,
  Card,
  FAB, 
  MD3LightTheme,
  SegmentedButtons,
  MD3DarkTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import supabase from "../supabaseClient";
import { Snackbar } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { sendAndSaveMessage } from "./sendAndSaveMessage";
import TransactionDialog from "../components/TransactionDialog";

const { width, height } = Dimensions.get('window');

const theme = {
  ...MD3LightTheme, // On passe sur une base claire
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4F46E5",       // Indigo pour les boutons
    secondary: "#10B981",     // Vert pour les succès
    background: "#F2F2F7",    // LE "BLANC SALE" (Gris très clair type iOS)
    surface: "#FFFFFF",       // Blanc pur pour les cartes (pour qu'elles ressortent)
    onSurface: "#1C1C1E",     // Texte presque noir
    onSurfaceVariant: "#636366", // Texte gris secondaire
    outline: "#D1D1D6",       // Bordures fines
  },
};

//const TRANSACTION_TYPES = ["Vente UV","Autre"];
//const TRANSACTION_TYPES = ["Vente UV", "Dépôt cash", "Retrait cash", "Transfert", "Autre"];

const getTransactionTypes = (role) => {
  switch (role?.toLowerCase()) {
    case "grossiste":
      return [ "Demande de fonds"]; // ventes sortantes
    case "kiosque":
      return ["CASH", "Renvoie Airtel", "Renvoie Moov"]; // achats entrants
    default:
      return ["Envoie Airtel", "Envoie Moov","CASH", "Renvoie Airtel", "Renvoie Moov"];
  }
};

const responsiveFont = (f) => Math.round(f * (width / 375));

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "", color: "red" });
  const [selectedDate, setSelectedDate] = useState(null);
const [calendarVisible, setCalendarVisible] = useState(false);
const [transactionTypes, setTransactionTypes] = useState([]);



  const [form, setForm] = useState({
    cashId: null,
    cashQuery: "",
    amount: "",
    type: "CREDIT",
    transactionType: "Envoie Airtel",
    otherType: "",
  });
  const [profile, setProfile] = useState(null);


  // === Auth utilisateur ===
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(data.user);
    };
    loadUser();
  }, []);




  // === Récupération cashes + transactions ===
const fetchCashesAndTransactions = useCallback(async () => {
  if (!user) return;
  setLoading(true);

  try {
    // 🔹 1️⃣ Récupérer le rôle de l'utilisateur et normaliser
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    setProfile(profileData);
    const role = profileData?.role?.toLowerCase();
    const isAdmin = role === "admin";

    // Type par défaut selon rôle
    const defaultType = role === "kiosque" ? "DEBIT" : "CREDIT";
    setTransactionTypes(getTransactionTypes(profileData?.role));

    // 🔹 2️⃣ Récupérer les kiosks
    let kiosksData = [];
    if (isAdmin) {
      // Admin ne voit que ses kiosks
      const { data, error } = await supabase
        .from("kiosks")
        .select("id, name")
        .eq("owner_id", user.id);
      if (error) throw error;
      kiosksData = data || [];
    } else {
      const { data } = await supabase.from("kiosks").select("id, name");
      kiosksData = data || [];
    }

    // 🔹 3️⃣ Récupérer les caisses selon rôle
    let cashesData = [];
    if (role === "kiosque" || role === "grossiste") {
      const { data, error } = await supabase
        .from("cashes")
        .select("id, name, kiosk_id, balance, min_balance, cashier_id, seller_id")
        .or(`cashier_id.eq.${user.id},seller_id.eq.${user.id}`);
      if (error) throw error;
      cashesData = data || [];
    } else {
      // Admin ou autres roles -> toutes les caisses des kiosks accessibles
      const kioskIds = kiosksData.map(k => k.id);
      if (kioskIds.length) {
        const { data, error } = await supabase
          .from("cashes")
          .select("id, name, kiosk_id, balance, min_balance")
          .in("kiosk_id", kioskIds);
        if (error) throw error;
        cashesData = data || [];
      }
    }

    // 🔹 4️⃣ Récupérer les transactions
    const cashIds = cashesData.map(c => c.id);
    const { data: txData = [] } = await supabase
      .from("transactions")
      .select("*")
      .in("cash_id", cashIds.length ? cashIds : [0]) // sécurise in([])
      .order("created_at", { ascending: false });

    // 🔹 5️⃣ Calcul des soldes et enrichissement
    const cashBalances = {};
    const enriched = txData.map(t => {
      const isCredit = t.type === "CREDIT";
      const prev = cashBalances[t.cash_id] || 0;
      const newBal = isCredit ? prev + t.amount : prev - t.amount;
      cashBalances[t.cash_id] = newBal;

      const cash = cashesData.find(c => c.id === t.cash_id);
      const kiosk = kiosksData.find(k => k.id === cash?.kiosk_id);

      return {
        ...t,
        cash_name: cash?.name,
        kiosk_name: kiosk?.name,
        balance_after: newBal,
        below_min: cash ? newBal <= cash.min_balance : false,
      };
    });

    // 🔹 6️⃣ Déterminer la caisse par défaut
    let defaultCashId = null;
    let defaultCashQuery = "";
    if (cashesData.length === 1) {
      defaultCashId = cashesData[0].id;
      defaultCashQuery = cashesData[0].name;
    } else if (role === "kiosque" || role === "grossiste") {
      const userCash = cashesData.find(c => c.cashier_id === user.id || c.seller_id === user.id);
      if (userCash) {
        defaultCashId = userCash.id;
        defaultCashQuery = userCash.name;
      }
    }

    // 🔹 7️⃣ Mettre à jour les états
    setTransactions(enriched);
    setCashes(cashesData);
    setKiosks(kiosksData);

    // 🔹 8️⃣ Initialiser le formulaire
    setForm({
      cashId: defaultCashId,
      cashQuery: defaultCashQuery,
      amount: "",
      type: defaultType,
      transactionType: role === "kiosque" ? "CASH" : "Envoie Airtel",
      otherType: "",
    });

    setLoading(false);
  } catch (err) {
    Alert.alert("Erreur", err.message);
    setLoading(false);
  }
}, [user]);




  useEffect(() => {
    fetchCashesAndTransactions();
  }, [fetchCashesAndTransactions]);

  // === Filtrage combiné ===
useEffect(() => {
  if (!transactions.length) return;
  const now = new Date();
  let filtered = transactions;

  if (dateFilter === "today") {
    filtered = filtered.filter((t) => {
      const txDate = new Date(t.created_at);
      return (
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getDate() === now.getDate()
      );
    });
  } else if (dateFilter === "week") {
    const firstDay = new Date(now);
    firstDay.setDate(now.getDate() - now.getDay());
    firstDay.setHours(0, 0, 0, 0);
    filtered = filtered.filter((t) => new Date(t.created_at) >= firstDay);
  } else if (dateFilter === "month") {
    filtered = filtered.filter((t) => {
      const txDate = new Date(t.created_at);
      return (
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth()
      );
    });
  }

  if (typeFilter !== "all") {
    filtered = filtered.filter((t) => t.type === typeFilter);
  }

  if (searchQuery.trim().length > 0) {
    filtered = filtered.filter((t) =>
      t.cash_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedDate) {
    filtered = filtered.filter((t) => {
      const txDate = new Date(t.created_at);
      const selected = new Date(selectedDate);
      return (
        txDate.getFullYear() === selected.getFullYear() &&
        txDate.getMonth() === selected.getMonth() &&
        txDate.getDate() === selected.getDate()
      );
    });
  }

  setFilteredTransactions(filtered);
}, [dateFilter, typeFilter, searchQuery, selectedDate, transactions]);

const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title ? title + "\n\n" : ""}${message}`);
  } else {
    Alert.alert(title, message);
  }
};
  // === CRUD transaction ===
const handleSaveTransaction = async () => {
  const { cashId, amount, transactionType, type, otherType } = form;

  if (!amount) {
    showAlert("Erreur", "Veuillez remplir tous les champs.");
    return;
  }

  try {
    // 🟦 1 — Déterminer la caisse finale pour le grossiste
    let finalCashId = cashId;

    if (profile?.role?.toLowerCase() === "grossiste") {
      const { data: userCashArray, error } = await supabase
        .from("cashes")
        .select("id, name, balance, min_balance, kiosk_id")
        .eq("seller_id", user.id)
        .limit(1);

      if (error) throw new Error("Impossible de récupérer la caisse du grossiste.");
      if (!userCashArray || userCashArray.length === 0) throw new Error("Aucune caisse associée à votre compte.");

      finalCashId = userCashArray[0].id;
    }

    // 🟦 2 — Vérification de la caisse sélectionnée
    const selectedCash = cashes.find(c => c.id === finalCashId);
    if (!selectedCash) throw new Error("Caisse introuvable.");

    const montant = parseFloat(amount);

    // 🟦 3 — Calcul du nouveau solde
    const cashTransactions = transactions.filter(t => t.cash_id === finalCashId);
    const totalTransactions = cashTransactions.reduce(
      (sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount),
      0
    );

    const newBalance = totalTransactions + (type === "CREDIT" ? montant : -montant);

    // 🟦 4 — Vérification du seuil minimum
    if (newBalance > selectedCash.min_balance) {
      showAlert(
        "Attention",
        `⚠️ Le solde de la caisse "${selectedCash.name}" (${newBalance} XOF) a atteint le minimum (${selectedCash.min_balance} XOF).`
      );
      return; // bloque la transaction si seuil atteint
    }

    // 🟦 5 — Création ou mise à jour de la transaction
    if (editMode && editingId) {
      const { error } = await supabase
        .from("transactions")
        .update({
          cash_id: finalCashId,
          amount: montant,
          type,
          transaction_type: transactionType,
          other_type: transactionType === "Autre" ? otherType : null,
        })
        .eq("id", editingId);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("transactions").insert([
        {
          cash_id: finalCashId,
          amount: montant,
          type,
          transaction_type: transactionType,
          other_type: transactionType === "Autre" ? otherType : null,
          created_at: new Date(),
        },
      ]);
      if (error) throw error;

      // Mise à jour du solde de la caisse
      await supabase.from("cashes").update({ balance: newBalance }).eq("id", finalCashId);
    }

    // 🟦 6 — Envoi WhatsApp
    const { data: kiosksData } = await supabase.from("kiosks").select("id, name");
    const kiosk = kiosksData?.find(k => k.id === selectedCash?.kiosk_id);

    const message = `
NOUVELLE TRANSACTION 📄
🏦 Boutique : ${selectedCash?.name || "Inconnue"}
👤 Nom : ${kiosk?.name || "Inconnu"}
💰 Montant : ${formatCFA(montant)}
🕒 Créé le : ${new Date().toLocaleString()}
`;
    await sendAndSaveMessage("whatsapp:+24102849507", message);

    // 🟦 7 — Envoi USSD sécurisé via Supabase Function
    // Assurez-vous que la Function récupère le PIN du grossiste côté serveur
    await fetch("https://swjbaulntncrzsxjwhhu.supabase.co/functions/v1/send-ussd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: selectedCash?.ussd_number || "+221770000000",
        amount: montant,
        transactionType,
        grossisteId: user.id,
      }),
    });

    // 🟦 8 — Reset formulaire
    setDialogVisible(false);
    setForm({
      cashId: null,
      cashQuery: "",
      amount: "",
      type: "CREDIT",
      transactionType: "Vente UV",
      otherType: "",
    });
    setEditMode(false);
    setEditingId(null);
    fetchCashesAndTransactions();

    showAlert("Succès", "Transaction enregistrée avec succès ✅");
  } catch (err) {
    showAlert("Erreur", err.message);
  }
};
const sendUSSDTransaction = async ({ phoneNumber, amount, transactionType }) => {
  try {
    const API_KEY = "ZW165_UMjeUEZz6hcbiankqFlt9Xgqz188HI";
    const PROJECT_ID = "PJ4d6fa43ac6c80187";

    const response = await fetch(
      `https://api.telerivet.com/v1/projects/${PROJECT_ID}/messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(API_KEY + ":")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_number: phoneNumber,
          content: `Transaction ${transactionType}: ${amount} XOF`,
          type: "ussd",
        }),
      }
    );

    const data = await response.json();
    console.log("USSD envoyé:", data);
  } catch (err) {
    console.error("Erreur USSD:", err);
  }
};



const handleDeleteTransaction = (id) => {
  const confirmDelete = () => {
    supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          setSnackbar({
            visible: true,
            message: `Erreur : ${error.message}`,
            color: theme.colors.error,
          });
          return;
        }
        fetchCashesAndTransactions();
        setSnackbar({
          visible: true,
          message: "Transaction supprimée ✅",
          color: theme.colors.success,
        });
      });
  };

  // ⚙️ Différencier plateformes
  if (Platform.OS === "web") {
    if (window.confirm("Supprimer cette transaction ?")) {
      confirmDelete();
    }
  } else {
    Alert.alert("Confirmation", "Supprimer cette transaction ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: confirmDelete },
    ]);
  }
};


  const openEditDialog = (item) => {
    setEditMode(true);
    setEditingId(item.id);
    setForm({
      cashId: item.cash_id,
      cashQuery: item.cash_name,
      amount: item.amount.toString(),
      type: item.type,
      transactionType: transactionTypes.includes(item.transaction_type) ? item.transaction_type : "Autre",
      otherType: item.other_type ,
    });
    setDialogVisible(true);
  };

  const formatCFA = (a) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(a);

 const renderItem = ({ item }) => {
  const isCredit = item.type === "CREDIT";
  const isAdmin = profile?.role === "admin";



  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Card.Title
        title={isCredit ? "Envoie" : "Paiement"}
        titleStyle={{ color: theme.colors.onSurface }}
        subtitle={`${item.cash_name} — ${item.kiosk_name}`}
        subtitleStyle={{ color: theme.colors.outline }}
        left={() => (
          <MaterialCommunityIcons
            name={isCredit ? "arrow-up-bold-circle" : "arrow-down-bold-circle"}
            size={32}
            color={isCredit ? theme.colors.error : theme.colors.success}
          />
        )}
        right={() =>
  isAdmin ? (
    <View style={{ flexDirection: "row", marginRight: 8 }}>
      <TouchableOpacity
        onPress={() => openEditDialog(item)}
        style={{ marginRight: 12 }}
      >
        <MaterialCommunityIcons
          name="pencil"
          size={22}
          color={theme.colors.accent}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDeleteTransaction(item.id)}
      >
        <MaterialCommunityIcons
          name="delete"
          size={22}
          color={theme.colors.error}
        />
      </TouchableOpacity>
    </View>
  ) : null
}

      />

      <Card.Content>
        <Text style={{ color: theme.colors.onSurface }}>
          Montant :{" "}
          <Text style={{ fontWeight: "bold" }}>
            {formatCFA(item.amount)}
          </Text>
        </Text>

        <Text style={{ color: theme.colors.onSurface }}>
          Date : {new Date(item.created_at).toLocaleString()}
        </Text>

        <Text style={{ color: theme.colors.onSurface }}>
          Type :{" "}
          {item.transaction_type === "Autre" && item.other_type
            ? item.other_type
            : item.transaction_type}
        </Text>
      </Card.Content>
    </Card>
  );
};



  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={[styles.title, { fontSize: responsiveFont(22), color: theme.colors.onBackground }]}>
          Transactions
        </Text>

        <TextInput
          placeholder="🔍 Rechercher une boutique..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: height * 0.015 }}
          mode="outlined"
        />

        <SegmentedButtons
          value={dateFilter}
          onValueChange={setDateFilter}
          buttons={[
             { value: "today", label: "Aujourd’hui" },
            { value: "all", label: "Tous" },
           
          ]}
          style={{ marginBottom: height * 0.01 }}
        />

        <SegmentedButtons
          value={typeFilter}
          onValueChange={setTypeFilter}
          buttons={[
            { value: "all", label: "Tous" },
            { value: "CREDIT", label: "Envoie" },
            { value: "DEBIT", label: "Paiement" },
          ]}
          style={{ marginBottom: height * 0.02 }}
        />

<Button
  mode="outlined"
  onPress={() => setCalendarVisible(!calendarVisible)}
  style={{ marginBottom: height * 0.015 }}
  icon="calendar"
>
  {selectedDate ? `Filtrer : ${new Date(selectedDate).toLocaleDateString()}` : "Choisir une date"}
</Button>

{calendarVisible && (
  <Calendar
    onDayPress={(day) => {
      setSelectedDate(day.dateString);
      setCalendarVisible(false);
    }}
    markedDates={
      selectedDate
        ? { [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }
        : {}
    }
    theme={{
      backgroundColor: theme.colors.background,
      calendarBackground: theme.colors.surface,
      dayTextColor: theme.colors.onSurface,
      monthTextColor: theme.colors.onSurface,
      arrowColor: theme.colors.primary,
      todayTextColor: theme.colors.accent,
    }}
    style={{ marginBottom: height * 0.02, borderRadius: 12 }}
  />
)}

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: height * 0.05 }} />
        ) : (
          
          <FlatList
            data={filteredTransactions}
            keyExtractor={(i) => i.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: height * 0.12 }}
            ListEmptyComponent={<Text style={{ color: theme.colors.onSurface, textAlign: "center" }}>Aucune transaction trouvée.</Text>}
          />
        )}

      <FAB
  icon="plus"
  style={[styles.fab, { bottom: height * 0.03, right: width * 0.04 }]}
  onPress={() => {
    setEditMode(false);
    setEditingId(null);

    // Définition du type de transaction selon le rôle
    const role = profile?.role?.toLowerCase();
    let type = "CREDIT";
    let transactionType = "Envoie Airtel";

    if (role === "kiosque") {
      type = "DEBIT";
      transactionType = "CASH";
    } else if (role === "grossiste") {
      type = "CREDIT"; // ou CREDIT selon ton besoin pour la demande de fonds
      transactionType = "Demande de fonds";
    }

    setForm({ 
      cashId: cashes.length === 1 ? cashes[0].id : null, 
      cashQuery: cashes.length === 1 ? cashes[0].name : "", 
      amount: "", 
      type,
      transactionType,
      otherType: "" 
    });

    setDialogVisible(true);
  }}
  label="Nouvelle"
/>


       <TransactionDialog
  visible={dialogVisible}
  onDismiss={() => setDialogVisible(false)}
  onSave={handleSaveTransaction}
  editMode={editMode}
  theme={theme}
  responsiveFont={responsiveFont}
  cashes={cashes}
  form={form}
  setForm={setForm}
  profile={profile}
  transactionTypes={transactionTypes}
/>


      </View>
      <Snackbar
  visible={snackbar.visible}
  onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
  duration={3000}
  style={{ backgroundColor: snackbar.color }}
>
  {snackbar.message}
</Snackbar>

    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: width * 0.04 },
  title: { fontWeight: "bold", marginBottom: height * 0.015 },
  card: { marginBottom: height * 0.01, elevation: 2 },
  fab: { position: "absolute", backgroundColor: "#2563EB", zIndex: 10 },
  actionBtn: { padding: width * 0.015, borderRadius: width * 0.015 },
});
