import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import supabase from "../supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Erreur de connexion", error.message);
      console.error("Erreur de connexion :", error.message);
    } else {
      Alert.alert("Succès", "✅ Connexion réussie !");
    }
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert("Erreur d'inscription", error.message);
      console.error("Erreur d'inscription :", error.message);
    } else {
      Alert.alert("Succès", "🎉 Compte créé ! Veuillez vérifier votre email pour confirmation.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, elevation: 8 }]}>
        <View style={styles.iconContainer}>
          <Icon
            name="account" // Vous pouvez choisir une autre icône comme "login" ou "account-arrow-right"
            size={60}
            color={theme.colors.primary}
          />
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
          outlineColor={theme.colors.onSurface}
          activeOutlineColor={theme.colors.primary}
        />
        <TextInput
          label="Mot de passe"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          outlineColor={theme.colors.onSurface}
          activeOutlineColor={theme.colors.primary}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={signIn}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.buttonLabel}
          >
            Se Connecter
          </Button>
          <Button
            mode="outlined"
            onPress={signUp}
            style={[styles.button, { borderColor: theme.colors.secondary }]}
            labelStyle={[styles.buttonLabel, { color: theme.colors.secondary }]}
          >
            S'inscrire
          </Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderRadius: 12,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#F8FAFC", // Couleur fixe ou `theme.colors.onSurface`
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  buttonLabel: {
    fontWeight: "600",
  },
});