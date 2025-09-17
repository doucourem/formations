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
} from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OperatorsList() {
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
    if (error) {
      console.error("Erreur lors du chargement :", error.message);
      setError("Erreur lors du chargement : " + error.message);
    } else setOperators(data);
  };

  const deleteOperator = (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cet opérateur ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
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
    <Card style={styles.card}>
      <Card.Content>
        <List.Item
          title={item.name}
          description={`Code: ${item.code}\nCréé le: ${formatDateFr(item.created_at)}`}
          left={() => <List.Icon icon="account-tie" />}
          right={() => (
            <View style={styles.actions}>
              <Button
                mode="text"
                onPress={() => handleOpen(item)}
                icon="pencil"
                compact
              >
                Modifier
              </Button>
              <Button
                mode="text"
                onPress={() => deleteOperator(item.id)}
                icon="delete"
                compact
                color="red"
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
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Gestion des Fournisseurs</Text>
          <Button
            mode="contained"
            onPress={() => handleOpen()}
            icon="plus"
          >
            Ajouter
          </Button>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
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
          <Dialog visible={open} onDismiss={() => setOpen(false)}>
            <Dialog.Title>{editId ? "Modifier l'opérateur" : "Ajouter un opérateur"}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nom"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                label="Code"
                value={code}
                onChangeText={setCode}
                style={styles.input}
              />
              {error && <Text style={styles.dialogErrorText}>{error}</Text>}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpen(false)}>Annuler</Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
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
    backgroundColor: "#f5f5f5",
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
    color: '#555',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffdddd',
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#d8000c',
    textAlign: 'center',
  },
  dialogErrorText: {
    color: '#d8000c',
    marginTop: 10,
    textAlign: 'center',
  },
});