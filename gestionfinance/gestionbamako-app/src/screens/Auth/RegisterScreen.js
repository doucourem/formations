import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../../api/api';
import { AuthContext } from '../../api/context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // valeur par défaut
  const { setUser, setToken } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const res = await api.post('/auth/register', { email, password, role });
      const { id, email: userEmail, role: userRole } = res.data;

      // Mettre à jour le contexte auth
      setUser({ id, email: userEmail, role: userRole });

      Alert.alert('Succès', 'Compte créé avec succès');
      navigation.navigate('Login'); // redirige vers le login
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur', err.response?.data?.msg || 'Impossible de créer le compte');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        placeholder="Rôle (user/admin)"
        value={role}
        onChangeText={setRole}
        style={styles.input}
      />
      <Button title="S'inscrire" onPress={handleRegister} />
      <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>
        Déjà un compte ? Connectez-vous
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  loginText: { marginTop: 15, color: 'blue', textAlign: 'center' },
});
