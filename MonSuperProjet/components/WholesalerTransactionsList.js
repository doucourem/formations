import React, { useState, useEffect } from "react";
import { View, SectionList, StyleSheet } from "react-native";
import {
  Card,
  Text,
  List,
  Button,
  Dialog,
  Portal,
  TextInput,
  useTheme,
} from "react-native-paper";
import supabase from "../supabaseClient";

/* ================= HELPERS ================= */

const formatCFA = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount || 0);

/* ================= COMPONENT ================= */

export default function WholesalerTransactionsList({ route }) {
  const theme = useTheme();
  const { wholesalerId, wholesalerName } = route.params || {};

  const [transactions, setTransactions] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState([]);

  // create
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");

  // edit
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("CREDIT");

  useEffect(() => {
    if (wholesalerId) fetchTransactions();
  }, [wholesalerId]);

  /* ================= FETCH ================= */

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("wholesaler_transactions")
      .select("*")
      .eq("wholesaler_id", Number(wholesalerId))
      .order("created_at", { ascending: false });

    setTransactions(data || []);
    groupByDate(data || []);
  };

  const groupByDate = (data) => {
    const grouped = data.reduce((acc, tx) => {
      const key = new Date(tx.created_at).toLocaleDateString("fr-FR");
      if (!acc[key]) acc[key] = { transactions: [], credit: 0, debit: 0 };

      acc[key].transactions.push(tx);
      tx.type === "CREDIT"
        ? (acc[key].credit += Number(tx.amount))
        : (acc[key].debit += Number(tx.amount));

      return acc;
    }, {});

    setGroupedTransactions(
      Object.keys(grouped).map((k) => ({
        title: k,
        data: grouped[k].transactions,
        totalCredit: grouped[k].credit,
        totalDebit: grouped[k].debit,
      }))
    );
  };

  /* ================= CREATE ================= */

  const createTransaction = async () => {
    if (!amount) return;

    await supabase.from("wholesaler_transactions").insert([
      {
        wholesaler_id: Number(wholesalerId),
        amount: parseFloat(amount),
        type,
      },
    ]);

    setOpen(false);
    setAmount("");
    setType("CREDIT");
    fetchTransactions();
  };

  /* ================= EDIT ================= */

  const openEditDialog = (tx) => {
    setSelectedTx(tx);
    setEditAmount(String(tx.amount));
    setEditType(tx.type);
    setEditOpen(true);
  };

  const updateTransaction = async () => {
    if (!selectedTx) return;

    await supabase
      .from("wholesaler_transactions")
      .update({
        amount: parseFloat(editAmount),
        type: editType,
      })
      .eq("id", selectedTx.id);

    setEditOpen(false);
    setSelectedTx(null);
    fetchTransactions();
  };

  /* ================= TOTALS ================= */

  const totalCredit = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalCredit - totalDebit;

  /* ================= UI ================= */

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text
        variant="headlineMedium"
        style={{ color: theme.colors.onBackground, textAlign: "center" }}
      >
        Transactions – {wholesalerName}
      </Text>

      {/* SUMMARY */}
      <Card style={[styles.summary, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={styles.text}>
            💰 Paiements : {formatCFA(totalCredit)}
          </Text>
          <Text style={styles.text}>
            📤 Demandes : {formatCFA(totalDebit)}
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              marginTop: 4,
              color: balance >= 0 ? "#10b981" : "#EF4444",
            }}
          >
            ⚖️ Balance : {formatCFA(balance)}
          </Text>
        </Card.Content>
      </Card>

      <Button
        icon="plus"
        mode="contained"
        style={{ marginBottom: 12 }}
        onPress={() => setOpen(true)}
      >
        Nouvelle transaction
      </Button>

      <SectionList
        sections={groupedTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.text}>
              Paiements : {formatCFA(section.totalCredit)}
            </Text>
            <Text style={styles.text}>
              Demandes : {formatCFA(section.totalDebit)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const color = item.type === "CREDIT" ? "#10b981" : "#EF4444";
          return (
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              onPress={() => openEditDialog(item)}
            >
              <List.Item
                title={formatCFA(item.amount)}
                titleStyle={{ color, fontWeight: "bold" }}
                description={new Date(item.created_at).toLocaleTimeString()}
                descriptionStyle={{ color: theme.colors.onSurface }}
                left={() => (
                  <List.Icon icon="cash" color={color} />
                )}
              />
            </Card>
          );
        }}
      />

      {/* CREATE */}
      <Portal>
        <Dialog
          visible={open}
          onDismiss={() => setOpen(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Nouvelle transaction
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Montant"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              textColor={theme.colors.onSurface}
            />

            <View style={styles.row}>
              <Button
                mode={type === "CREDIT" ? "contained" : "outlined"}
                onPress={() => setType("CREDIT")}
              >
                Paiement
              </Button>
              <Button
                mode={type === "DEBIT" ? "contained" : "outlined"}
                onPress={() => setType("DEBIT")}
              >
                Demande
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={createTransaction}>Créer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* EDIT */}
      <Portal>
        <Dialog
          visible={editOpen}
          onDismiss={() => setEditOpen(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Modifier transaction
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Montant"
              keyboardType="numeric"
              value={editAmount}
              onChangeText={setEditAmount}
              textColor={theme.colors.onSurface}
            />

            <View style={styles.row}>
              <Button
                mode={editType === "CREDIT" ? "contained" : "outlined"}
                onPress={() => setEditType("CREDIT")}
              >
                Paiement
              </Button>
              <Button
                mode={editType === "DEBIT" ? "contained" : "outlined"}
                onPress={() => setEditType("DEBIT")}
              >
                Demande
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={updateTransaction}>Enregistrer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  summary: { marginBottom: 12, borderRadius: 12 },
  text: { color: "#E5E7EB" },
  section: {
    padding: 8,
    marginTop: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontWeight: "bold",
    marginBottom: 4,
  },
  card: { marginVertical: 4, borderRadius: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
