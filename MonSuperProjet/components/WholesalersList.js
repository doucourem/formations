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
  Provider as PaperProvider,
  Card,
  List,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";

export default function WholesalersList() {
  const navigation = useNavigation(); // ✅ ajout navigation
  const [wholesalers, setWholesalers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    operator_id: null,
    manager_id: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
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

      const { data: mgData, error: mgError } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("role", "grossiste");
      if (mgError) throw mgError;

      const enrichedWholesalers = (whData || []).map(wh => ({
        ...wh,
        operator_name: (opData || []).find(op => op.id === wh.operator_id)?.name || "-",
        manager_name: (mgData || []).find(mg => mg.id === wh.user_id)?.full_name || "-",
      }));

      setWholesalers(enrichedWholesalers);
      setOperators(opData || []);
      setManagers(mgData || []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (wholesaler = null) => {
    if (wholesaler) {
      setFormData({
        id: wholesaler.id,
        name: wholesaler.name || "",
        operator_id: wholesaler.operator_id || null,
        manager_id: wholesaler.user_id || null,
      });
    } else {
      setFormData({ id: null, name: "", operator_id: null, manager_id: null });
    }
    setError(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!formData.name || !formData.operator_id) {
      setError("Nom et Opérateur sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (formData.id) {
        const { error: updateError } = await supabase
          .from("wholesalers")
          .update({
            name: formData.name,
            operator_id: formData.operator_id,
            user_id: formData.manager_id,
          })
          .eq("id", formData.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("wholesalers")
          .insert([
            {
              name: formData.name,
              operator_id: formData.operator_id,
              user_id: formData.manager_id,
            },
          ]);
        if (insertError) throw insertError;
      }
      fetchAll();
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const deleteWholesaler = (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer ce grossiste ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              const { error } = await supabase.from("wholesalers").delete().eq("id", id);
              if (error) throw error;
              fetchAll();
            } catch (err) {
              console.error(err);
              setError("Erreur lors de la suppression");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <List.Item
          title={item.name}
          description={`Opérateur: ${item.operator_name || "-"}\nManager: ${item.manager_name || "-"}\nCréé le: ${new Date(item.created_at).toLocaleString()}`}
          left={() => <List.Icon icon="truck" />}
          right={() => (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleOpen(item)} style={styles.actionButton}>
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("WholesalerTransactions", {
                  wholesalerId: item.id,
                  wholesalerName: item.name,
                })}
                style={[styles.actionButton, styles.transactionsButton]}
              >
                <Text style={styles.actionText}>Voir transactions</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteWholesaler(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                <Text style={styles.actionText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Grossistes</Text>
          <Button mode="contained" icon="plus" onPress={() => handleOpen()}>
            Ajouter
          </Button>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={wholesalers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Portal>
          <Dialog visible={open} onDismiss={handleClose}>
            <Dialog.Title>{formData.id ? "Modifier un grossiste" : "Ajouter un grossiste"}</Dialog.Title>
            <Dialog.Content>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <TextInput
                label="Nom"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Opérateur</Text>
                <RNPickerSelect
                  onValueChange={(value) => setFormData({ ...formData, operator_id: value })}
                  items={operators.map((o) => ({ label: o.name, value: o.id }))}
                  value={formData.operator_id}
                  style={pickerSelectStyles}
                  placeholder={{ label: "Sélectionner un opérateur...", value: null }}
                />
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Manager</Text>
                <RNPickerSelect
                  onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                  items={managers.map((m) => ({ label: m.full_name, value: m.id }))}
                  value={formData.manager_id}
                  style={pickerSelectStyles}
                  placeholder={{ label: "Sélectionner un manager...", value: null }}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleClose}>Annuler</Button>
              <Button mode="contained" onPress={handleSave} loading={saving}>
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
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  card: { marginBottom: 12, elevation: 4 },
  actions: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' },
  actionButton: { padding: 8, borderRadius: 5, marginBottom: 4, backgroundColor: 'blue' },
  transactionsButton: { backgroundColor: 'orange' },
  deleteButton: { backgroundColor: 'red' },
  actionText: { color: 'white', fontSize: 12 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 16 },
  pickerContainer: { marginBottom: 16 },
  label: { fontSize: 16, color: "#555", marginBottom: 8 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16, paddingVertical: 12, paddingHorizontal: 10,
    borderWidth: 1, borderColor: 'gray', borderRadius: 4, color: 'black',
    paddingRight: 30, backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 16, paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 0.5, borderColor: 'purple', borderRadius: 8, color: 'black',
    paddingRight: 30, backgroundColor: 'white',
  },
});
