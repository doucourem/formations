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

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "kiosque",
    password: "",
  });

  const roles = [
    { label: "Kiosque", value: "kiosque" },
    { label: "Grossiste", value: "grossiste" },
    { label: "Admin", value: "admin" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!newRole) return;
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
      Alert.alert("Erreur", "Erreur lors du changement de rôle : " + error.message);
    } else {
      fetchUsers();
    }
  };

  const openForm = (user = null) => {
    setEditingUser(user);
    setFormData({
      email: user?.email || "",
      full_name: user?.full_name || "",
      role: user?.role || "kiosque",
      password: "",
    });
    setError(null);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.full_name || (!editingUser && !formData.password)) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (editingUser) {
      // Modification utilisateur
      const { error } = await supabase
        .from("users")
        .update({
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
        })
        .eq("id", editingUser.id);

      if (error) {
        Alert.alert("Erreur de mise à jour", error.message);
      } else {
        Alert.alert("Succès", "Utilisateur mis à jour.");
        setOpenDialog(false);
        fetchUsers();
      }
    } else {
      // Création utilisateur via Supabase Auth (frontend safe)
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.full_name, role: formData.role } },
        });

        if (error) {
          console.log("Signup error:", error);
          Alert.alert("Erreur", error.message);
        } else {
          console.log("Signup success:", data);
          Alert.alert(
            "Succès",
            "Utilisateur créé ! Vérifiez votre email pour confirmation."
          );
          setOpenDialog(false);
          fetchUsers();
        }
      } catch (err) {
        console.log(err);
        Alert.alert("Erreur", "Erreur de création : " + err.message);
      }
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <List.Item
          title={item.email}
          description={`Nom: ${item.full_name || "-"}\nInscrit le: ${
            item.created_at ? new Date(item.created_at).toLocaleString("fr-FR") : "-"
          }`}
          right={() => (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openForm(item)}>
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>
              <View style={styles.rolePicker}>
                <RNPickerSelect
                  onValueChange={(value) => handleRoleChange(item.id, value)}
                  items={roles}
                  value={item.role || roles[0].value}
                  style={pickerSelectStyles}
                />
              </View>
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Gestion des utilisateurs
        </Text>
        <Button mode="contained" onPress={() => openForm()} style={styles.addButton}>
          Ajouter un utilisateur
        </Button>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text>Chargement...</Text>
          </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Portal>
          <Dialog visible={openDialog} onDismiss={() => setOpenDialog(false)}>
            <Dialog.Title>{editingUser ? "Modifier utilisateur" : "Ajouter utilisateur"}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
              />
              {!editingUser && (
                <TextInput
                  label="Mot de passe"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  style={styles.input}
                />
              )}
              <TextInput
                label="Nom complet"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                style={styles.input}
              />
              <View style={styles.pickerContainer}>
                <Text>Rôle</Text>
                <RNPickerSelect
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  items={roles}
                  value={formData.role || roles[0].value}
                  style={pickerSelectStyles}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenDialog(false)}>Annuler</Button>
              <Button onPress={handleSubmit} mode="contained">
                {editingUser ? "Modifier" : "Créer"}
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
  title: { textAlign: "center", marginBottom: 20, fontWeight: "bold" },
  addButton: { marginBottom: 20 },
  loadingContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  errorText: { color: "red", textAlign: "center", marginBottom: 20 },
  card: { marginBottom: 12, elevation: 4 },
  actions: { flexDirection: "column", alignItems: "flex-end" },
  actionText: { color: "blue", marginBottom: 5 },
  rolePicker: { width: 120 },
  input: { marginBottom: 16 },
  pickerContainer: { marginBottom: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: "gray", borderRadius: 4, color: "black", paddingRight: 30, backgroundColor: "white" },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: "purple", borderRadius: 8, color: "black", paddingRight: 30, backgroundColor: "white" },
});
