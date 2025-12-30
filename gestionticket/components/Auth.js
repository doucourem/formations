import React, { useState } from "react";
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, TextInput, Button, Card, useTheme, ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../services/authApi";

export default function Auth() {
  const { loginUser } = useAuth();
  const theme = useTheme();

  // États
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Champs requis", "Veuillez remplir l'email et le mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password); // Appel API Laravel
      await loginUser(data.user, data.token);   // Update Context + Storage
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Échec de connexion", 
        err.response?.data?.message || "Identifiants incorrects ou problème réseau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={styles.card} elevation={4}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
              <Icon name="bus" size={40} color={theme.colors.primary} />
            </View>
            <Text variant="headlineMedium" style={styles.title}>
              Gestion Voyages
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Connectez-vous pour continuer
            </Text>
          </View>

          <Card.Content style={styles.content}>
            <TextInput
              label="Adresse Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" />}
              disabled={loading}
            />

            <TextInput
              label="Mot de passe"
              mode="outlined"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              disabled={loading}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon 
                  icon={secureText ? "eye-off" : "eye"} 
                  onPress={() => setSecureText(!secureText)} 
                />
              }
            />

            <Button
              mode="contained"
              onPress={signIn}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {loading ? "Connexion..." : "Se Connecter"}
            </Button>
          </Card.Content>
        </Card>
        
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  card: { 
    borderRadius: 20,
    paddingVertical: 10
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },
  title: { 
    fontWeight: "bold",
    textAlign: "center"
  },
  content: {
    marginTop: 10
  },
  input: { 
    marginBottom: 16 
  },
  button: { 
    marginTop: 10,
    borderRadius: 10 
  },
  buttonContent: {
    height: 48
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    
    opacity: 0.5,
    fontSize: 12
  }
});