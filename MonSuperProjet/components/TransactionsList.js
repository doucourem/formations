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
  
  SegmentedButtons,
  MD3DarkTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import supabase from "../supabaseClient";
import { Snackbar } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { sendAndSaveMessage } from "./sendAndSaveMessage";
const { width, height } = Dimensions.get('window');

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

//const TRANSACTION_TYPES = ["Vente UV","Autre"];
//const TRANSACTION_TYPES = ["Vente UV", "Dépôt cash", "Retrait cash", "Transfert", "Autre"];

const getTransactionTypes = (role) => {
  switch (role?.toLowerCase()) {
    case "grossiste":
      return ["Demande de fonds", "Autre"]; // ventes sortantes
    case "kiosque":
      return ["Autre"]; // achats entrants
    default:
      return ["Vente UV", "Autre"];
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
  const [dateFilter, setDateFilter] = useState("all");
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
    transactionType: "Vente UV",
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
    // Récupérer le rôle de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    setProfile(profile); // ← Corrigé ici
    setTransactionTypes(getTransactionTypes(profile?.role));

    const { data: kiosksData } = await supabase.from("kiosks").select("id, name");

    let cashesData;

if (profile?.role === "kiosque" || profile?.role === "grossiste") {
  const { data, error } = await supabase
    .from("cashes")
    .select("id, name, kiosk_id, balance, min_balance")
    .or(`cashier_id.eq.${user.id},seller_id.eq.${user.id}`); // récupère les caisses liées à l'id de l'utilisateur, qu'il soit kiosque ou grossiste
if (error) {
  console.error("Supabase error:", error);
  throw error;
}
  cashesData = data;
} else {
  const { data, error } = await supabase
    .from("cashes")
    .select("id, name, kiosk_id, balance, min_balance");
  if (error) throw error;
  cashesData = data;
}

    const cashIds = cashesData.map((c) => c.id);
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .in("cash_id", cashIds)
      .order("created_at", { ascending: false });

    const cashBalances = {};
    const enriched = txData.map((t) => {
      const isCredit = t.type === "CREDIT";
      const prev = cashBalances[t.cash_id] || 0;
      const newBal = isCredit ? prev + t.amount : prev - t.amount;
      cashBalances[t.cash_id] = newBal;

      const cash = cashesData.find((c) => c.id === t.cash_id);
      const kiosk = kiosksData.find((k) => k.id === cash?.kiosk_id);

      return {
        ...t,
        cash_name: cash?.name,
        kiosk_name: kiosk?.name,
        balance_after: newBal,
        below_min: cash ? newBal <= cash.min_balance : false,
      };
    });

// Pré-sélection automatique si une seule caisse existe
// Mise à jour des données principales
setTransactions(enriched);
setCashes(cashesData);
setKiosks(kiosksData);
console.log(cashesData)
// Pré-sélection automatique
if (cashesData.length === 1) {
  const uniqueCash = cashesData[0];
  console.log(uniqueCash.id)
  setForm((prev) => {
    if (prev.cashId === uniqueCash.id) return prev;
    return {
      ...prev,
      cashId: uniqueCash.id,
      cashQuery: uniqueCash.name,
    };
  });
 
} else if (profile?.role === "kiosque" || profile?.role === "grossiste") {
  // Si plusieurs caisses mais que l'utilisateur est un vendeur, on peut pré-sélectionner la première
  const userCash = cashesData.find(c => c.cashier_id === user.id || c.seller_id === user.id);
  if (userCash) {
    setForm((prev) => ({
      ...prev,
      cashId: userCash.id,
      cashQuery: userCash.name,
    }));
  }
}


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
    // 🟦 1 — Si l'utilisateur est "grossiste", on remplace automatiquement la caisse
    let finalCashId = cashId;

    if (profile?.role?.toLowerCase() === "grossiste") {
      const { data: userCashArray, error } = await supabase
        .from("cashes")
        .select("id, name, balance, min_balance")
        .eq("seller_id", user.id)
        .limit(1);

      if (error) throw new Error("Impossible de récupérer la caisse du grossiste.");
      if (!userCashArray || userCashArray.length === 0) throw new Error("Aucune caisse associée à votre compte.");

      finalCashId = userCashArray[0].id;
    }

    // 🟦 2 — Vérifier la caisse sélectionnée
    const selectedCash = cashes.find(c => c.id === finalCashId);
    if (!selectedCash) throw new Error("Caisse introuvable.");

    const montant = parseFloat(amount);

    // 🟦 3 — Calcul du solde actuel
    const cashTransactions = transactions.filter(t => t.cash_id === finalCashId);
    let totalTransactions = cashTransactions.reduce(
      (sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount),
      0
    );

    const newBalance = totalTransactions + (type === "CREDIT" ? montant : -montant);

    // 🟦 4 — Vérification du seuil minimum
    if (newBalance > selectedCash.min_balance) {
       console.log("Total Transactions avant:", selectedCash.min_balance, "Nouveau solde:", newBalance);
      showAlert(
        "Attention",
        `⚠️ Le solde de la caisse "${selectedCash.name}" (${newBalance} XOF) a atteint le minimum (${selectedCash.min_balance} XOF).`
      );
      // Si tu veux **bloquer la transaction**, ajoute `return;` ici
       return;
    }

    // 🟦 5 — Mise à jour ou création transaction
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

      // Envoi WhatsApp
      const { data: kiosksData, error: kiosksError } = await supabase
        .from("kiosks")
        .select("id, name");

      const kiosk = kiosksData?.find(k => k.id === selectedCash?.kiosk_id);

      const message = `
NOUVELLE TRANSACTION 📄

🏦 Boutique : ${selectedCash?.name || "Inconnue"}
👤 Nom : ${kiosk?.name || "Inconnu"}
💰 Montant : ${formatCFA(montant)}
🕒 Créé le : ${new Date().toLocaleString()}
`;
      await sendAndSaveMessage("whatsapp:+24102849507", message);
    }

    // 🟦 6 — Reset formulaire
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
    return (
      <Card style={[styles.card, { borderRadius: width * 0.02 }]}>
        <Card.Title
          title={isCredit ? "Envoie" : "Paiement"}
          subtitle={`${item.cash_name} — ${item.kiosk_name}`}
          left={(props) => (
            <MaterialCommunityIcons
              {...props}
              name={isCredit ?"arrow-up-bold-circle":"arrow-down-bold-circle"}
              color={isCredit ? theme.colors.error : theme.colors.success }
              size={width * 0.07}
            />
          )}
          right={() => (
  <View style={{ flexDirection: "row" }}>
    {profile?.role?.toLowerCase()  === "admin" && (
      <>
        <TouchableOpacity
          onPress={() => openEditDialog(item)}
          style={[styles.actionBtn, { backgroundColor: "orange", marginRight: width * 0.02 }]}
        >
          <MaterialCommunityIcons name="pencil" color="white" size={width * 0.045} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteTransaction(item.id)}
          style={[styles.actionBtn, { backgroundColor: "red" }]}
        >
          <MaterialCommunityIcons name="delete" color="white" size={width * 0.045} />
        </TouchableOpacity>
      </>
    )}
  </View>
)}

        />
        <Card.Content>
          <Text>
            Montant : <Text style={{ fontWeight: "bold", color: isCredit ? theme.colors.error : theme.colors.success  }}>{formatCFA(item.amount)}</Text>
          </Text>
          <Text>Date : {new Date(item.created_at).toLocaleString()}</Text>
         <Text>
      Type : {item.transaction_type === "Autre" && item.other_type ? item.other_type : item.transaction_type}
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
            { value: "all", label: "Toutes" },
            { value: "today", label: "Aujourd’hui" },
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
            setForm({ cashId: null, cashQuery: "", amount: "", type: "CREDIT", transactionType: "Vente UV", otherType: "" });
            setDialogVisible(true);
          }}
          color="white"
          label="Nouvelle"
        />

       <Portal>
 <Dialog
  visible={dialogVisible}
  onDismiss={() => setDialogVisible(false)}
  style={{
    backgroundColor: theme.colors.surface,
    borderRadius: width * 0.04,    // OK
    marginHorizontal: width * 0.03, 
    maxHeight: height * 0.85,      // OK
  }}
