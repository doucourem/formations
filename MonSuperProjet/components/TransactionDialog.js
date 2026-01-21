import React, { useMemo } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  Dialog,
  Portal,
  TextInput,
  Text,
  Button,
} from "react-native-paper";

/* ---------- Section Title ---------- */
const SectionTitle = ({ children, theme, isDesktop }) => (
  <Text
    style={{
      marginBottom: 8,
      marginTop: 12,
      fontWeight: "600",
      color: theme.colors.onSurface,
      fontSize: isDesktop ? 16 : 14,
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
  cashes,
  form,
  setForm,
  profile,
  transactionTypes,
}) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;

  const isValid = useMemo(() => {
    return (
      form.amount &&
      Number(form.amount) > 0 &&
      form.transactionType &&
      (form.transactionType !== "Autre" || form.otherType)
    );
  }, [form]);

  // Filtrage des caisses
  const filteredCashes = useMemo(() => {
    if (!form.cashQuery) return [];
    return cashes.filter((c) =>
      c.name.toLowerCase().includes(form.cashQuery.toLowerCase())
    );
  }, [cashes, form.cashQuery]);

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: isDesktop ? 16 : 12,
          alignSelf: "center",
          width: isDesktop ? 560 : width - 24,
          maxHeight: height - 60, // Légère marge de sécurité
        }}
      >
        <Dialog.Title
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: isDesktop ? 20 : 18,
            color: theme.colors.onSurface,
          }}
        >
          {editMode ? "✏️ Modifier la transaction" : "➕ Nouvelle transaction"}
        </Dialog.Title>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flexShrink: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Dialog.Content>
              {/* ===== SECTION: CAISSE ===== */}
              {cashes.length > 1 && (
                <View style={{ marginBottom: 8 }}>
                  <SectionTitle theme={theme} isDesktop={isDesktop}>
                    Caisse
                  </SectionTitle>
                  <TextInput
                    label="Rechercher une caisse"
                    value={form.cashQuery}
                    onChangeText={(text) => setForm({ ...form, cashQuery: text })}
                    mode="outlined"
                    placeholder="Tapez le nom de la caisse..."
                    right={<TextInput.Icon icon="magnify" />}
                  />

                  {filteredCashes.length > 0 && (
                    <View
                      style={{
                        marginTop: 4,
                        maxHeight: 150,
                        borderWidth: 1,
                        borderColor: theme.colors.outlineVariant,
                        borderRadius: 8,
                        backgroundColor: theme.colors.surfaceVariant,
                      }}
                    >
                      {filteredCashes.map((item) => {
                        const selected = form.cashId === item.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() =>
                              setForm({
                                ...form,
                                cashId: item.id,
                                cashQuery: item.name,
                              })
                            }
                            style={{
                              padding: 12,
                              backgroundColor: selected ? theme.colors.primaryContainer : "transparent",
                              borderBottomWidth: 0.5,
                              borderBottomColor: theme.colors.outlineVariant,
                            }}
                          >
                            <Text style={{ color: theme.colors.onSurfaceVariant }}>
                              {item.name} {selected ? "✅" : ""}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* ===== SECTION: MONTANT & TYPE ===== */}
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <SectionTitle theme={theme} isDesktop={isDesktop}>
                    Montant
                  </SectionTitle>
                  <TextInput
                    label="Montant (FCFA)"
                    value={form.amount}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      setForm({ ...form, amount: text.replace(/[^0-9]/g, "") })
                    }
                    mode="outlined"
                  />
                </View>

                {profile?.role?.toLowerCase() !== "grossiste" && (
                  <View style={{ flex: 1 }}>
                    <SectionTitle theme={theme} isDesktop={isDesktop}>
                      Type de flux
                    </SectionTitle>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {profile?.role?.toLowerCase() === "admin" && (
                        <Button
                          mode={form.type === "CREDIT" ? "contained" : "outlined"}
                          onPress={() => setForm({ ...form, type: "CREDIT" })}
                          style={{ flex: 1 }}
                          buttonColor={form.type === "CREDIT" ? theme.colors.error : undefined}
                        >
                          Envoi
                        </Button>
                      )}
                      <Button
                        mode={form.type === "DEBIT" ? "contained" : "outlined"}
                        onPress={() => setForm({ ...form, type: "DEBIT" })}
                        style={{ flex: 1 }}
                        buttonColor={form.type === "DEBIT" ? theme.colors.primary : undefined}
                      >
                        Paiement
                      </Button>
                    </View>
                  </View>
                )}
              </View>

              {/* ===== SECTION: CATEGORIE ===== */}
              <SectionTitle theme={theme} isDesktop={isDesktop}>
                Catégorie de transaction
              </SectionTitle>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
                {transactionTypes.map((t) => {
                  const selected = form.transactionType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setForm({ ...form, transactionType: t, otherType: "" })}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant,
                        margin: 4,
                        borderWidth: 1,
                        borderColor: selected ? theme.colors.primary : theme.colors.outline,
                      }}
                    >
                      <Text style={{ color: selected ? "white" : theme.colors.onSurface, fontWeight: selected ? "bold" : "normal" }}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {form.transactionType === "Autre" && (
                <TextInput
                  label="Précisez le motif"
                  value={form.otherType}
                  onChangeText={(text) => setForm({ ...form, otherType: text })}
                  mode="outlined"
                  style={{ marginTop: 12 }}
                />
              )}
            </Dialog.Content>
          </ScrollView>
        </KeyboardAvoidingView>

   <Dialog.Actions
  style={{
    flexDirection: "row",        // Toujours sur la même ligne
    justifyContent: "center",    // Centre horizontalement
    gap: 12,                     // Espace entre les boutons
    padding: 16,
  }}
>
  <Button
    onPress={onDismiss}
    mode="outlined"
    textColor="#d32f2f"          // Annuler en rouge
  >
    Annuler
  </Button>

  <Button
    mode="contained"
    onPress={onSave}
    disabled={!isValid}
  >
    {editMode ? "Mettre à jour" : "Confirmer la transaction"}
  </Button>
</Dialog.Actions>




      </Dialog>
    </Portal>
  );
}