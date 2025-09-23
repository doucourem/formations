import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  Text,
  Provider as PaperProvider,
  IconButton,
  Card,
  List,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";

export default function KiosksList() {
  const [kiosks, setKiosks] = useState([]);
  const [operators, setOperators] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [currentKiosk, setCurrentKiosk] = useState({
    id: null,
    name: "",
    location: "",
    operator_id: null,
    wholesaler_id: null,
    owner_id: "",
  });

  // Fetch data
  useEffect(() => {
    fetchKiosks();
    fetchOperators();
    fetchWholesalers();
  }, []);

  const fetchKiosks = async () => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name, location, operator_id, wholesaler_id, owner_id, created_at");
    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setKiosks(data);
    }
  };

  const fetchOperators = async () => {
    const { data, error } = await supabase.from("operators").select("*");
    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setOperators(data);
    }
  };

  const fetchWholesalers = async () => {
    const { data, error } = await supabase.from("wholesalers").select("*");
    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setWholesalers(data);
    }
  };

  // Delete kiosk
  const deleteKiosk = async (id) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer ce agent ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            const { error } = await supabase.from("kiosks").delete().eq("id", id);
            if (error) {
              Alert.alert("Erreur", error.message);
            } else {
              fetchKiosks();
            }
          },
        },
      ]
    );
  };

  const handleOpenPopup = (kiosk = null) => {
    if (kiosk) {
      setCurrentKiosk(kiosk);
    } else {
      setCurrentKiosk({
        id: null,
        name: "",
        location: "",
        operator_id: null,
        wholesaler_id: null,
        owner_id: "",
      });
    }
    setOpenPopup(true);
  };

  const handleClosePopup = () => setOpenPopup(false);

  const handleSaveKiosk = async () => {
    try {
      const { id, name, location, operator_id, wholesaler_id, owner_id } = currentKiosk;
      if (!name || !location) {
        Alert.alert("Avertissement", "Nom et lieu sont obligatoires");
        return;
      }

      if (id) {
        const { error } = await supabase
          .from("kiosks")
          .update({ name, location, operator_id, wholesaler_id, owner_id })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("kiosks").insert([
          { name, location, operator_id, wholesaler_id, owner_id },
        ]);
        if (error) throw error;
      }

      fetchKiosks();
      handleClosePopup();
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <List.Item
          title={item.name}
          description={`Lieu: ${item.location}`}
          left={() => <List.Icon icon="store" />}
          right={() => (
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                color="blue"
                size={20}
                onPress={() => handleOpenPopup(item)}
              />
              <IconButton
                icon="delete"
                color="red"
                size={20}
                onPress={() => deleteKiosk(item.id)}
              />
            </View>
          )}
        />
        <Text style={styles.text}>Opérateur: {operators.find((o) => o.id === item.operator_id)?.name || "-"}</Text>
        <Text style={styles.text}>Grossiste: {wholesalers.find((w) => w.id === item.wholesaler_id)?.name || "-"}</Text>
        <Text style={styles.text}>Propriétaire: {item.owner_id || "-"}</Text>
        <Text style={styles.text}>Créé le: {new Date(item.created_at).toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          agents
        </Text>
        <Button
          mode="contained"
          onPress={() => handleOpenPopup()}
          style={styles.addButton}
          icon="plus"
        >
          Ajouter un agent
        </Button>

        <FlatList
          data={kiosks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={styles.list}
        />

        <Portal>
          <Dialog visible={openPopup} onDismiss={handleClosePopup}>
            <Dialog.Title>
              {currentKiosk.id ? "Modifier agent" : "Ajouter agent"}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nom"
                value={currentKiosk.name}
                onChangeText={(text) =>
                  setCurrentKiosk({ ...currentKiosk, name: text })
                }
                style={styles.input}
              />
              <TextInput
                label="Lieu"
                value={currentKiosk.location}
                onChangeText={(text) =>
                  setCurrentKiosk({ ...currentKiosk, location: text })
                }
                style={styles.input}
              />

              {/* Sélecteur Opérateur */}
              <View style={styles.input}>
                <Text>Opérateur</Text>
                <RNPickerSelect
                  onValueChange={(value) =>
                    setCurrentKiosk({ ...currentKiosk, operator_id: value })
                  }
                  items={operators.map((o) => ({
                    label: o.name,
                    value: o.id,
                  }))}
                  value={currentKiosk.operator_id}
                  placeholder={{ label: "Sélectionner un opérateur...", value: null }}
                />
              </View>

              {/* Sélecteur Grossiste */}
              <View style={styles.input}>
                <Text>Grossiste</Text>
                <RNPickerSelect
                  onValueChange={(value) =>
                    setCurrentKiosk({ ...currentKiosk, wholesaler_id: value })
                  }
                  items={wholesalers.map((w) => ({
                    label: w.name,
                    value: w.id,
                  }))}
                  value={currentKiosk.wholesaler_id}
                  placeholder={{ label: "Sélectionner un grossiste...", value: null }}
                />
              </View>

              <TextInput
                label="Propriétaire"
                value={currentKiosk.owner_id || ""}
                onChangeText={(text) =>
                  setCurrentKiosk({ ...currentKiosk, owner_id: text })
                }
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleClosePopup}>Annuler</Button>
              <Button onPress={handleSaveKiosk} mode="contained">
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  addButton: {
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    elevation: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginTop: 4,
    marginLeft: 64,
  },
  input: {
    marginBottom: 16,
  },
});
