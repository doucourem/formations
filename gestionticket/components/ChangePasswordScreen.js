import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { 
  Text, 
  TextInput, 
  Button, 
  useTheme, 
  Surface, 
  Avatar 
} from "react-native-paper";
import supabase from "../supabaseClient";

export default function ChangePasswordScreen() {
  const theme = useTheme();

  // États
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    // Validations
    if (!password || !confirm) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Sécurité", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;

      Alert.alert("Succès", "Votre mot de passe a été mis à jour avec succès !");
      setPassword("");
      setConfirm("");
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue lors de la mise à jour.");
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
        
        <View style={styles.header}>
          <Avatar.Icon 
            size={80} 
            icon="lock-reset" 
            style={{ backgroundColor: theme.colors.primaryContainer }}
            color={theme.colors.primary}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Sécurité du compte
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Choisissez un mot de passe robuste pour protéger vos accès.
          </Text>
        </View>

        <Surface style={styles.formCard} elevation={1}>
          <TextInput
            label="Nouveau mot de passe"
            mode="outlined"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Min. 6 caractères"
            disabled={loading}
            left={<TextInput.Icon icon="key-variant" />}
            right={
              <TextInput.Icon 
                icon={showPass ? "eye-off" : "eye"} 
                onPress={() => setShowPass(!showPass)} 
              />
            }
          />

          <TextInput
            label="Confirmer le mot de passe"
            mode="outlined"
            secureTextEntry={!showConfirm}
            value={confirm}
            onChangeText={setConfirm}
            style={styles.input}
            placeholder="Répétez le mot de passe"
            disabled={loading}
            left={<TextInput.Icon icon="shield-check-outline" />}
            right={
              <TextInput.Icon 
                icon={showConfirm ? "eye-off" : "eye"} 
                onPress={() => setShowConfirm(!showConfirm)} 
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleChangePassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="shield-sync"
          >
            Mettre à jour
          </Button>
        </Surface>

        <Text style={styles.tipText}>
          Note : Vous serez peut-être invité à vous reconnecter après le changement.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
    marginTop: 5,
    paddingHorizontal: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'transparent', // Ou utilisez theme.colors.surface si vous voulez un fond distinct
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
  },
  buttonContent: {
    height: 50,
  },
  tipText: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 12,
    opacity: 0.5,
    fontStyle: 'italic'
  }
});