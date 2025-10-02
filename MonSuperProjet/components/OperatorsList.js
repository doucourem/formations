import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
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

export default function OperatorsList() {
  const theme = useTheme();
  const [operators, setOperators] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
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

  const deleteOperator = (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cet opérateur ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            setLoading(true);
            setError(null);
            const { error: deleteError } = await supabase.from("operators").delete().eq("id", id);
            setLoading(false);
            if (deleteError) setError("Erreur lors de la suppression : " + deleteError.message);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpen = (operator = null) => {
    if (operator) {
      setEditId(operator.id);
      setName(operator.name);
      setCode(operator.code);
    } else {
      setEditId(null);
      setName("");
      setCode("");
    }
    setError(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name || !code) {
      setError("Nom et code sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);
    let queryError;

    if (editId) {
      const { error: updateError } = await supabase
        .from("operators")
        .update({ name, code })
        .eq("id", editId);
      queryError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("operators")
        .insert([{ name, code }]);
      queryError = insertError;
    }

    setSaving(false);
    if (queryError) {
      setError("Erreur lors de l'enregistrement : " + queryError.message);
    } else {
      setOpen(false);
      setEditId(null);
      setName("");
      setCode("");
    }
  };

  const formatDateFr = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <List.Item
          title={<Text style={{ color: theme.colors.onSurface }}>{item.name}</Text>}
          description={
            <Text style={{ color: theme.colors.onSurface }}>
              Code: {item.code}{"\n"}Créé le: {formatDateFr(item.created_at)}
            </Text>
          }
          left={() => <List.Icon icon="account-tie" color={theme.colors.primary} />}
          right={() => (
            <View style={styles.actions}>
              <Button
                mode="text"
                onPress={() => handleOpen(item)}
                icon="pencil"
                compact
                textColor={theme.colors.primary}
              >
                Modifier
              </Button>
              <Button
                mode="text"
                onPress={() => deleteOperator(item.id)}
                icon="delete"
                compact
                textColor={theme.colors.error}
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
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
            Gestion des opérateurs
          </Text>
          <Button
            mode="contained"
            onPress={() => handleOpen()}
            icon="plus"
            buttonColor={theme.colors.primary}
          >
            Ajouter
          </Button>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Chargement...
            </Text>
          </View>
        )}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        )}

        <FlatList
          data={operators}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Portal>
          <Dialog visible={open} onDismiss={() => setOpen(false)} style={{ backgroundColor: theme.colors.surface }}>
            <Dialog.Title style={{ color: theme.colors.onSurface }}>
              {editId ? "Modifier l'opérateur" : "Ajouter un opérateur"}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nom"
                value={name}
                onChangeText={setName}
                style={styles.input}
                textColor={theme.colors.onSurface}
              />
              <TextInput
                label="Code"
                value={code}
                onChangeText={setCode}
                style={styles.input}
                textColor={theme.colors.onSurface}
              />
              {error && <Text style={[styles.dialogErrorText, { color: theme.colors.error }]}>{error}</Text>}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpen(false)}>Annuler</Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                buttonColor={theme.colors.primary}
              >
                {editId ? "Enregistrer" : "Créer"}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  list: {
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
    elevation: 4,
  },
  actions: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  input: {
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    textAlign: 'center',
  },
  dialogErrorText: {
    marginTop: 10,
    textAlign: 'center',
  },
});
