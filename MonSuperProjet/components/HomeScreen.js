import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

export default function HomeScreen({ navigation, user, screens }) {
  const { colors } = useTheme();

  const getIcon = (name) => {
    switch (name) {
      case "TRANSACTIONS": return "swap-horizontal";
      case "BOUTIQUE": return "storefront";
      case "CLIENTS": return "account-group";
      case "FOURNISSEURS": return "bank";
      case "RAPPORT": return "file-chart";
      case "OPÉRATEURS": return "cellphone-tower";
      case "UTILISATEURS": return "shield-account";
      case "SÉCURITÉ": return "lock-reset";
      default: return "dots-grid";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Barre de statut adaptée au thème clair */}
      <StatusBar barStyle="dark-content" />

      {/* HEADER CLAIR */}
    

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="titleMedium" style={styles.sectionTitle}>OPÉRATIONS</Text>
        
        <View style={styles.grid}>
          {screens.map((item) => (
            <TouchableOpacity 
              key={item.route}
              style={[styles.card, { backgroundColor: colors.surface }]} 
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
                <IconButton icon={getIcon(item.name)} iconColor={colors.primary} size={26} />
              </View>
              <Text variant="labelLarge" style={[styles.cardLabel, { color: colors.onSurface }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    // Ombre légère pour décoller le header du fond gris
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  balance: { fontWeight: '800', marginTop: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { 
    color: '#8E8E93', 
    marginBottom: 20, 
    letterSpacing: 1.2, 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    height: 120,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // Ombre très douce pour les cartes
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  iconContainer: { borderRadius: 15, marginBottom: 8 },
  cardLabel: { fontWeight: '700', fontSize: 11, textAlign: 'center' },
});