>
    <Dialog.Title
      style={{
        textAlign: "center",
        color: theme.colors.onSurface,
        fontWeight: "bold",
        fontSize: responsiveFont(18),
      }}
    >
      {editMode ? "Modifier la transaction" : "Nouvelle transaction"}
    </Dialog.Title>

    <Dialog.ScrollArea
      style={{
        maxHeight: height * 0.7,
        paddingHorizontal: width * 0.03,
      }}
    >
      <Dialog.Content>
        {/* Rechercher une caisse */}
      {/* Sélection de la caisse */}
{cashes.length > 1 ? (
  <>
    {/* 🔍 Recherche si plusieurs caisses */}
    <TextInput
      label="Rechercher une caisse"
      value={form.cashQuery}
      onChangeText={(text) =>
        setForm({ ...form, cashQuery: text })
      }
      mode="outlined"
      style={{ marginBottom: height * 0.01 }}
      right={<TextInput.Icon icon="magnify" />}
    />

    {/* Liste filtrée */}
    {form.cashQuery.length > 0 && (
      <View
        style={{
          maxHeight: height * 0.25,
          borderWidth: 1,
          borderColor: "#475569",
          borderRadius: width * 0.02,
          overflow: "hidden",
          marginBottom: height * 0.015,
        }}
      >
        <FlatList
          data={cashes.filter((c) =>
            c.name.toLowerCase().includes(form.cashQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                setForm({
                  ...form,
                  cashId: item.id,
                  cashQuery: item.name,
                })
              }
              style={{
                paddingVertical: height * 0.012,
                paddingHorizontal: width * 0.03,
                backgroundColor:
                  form.cashId === item.id ? theme.colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  color:
                    form.cashId === item.id
                      ? "white"
                      : theme.colors.onSurface,
                  fontWeight: form.cashId === item.id ? "600" : "normal",
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )}
  </>
) : (
  /* 🏦 Caisse auto si une seule */
  
  cashes.length === 1  ? (
    <View
      style={{
        marginBottom: height * 0.02,
        padding: width * 0.03,
        backgroundColor: theme.dark ? "#1e293b" : "#F1F5F9",
        borderRadius: width * 0.02,
        borderWidth: 1,
        borderColor: theme.dark ? "#64748B" : "#CBD5E1",
      }}
    >
      <Text style={{ marginBottom: 10 }}>
        🏦 Caisse sélectionnée automatiquement :{" "}
        <Text style={{ fontWeight: "bold", color: theme.colors.primary }}>
          {form.cashQuery || cashes[0].name}
        </Text>
      </Text>
    </View>
  ) : null
)}


        {/* Montant */}
        <TextInput
          label="Montant"
          keyboardType="numeric"
          value={form.amount}
          onChangeText={(text) => setForm({ ...form, amount: text })}
          mode="outlined"
          style={{ marginBottom: height * 0.015 }}
        />

        {/* Type de transaction */}
      {profile?.role?.toLowerCase() !== "grossiste" && (  
        <><Text
                    style={{
                      marginBottom: 6,
                      fontWeight: "600",
                      color: theme.colors.onSurface,
                    }}
                  >
                    Type :
                  </Text><View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: height * 0.02,
                    }}
                  >
                      {profile?.role?.toLowerCase() === "admin" && (
                        <Button
                          mode={form.type === "CREDIT" ? "contained" : "outlined"}
                          onPress={() => setForm({ ...form, type: "CREDIT" })}
                          style={{ flex: 1, marginRight: width * 0.01 }}
                          buttonColor={form.type === "CREDIT" ? theme.colors.error : undefined}
                          textColor={form.type === "CREDIT" ? "white" : theme.colors.onSurface}
                        >
                          Envoie
                        </Button>
                      )}
                      {profile?.role?.toLowerCase() !== "grossiste" && (
                        <Button
                          mode={form.type === "DEBIT" ? "contained" : "outlined"}
                          onPress={() => setForm({ ...form, type: "DEBIT" })}
                          style={{ flex: 1, marginLeft: width * 0.01 }}
                          buttonColor={form.type === "DEBIT" ? theme.colors.success : undefined}
                          textColor={form.type === "DEBIT" ? "white" : theme.colors.onSurface}
                        >
                          Paiement
                        </Button>
                      )}
                    </View></>
   )}
        {/* Type spécifique */}
        <Text
          style={{
            marginBottom: 6,
            fontWeight: "600",
            color: theme.colors.onSurface,
          }}
        >
          Type de transaction :
        </Text>
        <View
  style={{
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: height * 0.015,
  }}
>
  {transactionTypes.map((t) => (
    <Button
      key={t}
      mode={form.transactionType === t ? "contained" : "outlined"}
      onPress={() => setForm({ ...form, transactionType: t, otherType: "" })}
      style={{
        marginVertical: 4,
        flex: 1,               // prend toute la largeur disponible
        marginHorizontal: 2,   // petit espace entre boutons
        minWidth: width * 0.4, // largeur minimum
      }}
      buttonColor={form.transactionType === t ? theme.colors.primary : undefined}
      textColor={form.transactionType === t ? "white" : theme.colors.onSurface}
      contentStyle={{ flexWrap: "wrap" }} // texte peut aller à la ligne
    >
      {t}
    </Button>
  ))}
</View>


        {/* Autre type */}
        {form.transactionType === "Autre" && (
          <TextInput
            label="Précisez le type de transaction"
            value={form.otherType}
            onChangeText={(text) => setForm({ ...form, otherType: text })}
            mode="outlined"
            style={{ marginBottom: height * 0.015 }}
          />
        )}
      </Dialog.Content>
    </Dialog.ScrollArea>

    <Dialog.Actions
      style={{ justifyContent: "space-between", paddingHorizontal: width * 0.04 }}
    >
      <Button onPress={() => setDialogVisible(false)} textColor="white"
         buttonColor={theme.colors.error}>
        Annuler
      </Button>
      <Button
        mode="contained"
        onPress={handleSaveTransaction}
        buttonColor={theme.colors.primary}
        textColor="white"
      >
        {editMode ? "Modifier" : "Enregistrer"}
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>

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
