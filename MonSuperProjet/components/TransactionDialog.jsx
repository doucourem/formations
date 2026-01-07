import React, { useMemo } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Dialog, Portal, TextInput, Text, Button } from "react-native-paper";

const { width, height } = Dimensions.get("window");

/* ---------- Composant interne pour les titres de sections ---------- */
const SectionTitle = ({ children, theme }) => (
  <Text
    style={{
      marginBottom: 4,
      fontWeight: "600",
      color: theme.colors.onSurface,
      fontSize: Math.round(14 * (width / 375)),
    }}
  >
    {children}
  </Text>
);

export default function TransactionDialog({
  visible,
  onDismiss,
  onSave,
  editMode,
  theme,
  responsiveFont,
  cashes,
  form,
  setForm,
  profile,
  transactionTypes,
}) {
  const isValid = useMemo(() => {
    return (
      form.amount &&
      Number(form.amount) > 0 &&
      form.transactionType &&
      (form.transactionType !== "Autre" || form.otherType)
    );
  }, [form]);

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: width * 0.04,
          marginHorizontal: width * 0.03,
          maxHeight: height * 0.85,
        }}
      >
        {/* Titre */}
        <Dialog.Title
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: responsiveFont(18),
            color: theme.colors.onSurface,
          }}
        >
          {editMode ? "✏️ Modifier la transaction" : "➕ Nouvelle transaction"}
        </Dialog.Title>

        <Dialog.ScrollArea style={{ maxHeight: height * 0.7 }}>
          <Dialog.Content>

            {/* Sélection caisse */}
            {cashes.length > 1 && (
              <>
                <SectionTitle theme={theme}>Caisse</SectionTitle>
                <TextInput
                  label="Rechercher une caisse"
                  value={form.cashQuery}
                  onChangeText={(text) =>
                    setForm({ ...form, cashQuery: text })
                  }
                  mode="outlined"
                  right={<TextInput.Icon icon="magnify" />}
                  style={{ marginBottom: height * 0.008 }}
                />
                {!!form.cashQuery && (
                  <View
                    style={{
                      maxHeight: height * 0.2,
                      borderWidth: 1,
                      borderColor: theme.colors.outline,
                      borderRadius: width * 0.02,
                      overflow: "hidden",
                      marginBottom: height * 0.01,
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                  >
                    <FlatList
                      data={cashes.filter((c) =>
                        c.name.toLowerCase().includes(form.cashQuery.toLowerCase())
                      )}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() =>
                            setForm({ ...form, cashId: item.id, cashQuery: item.name })
                          }
                          style={{
                            padding: height * 0.01,
                            backgroundColor:
                              form.cashId === item.id
                                ? theme.colors.primary
                                : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              color:
                                form.cashId === item.id
                                  ? "white"
                                  : theme.colors.onSurface,
                              fontWeight: form.cashId === item.id ? "600" : "400",
                            }}
                          >
                            {item.name} {form.cashId === item.id ? "✅" : ""}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </>
            )}

            {/* Montant */}
            <SectionTitle theme={theme}>Montant</SectionTitle>
            <TextInput
              label="Montant (FCFA)"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={(text) => setForm({ ...form, amount: text })}
              mode="outlined"
              style={{ marginBottom: height * 0.015 }}
            />

            {/* CREDIT / DEBIT */}
            {profile?.role?.toLowerCase() !== "grossiste" && (
              <>
                <SectionTitle theme={theme}>Type</SectionTitle>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: height * 0.015 }}>
                  {profile?.role?.toLowerCase() === "admin" && (
                        <Button
                    mode={form.type === "CREDIT" ? "contained" : "outlined"}
                    onPress={() => setForm({ ...form, type: "CREDIT" })}
                    style={{ flex: 1, marginRight: 4 }}
                    buttonColor={form.type === "CREDIT" ? theme.colors.error : undefined}
                    textColor={form.type === "CREDIT" ? "white" : theme.colors.onSurface}
                  >
                    Envoie
                  </Button>
                      )}
                  
                  <Button
                    mode={form.type === "DEBIT" ? "contained" : "outlined"}
                    onPress={() => setForm({ ...form, type: "DEBIT" })}
                    style={{ flex: 1, marginLeft: 4 }}
                    buttonColor={form.type === "DEBIT" ? theme.colors.success : undefined}
                    textColor={form.type === "DEBIT" ? "white" : theme.colors.onSurface}
                  >
                    Paiement
                  </Button>
                </View>
              </>
            )}

            {/* Type spécifique */}
            <SectionTitle theme={theme}>Type de transaction</SectionTitle>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 6 }}>
              {transactionTypes.map((t) => {
                const selected = form.transactionType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setForm({ ...form, transactionType: t, otherType: "" })}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 18,
                      backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant,
                      margin: 3,
                      borderWidth: 1,
                      borderColor: selected ? theme.colors.primary : theme.colors.outline,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "white" : theme.colors.onSurface,
                        fontWeight: selected ? "600" : "400",
                      }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {form.transactionType === "Autre" && (
              <TextInput
                label="Précisez le type"
                value={form.otherType}
                onChangeText={(text) => setForm({ ...form, otherType: text })}
                mode="outlined"
                style={{ marginTop: height * 0.01 }}
              />
            )}
          </Dialog.Content>
        </Dialog.ScrollArea>

        {/* Actions */}
        <Dialog.Actions style={{ justifyContent: "space-between", paddingHorizontal: width * 0.02 }}>
          <Button
            onPress={onDismiss}
            buttonColor={theme.colors.error}
            textColor="white"
          >
            Annuler
          </Button>

          <Button
            mode="contained"
            onPress={onSave}
            disabled={!isValid}
            buttonColor={isValid ? theme.colors.primary : theme.colors.disabled}
            textColor="white"
          >
            {editMode ? "Modifier" : "Enregistrer"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
