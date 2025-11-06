import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createPayment, createTransaction, updateClient } from '../../api/actions';
const SendMoneyForm = ({ client, onCancel, onSaved }) => {
  const [amountSent, setAmountSent] = useState('');
  const [amountToPay, setAmountToPay] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [includePayment, setIncludePayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localDebt, setLocalDebt] = useState(client.currentDebt);

  const formatFCFA = (val) => `${(val ?? 0).toLocaleString('fr-FR')} FCFA`;

  const handleSubmit = async () => {
    const numSent = Number(amountSent);
    const numToPay = Number(amountToPay);
    const numPayment = Number(paymentAmount);

    if (!numSent || numSent <= 0 || !numToPay || numToPay <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir des montants valides');
      return;
    }

    if (includePayment && (!numPayment || numPayment <= 0 || numPayment > numToPay)) {
      Alert.alert('Erreur', 'Montant de paiement invalide');
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        clientId: client.id,
        amountSent: numSent,
        amountToPay: numToPay,
        senderName: senderName || undefined,
        receiverName: receiverName || undefined,
        destination: destination || undefined,
        code: code || undefined,
        notes: notes || undefined,
      };
      const transaction = await createTransaction(transactionData);

      let payment;
      if (includePayment && numPayment > 0) {
        payment = await createPayment({
          clientId: client.id,
          transactionId: transaction.id,
          amount: numPayment,
          notes: paymentNotes || undefined,
        });
        await updateClient(client.id, {
          currentDebt: client.currentDebt + numToPay - numPayment,
          totalPaid: client.totalPaid + numPayment,
        });
        setLocalDebt(client.currentDebt + numToPay - numPayment);
      } else {
        await updateClient(client.id, { currentDebt: client.currentDebt + numToPay });
        setLocalDebt(client.currentDebt + numToPay);
      }

      setAmountSent('');
      setAmountToPay('');
      setSenderName('');
      setReceiverName('');
      setDestination('');
      setCode('');
      setNotes('');
      setIncludePayment(false);
      setPaymentAmount('');
      setPaymentNotes('');

      onSaved && onSaved(transaction, payment);
      Alert.alert('Succès', 'Transaction enregistrée !');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d’enregistrer la transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <View style={styles.clientBox}>
        <Text style={styles.clientName}>{client.name}</Text>
        <Text style={styles.clientPhone}>{client.phone}</Text>
        <Text style={[styles.clientDebt, localDebt > 0 ? styles.debt : styles.advance]}>
          {localDebt > 0 ? `Dette: ${formatFCFA(localDebt)}` : `Avance: ${formatFCFA(Math.abs(localDebt))}`}
        </Text>
      </View>

      <TextInput placeholder="Montant envoyé" keyboardType="numeric" value={amountSent} onChangeText={setAmountSent} style={styles.input} editable={!isSubmitting} />
      <TextInput placeholder="Montant à payer" keyboardType="numeric" value={amountToPay} onChangeText={setAmountToPay} style={styles.input} editable={!isSubmitting} />
      <TextInput placeholder="Nom expéditeur" value={senderName} onChangeText={setSenderName} style={styles.input} editable={!isSubmitting} />
      <TextInput placeholder="Nom destinataire" value={receiverName} onChangeText={setReceiverName} style={styles.input} editable={!isSubmitting} />
      <TextInput placeholder="Destination" value={destination} onChangeText={setDestination} style={styles.input} editable={!isSubmitting} />
      <TextInput placeholder="Code / référence" value={code} onChangeText={setCode} style={styles.input} editable={!isSubmitting} />
      <TextInput placeholder="Notes" value={notes} onChangeText={setNotes} style={[styles.input, { height: 60 }]} editable={!isSubmitting} multiline />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
        <Switch value={includePayment} onValueChange={setIncludePayment} disabled={isSubmitting} />
        <Text style={{ marginLeft: 8 }}>Ajouter un paiement immédiat</Text>
      </View>

      {includePayment && (
        <View style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 6 }}>
          <TextInput placeholder="Montant du paiement" keyboardType="numeric" value={paymentAmount} onChangeText={setPaymentAmount} style={styles.input} editable={!isSubmitting} />
          <TextInput placeholder="Notes paiement" value={paymentNotes} onChangeText={setPaymentNotes} style={styles.input} editable={!isSubmitting} />
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.saveButton]} disabled={isSubmitting}>
          <Text style={styles.saveText}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  clientBox: { backgroundColor: '#DBEAFE', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  clientName: { fontSize: 18, fontWeight: '600', color: '#1D4ED8' },
  clientPhone: { fontSize: 14, color: '#2563EB', marginTop: 4 },
  clientDebt: { marginTop: 8, fontSize: 16, fontWeight: '600' },
  debt: { color: '#DC2626' },
  advance: { color: '#16A34A' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 8, marginBottom: 12 },
  button: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3F4F6', marginRight: 8 },
  saveButton: { backgroundColor: '#2563EB', marginLeft: 8 },
  cancelText: { color: '#374151', fontWeight: '500' },
  saveText: { color: '#FFFFFF', fontWeight: '500' },
});

export default SendMoneyForm;
