import React, { useEffect, useState, useCallback } from "react";
import supabase from "../supabaseClient";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Portal,
  Dialog,
  TextInput,
  IconButton,
  useTheme, // On utilise le hook ici
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const formatCFA = (amount = 0) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);

export default function WholesalersList() {
  const navigation = useNavigation();
  const { colors } = useTheme(); // RÉCUPÉRATION DU THÈME GLOBAL

  const [user, setUser] = useState(null);
  const [wholesalers, setWholesalers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [globalTotals, setGlobalTotals] = useState({ balance: 0 });

  const [currentWholesaler, setCurrentWholesaler] = useState({
    id: null,
    name: "",
    operator_id: null,
  });

  /* ================= FETCH DATA ================= */
  const fetchGlobalTotals = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_network_totals");
    if (!error && data?.[0]) setGlobalTotals(data[0]);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [whRes, opRes, txRes] = await Promise.all([
        supabase.from("wholesalers").select("*").order("name"),
        supabase.from("operators").select("id, name"),
        supabase.from("wholesaler_transactions").select("wholesaler_id, amount, type"),
      ]);

      const ops = opRes.data || [];
      const txs = txRes.data || [];
      setOperators(ops);

      const balances = {};
      txs.forEach((t) => {
        const b = balances[t.wholesaler_id] ??= { credit: 0, debit: 0 };
        t.type === "CREDIT" ? (b.credit += Number(t.amount)) : (b.debit += Number(t.amount));
      });

      const enriched = (whRes.data || []).map((w) => {
        const b = balances[w.id] || { credit: 0, debit: 0 };
        return {
          ...w,
          balance: b.credit - b.debit,
          operator_name: ops.find((o) => o.id === w.operator_id)?.name || "-",
        };
      });

      setWholesalers(enriched);
    } catch (err) {
      Alert.alert("Erreur", "Chargement impossible");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          fetchAll();
          fetchGlobalTotals();
        }
      });
    }, [fetchAll, fetchGlobalTotals])
  );

  /* ================= ACTIONS ================= */
  const handleSave = async () => {
    if (!currentWholesaler.name || !currentWholesaler.operator_id) {
      return Alert.alert("Erreur", "Champs obligatoires manquants");
    }
    setSaving(true);
    const payload = { name: currentWholesaler.name, operator_id: currentWholesaler.operator_id };
    
    if (currentWholesaler.id) {
      await supabase.from("wholesalers").update(payload).eq("id", currentWholesaler.id);
    } else {
      await supabase.from("wholesalers").insert({ ...payload, user_id: user.id });
    }

    setOpen(false);
    setSaving(false);
    fetchAll();
    fetchGlobalTotals();
  };

  const handleDelete = (id) => {
    Alert.alert("Supprimer", "Confirmer la suppression ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("wholesalers").delete().eq("id", id);
          fetchAll();
          fetchGlobalTotals();
        },
      },
    ]);
  };

  /* ================= RENDER ================= */
  const renderItem = ({ item }) => {
    const isPositive = item.balance >= 0;
    return (
      <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={1}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={[styles.wholesalerName, { color: colors.onSurface }]}>{item.name}</Text>
              <Text style={styles.operatorTag}>🌐 {item.operator_name}</Text>
            </View>
            <View style={styles.actions}>
              <IconButton icon="history" size={20} iconColor={colors.primary} onPress={() => navigation.navigate("WholesalerTransactions", { wholesalerId: item.id, wholesalerName: item.name })} />
              <IconButton icon="pencil-outline" size={20} iconColor={colors.onSurfaceVariant} onPress={() => { setCurrentWholesaler(item); setOpen(true); }} />
              <IconButton icon="delete-outline" iconColor={colors.error} size={20} onPress={() => handleDelete(item.id)} />
            </View>
          </View>

          {/* Utilisation dynamique des couleurs du thème global */}
          <View style={[styles.balanceBox, { backgroundColor: isPositive ? colors.success + '15' : colors.error + '15' }]}>
            <Text style={[styles.balanceLabel, { color: isPositive ? colors.success : colors.error }]}>
              {isPositive ? "VOUS DEVEZ" : "IL VOUS DOIT"}
            </Text>
            <Text style={[styles.balanceValue, { color: isPositive ? colors.success : colors.error }]}>
              {formatCFA(Math.abs(item.balance))}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.background }} size="large" color={colors.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <Text style={[styles.mainTitle, { color: colors.onSurface }]}>Fournisseurs & Stocks</Text>

      <Card style={[styles.totalCard, { borderLeftColor: colors.primary }]} elevation={2}>
        <Card.Content>
          <Text style={styles.totalLabel}>SOLDE GLOBAL RÉSEAU</Text>
          <Text style={[styles.totalValue, { color: globalTotals.balance >= 0 ? colors.success : colors.error }]}>
            {formatCFA(Math.abs(globalTotals.balance))}
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={wholesalers}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        onRefresh={fetchAll}
        refreshing={refreshing}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Button 
        mode="contained" 
        icon="plus"
        style={styles.fab}
        onPress={() => { setCurrentWholesaler({ id: null, name: "", operator_id: null }); setOpen(true); }}
      >
        Nouveau Fournisseur
      </Button>

      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)} style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <Dialog.Title>
            {currentWholesaler.id ? "Modifier" : "Ajouter"}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom du fournisseur"
              value={currentWholesaler.name}
              onChangeText={(t) => setCurrentWholesaler({ ...currentWholesaler, name: t })}
              mode="outlined"
              style={styles.input}
            />
            <View style={[styles.pickerContainer, { borderColor: colors.outline }]}>
              <RNPickerSelect
                value={currentWholesaler.operator_id}
                onValueChange={(v) => setCurrentWholesaler({ ...currentWholesaler, operator_id: v })}
                items={operators.map((o) => ({ label: o.name, value: o.id }))}
                placeholder={{ label: "Choisir un opérateur...", value: null }}
                style={pickerStyles}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)} textColor={colors.onSurfaceVariant}>Annuler</Button>
            <Button loading={saving} mode="contained" onPress={handleSave}>Enregistrer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  mainTitle: { fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 20 },
  totalCard: { 
    marginBottom: 20, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 20, 
    borderLeftWidth: 6 
  },
  totalLabel: { color: "#636366", textAlign: "center", fontWeight: "bold", fontSize: 12 },
  totalValue: { textAlign: "center", fontSize: 24, fontWeight: "900", marginTop: 5 },
  card: { marginBottom: 12, borderRadius: 16 },
  headerRow: { flexDirection: "row", alignItems: "flex-start" },
  wholesalerName: { fontWeight: "bold" },
  operatorTag: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  actions: { flexDirection: "row" },
  balanceBox: { 
    marginTop: 15, 
    padding: 12, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  balanceLabel: { fontSize: 11, fontWeight: "bold" },
  balanceValue: { fontSize: 16, fontWeight: "900" },
  fab: { position: 'absolute', bottom: 20, left: 16, right: 16, borderRadius: 12, paddingVertical: 5 },
  dialog: { borderRadius: 24 },
  input: { marginBottom: 15 },
  pickerContainer: { 
    borderWidth: 1, 
    borderRadius: 8, 
    backgroundColor: "#F9F9F9", 
    overflow: 'hidden' 
  }
});

const pickerStyles = {
  inputIOS: { padding: 12, color: "#000" },
  inputAndroid: { padding: 12, color: "#000" }
};