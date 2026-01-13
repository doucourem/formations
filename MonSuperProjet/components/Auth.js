import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import supabase from "../supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez renseigner email et mot de passe.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Connexion rapide
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      if (!authData.user) throw new Error("Utilisateur introuvable.");

      // 2️⃣ Construire le profil à partir du user et metadata
      const userProfile = {
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.user_metadata?.full_name || "",
        role: authData.user.user_metadata?.role || "kiosque", // par défaut
      };

      // 3️⃣ Navigation immédiate
      navigation.reset({
        index: 0,
        routes: [{ name: "MainDrawer", params: { user: userProfile } }],
      });

      // 4️⃣ Charger le profil complet en arrière-plan si nécessaire
      // (ex: pour avoir les kiosques, cashes, etc.)
      supabase
        .from("users")
        .select("id, email, full_name, role")
        .eq("id", authData.user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.error("Erreur récupération profil :", error.message);
          // Ici tu peux stocker les infos dans un contexte global ou Redux
          // Exemple : setGlobalUser(data);
        });

    } catch (err) {
      console.error("Connexion échouée :", err.message);
      Alert.alert("Erreur de connexion", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
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

          <Button
            mode="contained"
            onPress={signIn}
            loading={loading}
            disabled={loading}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.buttonLabel}
          >
            Se Connecter
          </Button>
        </Card>
      </View>
    </PaperProvider>
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
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#F8FAFC",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
  },
  buttonLabel: {
    fontWeight: "600",
  },
});
