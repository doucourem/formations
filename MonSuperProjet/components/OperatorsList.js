import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Text,
  Card,
  List,
  useTheme, // Utilisation du thème global
} from "react-native-paper";

export default function OperatorsList() {
  const { colors } = useTheme(); // RÉCUPÉRATION DU THÈME GLOBAL
  const [operators, setOperators] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOperators();

    const channel = supabase
      .channel("operators-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operators" },
        (payload) => {
          const op = payload.new;
          const oldOp = payload.old;

          setOperators((prev) => {
            switch (payload.eventType) {
              case "INSERT":
                if (!prev.some((o) => o.id === op.id)) return [...prev, op];
                return prev;
              case "UPDATE":
                return prev.map((o) => (o.id === op.id ? op : o));
              case "DELETE":
                return prev.filter((o) => o.id !== oldOp.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOperators = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("operators").select("*");
    setLoading(false);
    if (error) setError("Erreur lors du chargement : " + error.message);
    else setOperators(data);
  };

  const deleteOperator = async (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cet opérateur ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase.from("operators").delete().eq("id", id);
              if (error) throw error;
              fetchOperators();
            } catch (err) {
              setError("Erreur : " + err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleOpen = (operator = null) => {
    if (operator) {
      setEditId(operator.id);
      setName(operator.name);
    } else {
      setEditId(null);
      setName("");
    }
    setError(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name) {
      setError("Le nom est obligatoire.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const userId = user.id;
      let queryError;

      if (editId) {
        const { error } = await supabase
          .from("operators")
          .update({ name, user_id: userId })
          .eq("id", editId);
        queryError = error;
      } else {
        const { error } = await supabase
          .from("operators")
          .insert([{ name, user_id: userId }]);
        queryError = error;
      }

      if (queryError) throw queryError;

      setOpen(false);
      fetchOperators();
    } catch (err) {
      setError("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDateFr = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={1}>
      <Card.Content>
        <List.Item
          title={item.name}
          titleStyle={{ color: colors.onSurface, fontWeight: 'bold' }}
          description={`Créé le: ${formatDateFr(item.created_at)}`}
          descriptionStyle={{ color: colors.onSurfaceVariant }}
          left={() => <List.Icon icon="account-tie" color={colors.primary} />}
          right={() => (
            <View style={styles.actions}>
              <Button
                mode="text"
                onPress={() => handleOpen(item)}
                icon="pencil"
                textColor={colors.primary}
              >
                Modifier
              </Button>
              <Button
                mode="text"
                onPress={() => deleteOperator(item.id)}
                icon="delete"
                textColor={colors.error}
              >
                Supprimer
              </Button>
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: colors.onSurface, fontWeight: '900' }}>
          Opérateurs
        </Text>
        <Button
          mode="contained"
          onPress={() => handleOpen()}
          icon="plus"
          buttonColor={colors.primary}
        >
          Ajouter
        </Button>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ marginLeft: 10, color: colors.onSurfaceVariant }}>Mise à jour...</Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.error + '10' }]}>
          <Text style={{ color: colors.error, textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      <FlatList
        data={operators}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)} style={{ backgroundColor: colors.surface }}>
          <Dialog.Title style={{ color: colors.onSurface, fontWeight: 'bold' }}>
            {editId ? "Modifier l'opérateur" : "Nouvel opérateur"}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom de l'opérateur"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
            />
            {error && <Text style={{ color: colors.error, marginTop: 8 }}>{error}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)} textColor={colors.onSurfaceVariant}>Annuler</Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              buttonColor={colors.primary}
            >
              Enregistrer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8
  },
  card: { marginBottom: 12, borderRadius: 12 },
  actions: { justifyContent: "center" },
  input: { backgroundColor: '#FFF' },
  loadingContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
});

