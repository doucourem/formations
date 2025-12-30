import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  Text,
  Button,
  TextInput,
  Card,
  FAB,
  SegmentedButtons,
  Snackbar,
  Provider as PaperProvider,
  MD3DarkTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import supabase from "../supabaseClient";

const { width, height } = Dimensions.get("window");

/* ================= THEME ================= */
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2563EB",
    success: "#22C55E",
    error: "#EF4444",
    background: "#0A0F1A",
    surface: "#1E293B",
    onSurface: "#F8FAFC",
    onBackground: "#F8FAFC",
    outline: "#475569",
  },
};

export default function TransactionsList() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== FILTERS ===== */
  const [dateFilter, setDateFilter] = useState("today"); // today | all
  const [typeFilter, setTypeFilter] = useState("all"); // all | CREDIT | DEBIT
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    color: theme.colors.success,
  });

  /* ================= AUTH ================= */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  /* ================= FETCH ================= */
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("transactions_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (e) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /* ================= FILTER LOGIC ================= */
  useEffect(() => {
    let filtered = [...transactions];
    const now = new Date();

    // 📅 Aujourd’hui
    if (dateFilter === "today") {
      filtered = filtered.filter((t) => {
        const d = new Date(t.created_at);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      });
    }

    // 📆 Date spécifique
    if (selectedDate) {
      const s = new Date(selectedDate);
      filtered = filtered.filter((t) => {
        const d = new Date(t.created_at);
        return (
          d.getFullYear() === s.getFullYear() &&
          d.getMonth() === s.getMonth() &&
          d.getDate() === s.getDate()
        );
      });
    }

    // 💳 Type
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // 🔍 Recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter((t) =>
        t.cash_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, dateFilter, typeFilter, searchQuery, selectedDate]);

  /* ================= HELPERS ================= */
  const formatCFA = (n) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(n);

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }) => {
    const isCredit = item.type === "CREDIT";

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
              name={
                isCredit
                  ? "arrow-up-bold-circle"
                  : "arrow-down-bold-circle"
              }
              size={32}
              color={
                isCredit
                  ? theme.colors.error
                  : theme.colors.success
              }
            />
          )}
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

  /* ================= UI ================= */
  return (
    <PaperProvider theme={theme}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Transactions
        </Text>

        {/* 🔍 Recherche */}
        <TextInput
          placeholder="🔍 Rechercher une caisse"
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          textColor={theme.colors.onSurface}
          placeholderTextColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          outlineColor={theme.colors.outline}
          style={{
            marginBottom: 12,
            backgroundColor: theme.colors.surface,
          }}
        />

        {/* 📅 Date filter */}
        <SegmentedButtons
          value={dateFilter}
          onValueChange={setDateFilter}
          buttons={[
            { value: "today", label: "Aujourd’hui" },
            { value: "all", label: "Tout" },
          ]}
          style={{ marginBottom: 10 }}
        />

        {/* 💳 Type filter */}
        <SegmentedButtons
          value={typeFilter}
          onValueChange={setTypeFilter}
          buttons={[
            { value: "all", label: "Tout" },
            { value: "CREDIT", label: "Envoie" },
            { value: "DEBIT", label: "Paiement" },
          ]}
          style={{ marginBottom: 15 }}
        />

        {/* 📆 Calendar */}
        <Button
          icon="calendar"
          mode="outlined"
          textColor={theme.colors.onSurface}
          onPress={() => setCalendarVisible(!calendarVisible)}
          style={{ marginBottom: 10 }}
        >
          {selectedDate
            ? new Date(selectedDate).toLocaleDateString()
            : "Choisir une date"}
        </Button>

        {calendarVisible && (
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setDateFilter("all");
              setCalendarVisible(false);
            }}
            markedDates={
              selectedDate
                ? {
                    [selectedDate]: {
                      selected: true,
                      selectedColor: theme.colors.primary,
                    },
                  }
                : {}
            }
            theme={{
              backgroundColor: theme.colors.background,
              calendarBackground: theme.colors.surface,
              dayTextColor: theme.colors.onSurface,
              monthTextColor: theme.colors.onSurface,
              arrowColor: theme.colors.primary,
              todayTextColor: theme.colors.success,
              selectedDayTextColor: "#fff",
            }}
            style={{ borderRadius: 12, marginBottom: 15 }}
          />
        )}

        {/* 📄 List */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(i) => i.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.outline,
                  marginTop: 40,
                }}
              >
                Aucune transaction trouvée
              </Text>
            }
          />
        )}

        <FAB
          icon="plus"
          style={[
            styles.fab,
            { backgroundColor: theme.colors.primary },
          ]}
          color="white"
        />

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() =>
            setSnackbar({ ...snackbar, visible: false })
          }
          style={{ backgroundColor: snackbar.color }}
        >
          {snackbar.message}
        </Snackbar>
      </View>
    </PaperProvider>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: "bold", marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 12 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
