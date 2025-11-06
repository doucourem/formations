import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createPayment, updateClient } from '../../api/api';

const PaymentForm = ({ client, onCancel, onSaved }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localDebt, setLocalDebt] = useState(client.currentDebt);

  const formatFCFA = (val) => `${(val ?? 0).toLocaleString('fr-FR')} FCFA`;

  const handleSubmit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide');
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        clientId: client.id,
        transactionId: null,
        amount: numAmount,
        notes: notes.trim() || undefined,
      };
      const newPayment = await createPayment(paymentData);

      const newDebt = client.currentDebt - numAmount;
      await updateClient(client.id, { currentDebt: newDebt, totalPaid: client.totalPaid + numAmount });
      setLocalDebt(newDebt);

      setAmount('');
      setNotes('');

      onSaved && onSaved(newPayment);
      Alert.alert('Succès', 'Paiement enregistré !');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d’enregistrer le paiement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.clientBox}>
        <Text style={styles.clientName}>{client.name}</Text>
        <Text style={styles.clientPhone}>{client.phone}</Text>
        <Text style={[styles.clientDebt, localDebt > 0 ? styles.debt : styles.advance]}>
          {localDebt > 0 ? `Dette: ${formatFCFA(localDebt)}` : `Avance: ${formatFCFA(Math.abs(localDebt))}`}
        </Text>
      </View>

      <TextInput
        placeholder="Montant du paiement"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        editable={!isSubmitting}
      />
      <TextInput
        placeholder="Notes (optionnel)"
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, { height: 80 }]}
        editable={!isSubmitting}
        multiline
      />

      <View style={styles.buttons}>
        <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.saveButton]} disabled={isSubmitting}>
          <Text style={styles.saveText}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  clientBox: { backgroundColor: '#DBEAFE', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  clientName: { fontSize: 18, fontWeight: '600', color: '#1D4ED8' },
  clientPhone: { fontSize: 14, color: '#2563EB', marginTop: 4 },
  clientDebt: { marginTop: 8, fontSize: 16, fontWeight: '600' },
  debt: { color: '#DC2626' },
  advance: { color: '#16A34A' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 8, marginBottom: 12 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3F4F6', marginRight: 8 },
  saveButton: { backgroundColor: '#2563EB', marginLeft: 8 },
  cancelText: { color: '#374151', fontWeight: '500' },
  saveText: { color: '#FFFFFF', fontWeight: '500' },
});

export default PaymentForm;
