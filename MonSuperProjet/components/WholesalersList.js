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
  useTheme,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";

export default function WholesalersList() {
  const navigation = useNavigation();
  const theme = useTheme();

  const [currentUser, setCurrentUser] = useState(null);
  const [wholesalers, setWholesalers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    operator_id: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
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

      const enrichedWholesalers = (whData || []).map((wh) => ({
        ...wh,
        operator_name: (opData || []).find((op) => op.id === wh.operator_id)?.name || "-",
        manager_name: wh.user_id === currentUser?.id ? "Vous" : "-", // afficher "Vous" si c'est l'utilisateur connecté
      }));

      setWholesalers(enrichedWholesalers);
      setOperators(opData || []);
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
      });
    } else {
      setFormData({ id: null, name: "", operator_id: null });
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
      const payload = {
        name: formData.name,
        operator_id: formData.operator_id,
        user_id: currentUser?.id, // manager = utilisateur connecté
      };

      if (formData.id) {
        const { error: updateError } = await supabase
          .from("wholesalers")
          .update(payload)
          .eq("id", formData.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("wholesalers")
          .insert([payload]);
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
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <List.Item
          title={<Text style={{ color: theme.colors.onSurface }}>{item.name}</Text>}
          description={
            <Text style={{ color: theme.colors.onSurface }}>
              Opérateur: {item.operator_name || "-"}{"\n"}
              Manager: {item.manager_name || "-"}{"\n"}
              Créé le: {new Date(item.created_at).toLocaleString()}
            </Text>
          }
          left={() => <List.Icon icon="truck" color={theme.colors.primary} />}
          right={() => (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handleOpen(item)}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("WholesalerTransactions", {
                    wholesalerId: item.id,
                    wholesalerName: item.name,
                  })
                }
                style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
              >
                <Text style={styles.actionText}>Voir transactions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteWholesaler(item.id)}
                style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
              >
                <Text style={styles.actionText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
            Grossistes
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => handleOpen()}
            buttonColor={theme.colors.primary}
          >
            Ajouter
          </Button>
        </View>

        {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={wholesalers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Portal>
          <Dialog visible={open} onDismiss={handleClose} style={{ backgroundColor: theme.colors.surface }}>
            <Dialog.Title style={{ color: theme.colors.onSurface }}>
              {formData.id ? "Modifier un grossiste" : "Ajouter un grossiste"}
            </Dialog.Title>
            <Dialog.Content>
              {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
              <TextInput
                label="Nom"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
                textColor={theme.colors.onSurface}
              />
              <View style={styles.pickerContainer}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Opérateur</Text>
                <RNPickerSelect
                  onValueChange={(value) => setFormData({ ...formData, operator_id: value })}
                  items={operators.map((o) => ({ label: o.name, value: o.id }))}
                  value={formData.operator_id}
                  style={{
                    inputIOS: { ...pickerSelectStyles.inputIOS, color: theme.colors.onSurface, backgroundColor: theme.colors.background },
                    inputAndroid: { ...pickerSelectStyles.inputAndroid, color: theme.colors.onSurface, backgroundColor: theme.colors.background },
                  }}
                  placeholder={{ label: "Sélectionner un opérateur...", value: null }}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleClose}>Annuler</Button>
              <Button mode="contained" onPress={handleSave} loading={saving} buttonColor={theme.colors.primary}>
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
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  card: { marginBottom: 12, elevation: 4 },
  actions: { flexDirection: "column", alignItems: "flex-end", justifyContent: "center" },
  actionButton: { padding: 8, borderRadius: 5, marginBottom: 4 },
  actionText: { color: "white", fontSize: 12 },
  errorText: { textAlign: "center", marginBottom: 20 },
  input: { marginBottom: 16 },
  pickerContainer: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 4, paddingRight: 30 },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: 'purple', borderRadius: 8, paddingRight: 30 },
});
