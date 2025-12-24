import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Text,
  Card,
  List,
  useTheme,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";

/* ================= HELPERS ================= */

const formatCFA = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount || 0);

/* ================= COMPONENT ================= */

export default function WholesalersList() {
  const navigation = useNavigation();
  const theme = useTheme();

  const [user, setUser] = useState(null);
  const [wholesalers, setWholesalers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    operator_id: null,
  });

  /* ================= AUTH ================= */

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) Alert.alert("Erreur Auth", error.message);
      else setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  /* ================= FETCH ALL ================= */

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data: whData, error: whError } = await supabase
        .from("wholesalers")
        .select("id, name, operator_id, user_id, created_at")
        .order("created_at", { ascending: false });
      if (whError) throw whError;

      const { data: opData, error: opError } = await supabase
        .from("operators")
        .select("id, name");
      if (opError) throw opError;

      const { data: txData, error: txError } = await supabase
        .from("wholesaler_transactions")
        .select("wholesaler_id, amount, type");
      if (txError) throw txError;

      const balances = {};
      (txData || []).forEach((tx) => {
        if (!balances[tx.wholesaler_id]) {
          balances[tx.wholesaler_id] = { credit: 0, debit: 0 };
        }
        tx.type === "CREDIT"
          ? (balances[tx.wholesaler_id].credit += Number(tx.amount))
          : (balances[tx.wholesaler_id].debit += Number(tx.amount));
      });

      const enriched = (whData || []).map((wh) => {
        const bal = balances[wh.id] || { credit: 0, debit: 0 };
        return {
          ...wh,
          operator_name:
            (opData || []).find((op) => op.id === wh.operator_id)?.name || "-",
          manager_name: wh.user_id === user.id ? "Vous" : "-",
          total_credit: bal.credit,
          total_debit: bal.debit,
          balance: bal.credit - bal.debit,
        };
      });

      setWholesalers(enriched);
      setOperators(opData || []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CRUD ================= */

  const handleOpen = (wh = null) => {
    if (wh) {
      setFormData({
        id: wh.id,
        name: wh.name,
        operator_id: wh.operator_id,
      });
    } else {
      setFormData({ id: null, name: "", operator_id: null });
    }
    setError(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.operator_id) {
      setError("Nom et opérateur obligatoires");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        operator_id: formData.operator_id,
        user_id: user.id,
      };

      if (formData.id) {
        await supabase.from("wholesalers").update(payload).eq("id", formData.id);
      } else {
        await supabase.from("wholesalers").insert([payload]);
      }

      fetchAll();
      setOpen(false);
    } catch (err) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const deleteWholesaler = (id) => {
    Alert.alert("Confirmation", "Supprimer ce fournisseur ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("wholesalers").delete().eq("id", id);
          fetchAll();
        },
      },
    ]);
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <List.Item
          title={
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text
                style={{
                  color: item.balance >= 0 ? "#10b981" : "#EF4444",
                  fontWeight: "bold",
                  marginTop: 2,
                }}
              >
                Solde : {formatCFA(item.balance)}
              </Text>
            </View>
          }
          description={
            <Text style={{ color: theme.colors.onSurface }}>
              Opérateur : {item.operator_name}{"\n"}
              Manager : {item.manager_name}{"\n"}
              💰 Paiements : {formatCFA(item.total_credit)}{"\n"}
              📤 Demandes : {formatCFA(item.total_debit)}{"\n"}
              Créé le : {new Date(item.created_at).toLocaleString()}
            </Text>
          }
          left={() => (
            <List.Icon icon="truck" color={theme.colors.primary} />
          )}
          right={() => (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("WholesalerTransactions", {
                    wholesalerId: item.id,
                    wholesalerName: item.name,
                  })
                }
                style={[styles.actionButton, { backgroundColor: "#2563eb" }]}
              >
                <Text style={styles.actionText}>Transactions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpen(item)}
                style={[styles.actionButton, { backgroundColor: "#10b981" }]}
              >
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deleteWholesaler(item.id)}
                style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
              >
                <Text style={styles.actionText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  /* ================= UI ================= */

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
          Mes fournisseurs
        </Text>
        <Button mode="contained" icon="plus" onPress={() => handleOpen()}>
          Ajouter
        </Button>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={wholesalers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      {/* DIALOG */}
      <Portal>
        <Dialog
          visible={open}
          onDismiss={() => setOpen(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            {formData.id ? "Modifier" : "Ajouter"} un fournisseur
          </Dialog.Title>

          <Dialog.Content>
            {error && (
              <Text style={[styles.error, { marginBottom: 8 }]}>{error}</Text>
            )}

            <TextInput
              label="Nom"
              value={formData.name}
              onChangeText={(t) =>
                setFormData({ ...formData, name: t })
              }
              textColor={theme.colors.onSurface}
            />

            <RNPickerSelect
              value={formData.operator_id}
              onValueChange={(v) =>
                setFormData({ ...formData, operator_id: v })
              }
              items={operators.map((o) => ({
                label: o.name,
                value: o.id,
              }))}
              placeholder={{ label: "Choisir un opérateur", value: null }}
            />
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>Annuler</Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
            >
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
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  card: { marginBottom: 12, borderRadius: 12 },
  name: {
    color: "#F8FAFC",
    fontWeight: "bold",
    fontSize: 16,
  },
  actions: { alignItems: "flex-end" },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  error: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 12,
  },
});
