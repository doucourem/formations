import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet
} from "react-native";
import supabase from "../supabaseClient";
import { MD3DarkTheme } from "react-native-paper";

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4F46E5",
    background: "#111827",
    surface: "#1F2937",
    onSurface: "#FCFBF8",
    textInputBorder: "#374151",
  },
};

export default function ChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!password || !confirm) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      Alert.alert("Succès", "Mot de passe modifié avec succès !");
      setPassword("");
      setConfirm("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le mot de passe</Text>

      <Text style={styles.label}>Nouveau mot de passe</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholder="********"
        placeholderTextColor="#6B7280"
      />

      <Text style={styles.label}>Confirmer le mot de passe</Text>
      <TextInput
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        style={styles.input}
        placeholder="********"
        placeholderTextColor="#6B7280"
      />

      <TouchableOpacity
        onPress={handleChangePassword}
        disabled={loading}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Mettre à jour</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// === STYLES AVEC TON THÈME ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 25,
  },
  label: {
    color: theme.colors.onSurface,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textInputBorder,
    backgroundColor: theme.colors.surface,
    color: theme.colors.onSurface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
