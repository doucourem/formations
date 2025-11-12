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

export default function UsersList() {
  const theme = useTheme();
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
    { label: "Couriser", value: "kiosque" },
    { label: "Vendeur", value: "grossiste" },
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

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!newRole) return;
    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", id);
      if (error) throw error;
      fetchUsers();
    } catch (err) {
      Alert.alert("Erreur", err.message);
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

  const resetPassword = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
  }

  try {
    const { error } = await supabase.rpc("reset_user_password", {
      user_uuid: userId,
      new_password: newPassword,
    });

    if (error) throw error;

    Alert.alert("Succès", "Mot de passe mis à jour !");
  } catch (err) {
    Alert.alert("Erreur", err.message);
  }
};

  const handleSubmit = async () => {
    if (!formData.email || !formData.full_name || (!editingUser && !formData.password)) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const emailTrimmed = formData.email.trim().toLowerCase();

    try {

    
      if (editingUser) {

        console.log(editingUser);

        // 🔧 Correction : éviter le double `.select()`
        const { error } = await supabase
          .from("users")
          .update({
            email: emailTrimmed,
            full_name: formData.full_name,
            role: formData.role,
          })
          .eq("id", editingUser.id);
  console.log(editingUser);
        if (error) throw error;

          if ( formData.password) {
  await resetPassword(editingUser.id, formData.password);
}
        Alert.alert("Succès", "Utilisateur mis à jour.");
        setOpenDialog(false);
        fetchUsers();
      } else {
        // 🔧 Création d’un nouvel utilisateur
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: emailTrimmed,
          password: formData.password,
        });

        if (signUpError) throw signUpError;
        const userId = authData?.user?.id;
        if (!userId) throw new Error("Impossible de récupérer l'ID de l'utilisateur.");

        // Insertion dans table users
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: userId,
            email: emailTrimmed,
            full_name: formData.full_name,
            role: formData.role,
            is_active: true,
          },
        ]);

        if (insertError) throw insertError;

        Alert.alert("Succès", "Utilisateur créé avec succès !");
        setOpenDialog(false);
        fetchUsers();
      }
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <List.Item
          title={<Text style={{ color: theme.colors.onSurface }}>{item.email}</Text>}
          description={`Nom: ${item.full_name || "-"}\nInscrit le: ${
            item.created_at ? new Date(item.created_at).toLocaleString("fr-FR") : "-"
          }`}
          right={() => (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openForm(item)}>
                <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                  Modifier
                </Text>
              </TouchableOpacity>
              <View style={styles.rolePicker}>
                <RNPickerSelect
                  onValueChange={(value) => handleRoleChange(item.id, value)}
                  items={roles}
                  value={item.role}
                  style={{
                    inputIOS: {
                      ...pickerSelectStyles.inputIOS,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.onSurface,
                    },
                    inputAndroid: {
                      ...pickerSelectStyles.inputAndroid,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.onSurface,
                    },
                  }}
                />
              </View>
            </View>
          )}
        />
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Gestion des utilisateurs
        </Text>

        <Button
          mode="contained"
          onPress={() => openForm()}
          style={styles.addButton}
          buttonColor={theme.colors.primary}
        >
          Ajouter un utilisateur
        </Button>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.onSurface }}>Chargement...</Text>
          </View>
        ) : error ? (
          <Text style={{ color: theme.colors.error, textAlign: "center", marginBottom: 20 }}>
            {error}
          </Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Portal>
          <Dialog visible={openDialog} onDismiss={() => setOpenDialog(false)}>
            <Dialog.Title>
              {editingUser ? "Modifier utilisateur" : "Ajouter utilisateur"}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
                textColor={theme.colors.onSurface}
              />
              
                <TextInput
                  label="Mot de passe"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  style={styles.input}
                  textColor={theme.colors.onSurface}
                />
             
              <TextInput
                label="Nom complet"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                style={styles.input}
                textColor={theme.colors.onSurface}
              />
              <View style={styles.pickerContainer}>
                <Text style={{ color: theme.colors.onSurface }}>Rôle</Text>
                <RNPickerSelect
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  items={roles}
                  value={formData.role}
                  style={{
                    inputIOS: {
                      ...pickerSelectStyles.inputIOS,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.onSurface,
                    },
                    inputAndroid: {
                      ...pickerSelectStyles.inputAndroid,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.onSurface,
                    },
                  }}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenDialog(false)}>Annuler</Button>
              <Button onPress={handleSubmit} mode="contained" buttonColor={theme.colors.primary}>
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
  container: { flex: 1, padding: 16 },
  title: { textAlign: "center", marginBottom: 20, fontWeight: "bold" },
  addButton: { marginBottom: 20 },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  card: { marginBottom: 12, elevation: 4 },
  actions: { flexDirection: "column", alignItems: "flex-end" },
  actionText: { marginBottom: 5 },
  rolePicker: { width: 120 },
  input: { marginBottom: 16 },
  pickerContainer: { marginBottom: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 8,
    paddingRight: 30,
  },
});
