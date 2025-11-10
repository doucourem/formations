import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Card, Button as PaperButton, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../api/api';

export default function TransactionForm({ refresh, settings, currentUser }) {
  const theme = useTheme();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amountFcfa, setAmountFcfa] = useState('');
  const [type, setType] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/clients');
        setClients(data);
      } catch (err) {
        console.log('Erreur chargement clients', err);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientSearch('');
    setShowSuggestions(false);
  };

  const handleClearSelection = () => setSelectedClient(null);

  const handleSubmit = async () => {
    if (!phoneNumber || !amountFcfa || !type) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await api.post('/transactions', {
        client_id: selectedClient?.id || null,
        phone_number: phoneNumber,
        amount_fcfa: parseFloat(amountFcfa),
        type,
      });
      setSelectedClient(null);
      setPhoneNumber('');
      setAmountFcfa('');
      setType('');
      refresh();
    } catch (err) {
      console.log(err);
      alert('Erreur lors de l\'enregistrement de la transaction');
    }
  };

  const amountGNF = parseFloat(amountFcfa || 0) * (settings?.exchangeRate || 20);
  const feePercentage = parseFloat(currentUser?.personalFeePercentage || settings?.feePercentage || 0);
  const feeAmount = parseFloat(amountFcfa || 0) * feePercentage / 100;
  const totalToPay = parseFloat(amountFcfa || 0) + feeAmount;

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Client (Optionnel)</Text>

      {selectedClient ? (
        <View style={[styles.selectedClient, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.selectedClientInfo}>
            <Icon name="check" size={16} color={theme.colors.primary} />
            <Text style={[styles.selectedClientText, { color: theme.colors.primary }]}>{selectedClient.name}</Text>
          </View>
          <TouchableOpacity onPress={handleClearSelection}>
            <Icon name="x" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.searchWrapper}>
            <Icon name="search" size={16} color={theme.colors.placeholder} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              placeholder="Rechercher un client existant..."
              placeholderTextColor={theme.colors.placeholder}
              value={clientSearch}
              onChangeText={(text) => {
                setClientSearch(text);
                setShowSuggestions(text.length > 0);
              }}
              style={[styles.input, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            />
          </View>

          {showSuggestions && filteredClients.length > 0 && (
            <View style={[styles.suggestions, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}>
              {filteredClients.map(client => (
                <TouchableOpacity
                  key={client.id}
                  onPress={() => handleClientSelect(client)}
                  style={styles.suggestionItem}
                >
                  <Icon name="user" size={16} color={theme.colors.primary} />
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{client.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!clientSearch && (
            <Text style={[styles.helperText, { color: theme.colors.placeholder }]}>Laissez vide pour "Client Occasionnel"</Text>
          )}
        </View>
      )}

      <TextInput
        placeholder="Numéro du Destinataire"
        placeholderTextColor={theme.colors.placeholder}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={[styles.input, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Montant à Envoyer (FCFA)"
        placeholderTextColor={theme.colors.placeholder}
        value={amountFcfa}
        onChangeText={setAmountFcfa}
        style={[styles.input, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Type"
        placeholderTextColor={theme.colors.placeholder}
        value={type}
        onChangeText={setType}
        style={[styles.input, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
      />

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Résumé de la Transaction</Text>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text }}>Taux de change actuel:</Text>
          <Text style={{ color: theme.colors.text }}>1 FCFA = {settings?.exchangeRate || 20} GNF</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text }}>Montant en GNF:</Text>
          <Text style={{ color: theme.colors.text }}>{amountGNF} GNF</Text>
        </View>
        {feePercentage > 0 && (
          <View style={styles.row}>
            <Text style={{ color: theme.colors.text }}>Frais ({feePercentage}%):</Text>
            <Text style={{ color: theme.colors.text }}>{feeAmount} FCFA</Text>
          </View>
        )}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={{ color: theme.colors.error }}>Dette de cette transaction:</Text>
          <Text style={{ color: theme.colors.error }}>{totalToPay} FCFA</Text>
        </View>
      </Card>

      <PaperButton mode="contained" onPress={handleSubmit} style={styles.submitButton}>
        Valider la Transaction
      </PaperButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 6, marginBottom: 10, paddingLeft: 35 },
  label: { marginBottom: 5, fontWeight: 'bold' },
  helperText: { fontSize: 12, marginBottom: 10 },
  searchWrapper: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 10, top: 12 },
  suggestions: { borderWidth: 1, borderRadius: 6, maxHeight: 150 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 5 },
  suggestionText: { marginLeft: 5 },
  selectedClient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 6, marginBottom: 10 },
  selectedClientInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  selectedClientText: { fontWeight: 'bold' },
  card: { padding: 10, marginVertical: 10 },
  cardTitle: { fontWeight: 'bold', marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 5, marginTop: 5 },
  submitButton: { marginTop: 10, paddingVertical: 10 },
});
