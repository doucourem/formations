import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button, Card, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../services/authApi";

export default function Auth() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();

  const signIn = async () => {
    try {
      const data = await login(email, password); // Laravel API
      await loginUser(data.user, data.token);   // Met à jour le contexte et AsyncStorage
    } catch (err) {
      Alert.alert("Erreur", err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, elevation: 8 }]}>
        <View style={styles.iconContainer}>
          <Icon name="account" size={60} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Bienvenue</Text>

        <TextInput
          label="Adresse Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          label="Mot de passe"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Button mode="contained" onPress={signIn} style={[styles.button, { backgroundColor: theme.colors.primary }]} labelStyle={styles.buttonLabel}>
          Se Connecter
        </Button>
      </Card>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  card: { padding: 24, width: "100%", maxWidth: 400, borderRadius: 12 },
  iconContainer: { alignItems: "center", marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "600", textAlign: "center", marginBottom: 20, color: "#F8FAFC" },
  input: { marginBottom: 16 },
  button: { borderRadius: 12 },
  buttonLabel: { fontWeight: "600" },
});
