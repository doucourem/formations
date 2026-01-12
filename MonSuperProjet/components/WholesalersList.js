import React, { useEffect, useState, useCallback } from "react";
import supabase from "../supabaseClient";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Portal,
  Dialog,
  TextInput,
  IconButton,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

/* ================= HELPERS ================= */
const formatCFA = (amount = 0) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);

/* ================= THEME ================= */
const theme = {
  colors: {
    background: "#0A0F1A",
    surface: "#1E293B",
    primary: "#2563EB",
    onSurface: "#F8FAFC",
    placeholder: "#94A3B8",
    success: "#22C55E",
    error: "#EF4444",
  },
};

/* ================= COMPONENT ================= */
export default function WholesalersList() {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [wholesalers, setWholesalers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [globalTotals, setGlobalTotals] = useState({
    total_credit: 0,
    total_debit: 0,
    balance: 0,
  });

  const [currentWholesaler, setCurrentWholesaler] = useState({
    id: null,
    name: "",
    operator_id: null,
  });

  /* ================= AUTH ================= */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  /* ================= FETCH GLOBAL TOTALS ================= */
  const fetchGlobalTotals = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_network_totals");
    if (!error && data?.[0]) setGlobalTotals(data[0]);
  }, []);

  /* ================= FETCH ALL ================= */
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);

      const results = await Promise.all([
        supabase
          .from("wholesalers")
          .select("id, name, operator_id, user_id, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("operators").select("id, name"),
        supabase
          .from("wholesaler_transactions")
          .select("wholesaler_id, amount, type"),
      ]);

      const wh = results[0]?.data || [];
      const op = results[1]?.data || [];
      const tx = results[2]?.data || [];

      setOperators(op);

      const balances = {};
      tx.forEach((t) => {
        const b = balances[t.wholesaler_id] ??= { credit: 0, debit: 0 };
        t.type === "CREDIT"
          ? (b.credit += Number(t.amount))
          : (b.debit += Number(t.amount));
      });

      const enriched = wh.map((w) => {
        const b = balances[w.id] || { credit: 0, debit: 0 };
        return {
          ...w,
          total_credit: b.credit,
          total_debit: b.debit,
          balance: b.credit - b.debit,
          operator_name: op.find((o) => o.id === w.operator_id)?.name || "-",
        };
      });

      setWholesalers(enriched);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ================= REFRESH ================= */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    await fetchGlobalTotals();
  }, [fetchAll, fetchGlobalTotals]);

  /* ================= AUTO REFRESH ON FOCUS ================= */
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchAll();
        fetchGlobalTotals();
      }
    }, [user])
  );

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!currentWholesaler.name || !currentWholesaler.operator_id) {
      return Alert.alert("Erreur", "Tous les champs sont obligatoires");
    }

    setSaving(true);

    if (currentWholesaler.id) {
      await supabase
        .from("wholesalers")
        .update({
          name: currentWholesaler.name,
          operator_id: currentWholesaler.operator_id,
        })
        .eq("id", currentWholesaler.id);
    } else {
      await supabase.from("wholesalers").insert({
        name: currentWholesaler.name,
        operator_id: currentWholesaler.operator_id,
        user_id: user.id,
      });
    }

    setOpen(false);
    setSaving(false);
    setCurrentWholesaler({ id: null, name: "", operator_id: null });
    fetchAll();
    fetchGlobalTotals();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer ce fournisseur ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("wholesalers")
                .delete()
                .eq("id", id);

              if (error) throw error;

              fetchAll();
              fetchGlobalTotals();
              Alert.alert("Succès", "Fournisseur supprimé avec succès");
            } catch (err) {
              Alert.alert("Erreur", err.message || "Impossible de supprimer");
            }
          },
        },
      ]
    );
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }) => {
    const solde = (item.total_credit || 0) - (item.total_debit || 0);
    const isPositive = solde >= 0;

    return (
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text style={styles.operatorText}>
                Opérateur : {item.operator_name}
              </Text>
            </View>
            <View style={styles.actions}>
              <IconButton
                icon="eye-outline"
                size={22}
                onPress={() =>
                  navigation.navigate("WholesalerTransactions", {
                    wholesalerId: item.id,
                    wholesalerName: item.name,
                  })
                }
              />
              <IconButton
                icon="pencil-outline"
                size={22}
                onPress={() => {
                  setCurrentWholesaler({
                    id: item.id,
                    name: item.name,
                    operator_id: item.operator_id,
                  });
                  setOpen(true);
                }}
              />
              <IconButton
                icon="delete-outline"
                size={22}
                onPress={() => handleDelete(item.id)}
              />
            </View>
          </View>

          <View style={styles.amountRow}>
            <Text style={isPositive ? styles.positive : styles.negative}>
              {isPositive ? " VOUS DEVEZ " : "ON VOUS DOIT"} :{" "}
              {formatCFA(Math.abs(solde))}
            </Text>
            <IconButton
              icon={isPositive ? "arrow-up-bold" : "arrow-down-bold"}
              size={20}
              iconColor={isPositive ? theme.colors.success : theme.colors.error}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fournisseur & Soldes</Text>

      <Card style={styles.totalCard}>
  <Card.Content>
    <Text style={styles.totalLabel}>
      {globalTotals.balance >= 0 ? "ON VOUS DOIT" : "VOUS DEVEZ"}
    </Text>

    <Text
      style={{
        fontWeight: "bold",
        textAlign: "center",
        color:
          globalTotals.balance >= 0
            ? theme.colors.success
            : theme.colors.error,
      }}
    >
      {formatCFA(Math.abs(globalTotals.balance))}
    </Text>
  </Card.Content>
</Card>


      <FlatList
        data={wholesalers}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <Button
        mode="contained"
        style={{ marginTop: 10 }}
        onPress={() => {
          setCurrentWholesaler({ id: null, name: "", operator_id: null });
          setOpen(true);
        }}
      >
        Ajouter fournisseur
      </Button>

      <Portal>
        <Dialog
          visible={open}
          onDismiss={() => setOpen(false)}
          style={{ width: "80%", alignSelf: "center" }}
        >
          <Dialog.Title>
            {currentWholesaler.id
              ? "Modifier fournisseur"
              : "Ajouter fournisseur"}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom"
              value={currentWholesaler.name}
              onChangeText={(t) =>
                setCurrentWholesaler({ ...currentWholesaler, name: t })
              }
              style={{ marginBottom: 12 }}
            />
            <RNPickerSelect
              value={currentWholesaler.operator_id}
              onValueChange={(v) =>
                setCurrentWholesaler({ ...currentWholesaler, operator_id: v })
              }
              items={operators.map((o) => ({ label: o.name, value: o.id }))}
              style={{
                inputIOS: {
                  color: "#000",
                  padding: 12,
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  marginBottom: 12,
                },
                inputAndroid: {
                  color: "#000",
                  padding: 12,
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  marginBottom: 12,
                },
              }}
              useNativeAndroidPickerStyle={false}
              placeholder={{ label: "Sélectionner un opérateur", value: null }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>Annuler</Button>
            <Button loading={saving} onPress={handleSave}>
              Enregistrer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: theme.colors.onSurface,
  },
  card: {
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    width: "100%",
  },
  totalCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
  },
  totalLabel: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  operatorText: {
    opacity: 0.7,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  positive: {
    color: "#2e7d32",
    fontWeight: "700",
    fontSize: 15,
  },
  negative: {
    color: "#c62828",
    fontWeight: "700",
    fontSize: 15,
  },
});
