import React, { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

export default function TransactionCard({ transactions = [], selectedDate, searchClient, handleDeleteTransaction, handleCancelTransaction }) {

  const activeTransactions = useMemo(() => 
    transactions.filter(t => !t.isDeleted && t.status !== "cancelled"), 
    [transactions]
  );

  const totalAmount = useMemo(() => 
    activeTransactions.reduce((sum, t) => sum + parseFloat(t.amountFCFA || "0"), 0), 
    [activeTransactions]
  );

  const totalFees = useMemo(() => 
    activeTransactions.reduce((sum, t) => sum + parseFloat(t.feeAmount || "0"), 0), 
    [activeTransactions]
  );

  const formatCurrency = (value) => Number(value).toLocaleString("fr-FR");

  // Seuils pour colorer les montants
  const HIGH_AMOUNT = 100000; // par exemple 100 000 FCFA
  const LOW_AMOUNT = 10000;   // par exemple 10 000 FCFA

  const getAmountColor = (amount) => {
    if (amount >= HIGH_AMOUNT) return "green";
    if (amount <= LOW_AMOUNT) return "red";
    return "black";
  };

  const renderItem = ({ item }) => {
    const amountValue = parseFloat(item.amountFCFA || 0);
    return (
      <View style={[styles.row, item.status === "cancelled" && styles.cancelledRow]}>
        <Text style={styles.cell}>{new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={styles.cell}>{item.clientName}</Text>
        <Text style={styles.cell}>{item.phoneNumber}</Text>
        <Text style={[styles.cell, { color: getAmountColor(amountValue) }]}>
          {formatCurrency(amountValue)} FCFA
        </Text>
        <View style={styles.cell}>
          {parseFloat(item.feeAmount || 0) > 0 ? (
            <Text style={styles.feeText}>
              {formatCurrency(item.feeAmount)} FCFA ({item.feePercentage}%)
            </Text>
          ) : (
            <Text style={styles.noFee}>Aucun frais</Text>
          )}
        </View>
        <Text style={styles.cell}>{item.status}</Text>
        <View style={styles.cell}>
          {item.status === "pending" && (
            <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Supprimer</Text>
            </TouchableOpacity>
          )}
          {item.status === "seen" && (
            <TouchableOpacity onPress={() => handleCancelTransaction(item.id)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Totaux */}
      <View style={styles.totals}>
        <Text style={[styles.totalText, { color: getAmountColor(totalAmount) }]}>
          💰 Total Envoyé: {formatCurrency(totalAmount)} FCFA
        </Text>
        <Text style={styles.totalText}>📈 Total Frais: {formatCurrency(totalFees)} FCFA</Text>
      </View>

      {/* Tableau */}
      {activeTransactions.length > 0 ? (
        <FlatList
          data={activeTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={() => (
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>Date & Heure</Text>
              <Text style={styles.headerCell}>Client</Text>
              <Text style={styles.headerCell}>Numéro</Text>
              <Text style={styles.headerCell}>Montant FCFA</Text>
              <Text style={styles.headerCell}>Frais</Text>
              <Text style={styles.headerCell}>Statut</Text>
              <Text style={styles.headerCell}>Actions</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {selectedDate ? `Aucune transaction pour le ${new Date(selectedDate).toLocaleDateString("fr-FR")}` :
             searchClient ? `Aucune transaction trouvée pour "${searchClient}"` :
             "Aucune transaction aujourd'hui"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 10, margin: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  totals: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  totalText: { fontSize: 16, fontWeight: "bold" },
  headerRow: { flexDirection: "row", backgroundColor: "#eee", paddingVertical: 5 },
  headerCell: { flex: 1, fontWeight: "bold", fontSize: 12 },
  row: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#ddd" },
  cancelledRow: { backgroundColor: "#ffe5e5" },
  cell: { flex: 1, fontSize: 12 },
  feeText: { color: "orange" },
  noFee: { color: "#aaa" },
  deleteButton: { backgroundColor: "#f8d7da", padding: 5, borderRadius: 5 },
  cancelButton: { backgroundColor: "#fff3cd", padding: 5, borderRadius: 5 },
  buttonText: { fontSize: 12 },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#888", textAlign: "center" },
});
