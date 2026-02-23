import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Keyboard } from "react-native";
import { sendAndSaveMessage } from "./sendAndSaveMessage";

export default function SendMessageScreen() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!to || !message) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    const success = await sendAndSaveMessage(to, message);
    setLoading(false);

    Alert.alert(success ? "Message envoyé ✅" : "Erreur ❌");
    if (success) {
      setMessage("");
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Numéro (WhatsApp)"
        value={to}
        onChangeText={setTo}
        keyboardType="phone-pad"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        autoCapitalize="none"
        style={[styles.input, { height: 100 }]}
      />

      <Button
        title={loading ? "Envoi..." : "Envoyer"}
        onPress={handleSend}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
});
