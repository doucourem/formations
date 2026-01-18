import React, { useMemo } from "react";
import {
  View,
  TouchableOpacity,
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
      fontSize: isDesktop ? 16 : 14,
      color: theme.colors.onSurface,
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

  /* ---------- Validation ---------- */
  const isValid = useMemo(() => {
    return (
      Number(form.amount) > 0 &&
      form.transactionType &&
      (form.transactionType !== "Autre" || form.otherType)
    );
  }, [form]);

  /* ---------- Filtrage caisses ---------- */
  const filteredCashes = useMemo(() => {
    if (!form.cashQuery) return [];
    return cashes.filter(c =>
      c.name.toLowerCase().includes(form.cashQuery.toLowerCase())
    );
  }, [cashes, form.cashQuery]);

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{
          alignSelf: "center",
          width: isDesktop ? 560 : width - 24,
          maxHeight: height - 60,
          borderRadius: isDesktop ? 16 : 12,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Dialog.Title
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: isDesktop ? 20 : 18,
          }}
        >
          {editMode ? "✏️ Modifier la transaction" : "➕ Nouvelle transaction"}
        </Dialog.Title>

        {/* ===== SCROLL ANDROID SAFE ===== */}
        <Dialog.ScrollArea>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          >
            {/* ===== CAISSE ===== */}
            {cashes.length > 1 && (
              <View>
                <SectionTitle theme={theme} isDesktop={isDesktop}>
                  Caisse
                </SectionTitle>

                <TextInput
                  label="Rechercher une caisse"
                  mode="outlined"
                  value={form.cashQuery}
                  onChangeText={text =>
                    setForm(prev => ({ ...prev, cashQuery: text }))
                  }
                  right={<TextInput.Icon icon="magnify" />}
                />

                {filteredCashes.length > 0 && (
                  <View
                    style={{
                      marginTop: 6,
                      maxHeight: 150,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.outlineVariant,
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                  >
                    {filteredCashes.map(item => {
                      const selected = form.cashId === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() =>
                            setForm(prev => ({
                              ...prev,
                              cashId: item.id,
                              cashQuery: item.name,
                            }))
                          }
                          style={{
                            padding: 12,
                            backgroundColor: selected
                              ? theme.colors.primaryContainer
                              : "transparent",
                          }}
                        >
                          <Text>{item.name} {selected && "✅"}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* ===== MONTANT & TYPE ===== */}
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
                  mode="outlined"
                  value={form.amount}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  returnKeyType="done"
                  onChangeText={text =>
                    setForm(prev => ({
                      ...prev,
                      amount: text.replace(/[^0-9]/g, ""),
                    }))
                  }
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
                        onPress={() =>
                          setForm(prev => ({ ...prev, type: "CREDIT" }))
                        }
                        style={{ flex: 1 }}
                      >
                        Envoi
                      </Button>
                    )}

                    <Button
                      mode={form.type === "DEBIT" ? "contained" : "outlined"}
                      onPress={() =>
                        setForm(prev => ({ ...prev, type: "DEBIT" }))
                      }
                      style={{ flex: 1 }}
                    >
                      Paiement
                    </Button>
                  </View>
                </View>
              )}
            </View>

            {/* ===== CATEGORIE ===== */}
            <SectionTitle theme={theme} isDesktop={isDesktop}>
              Catégorie de transaction
            </SectionTitle>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {transactionTypes.map(t => {
                const selected = form.transactionType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() =>
                      setForm(prev => ({
                        ...prev,
                        transactionType: t,
                        otherType: "",
                      }))
                    }
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      margin: 4,
                      borderRadius: 20,
                      borderWidth: 1,
                      backgroundColor: selected
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                    }}
                  >
                    <Text style={{ color: selected ? "#fff" : undefined }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {form.transactionType === "Autre" && (
              <TextInput
                label="Précisez le motif"
                mode="outlined"
                value={form.otherType}
                onChangeText={text =>
                  setForm(prev => ({ ...prev, otherType: text }))
                }
                style={{ marginTop: 12 }}
              />
            )}
          </ScrollView>
        </Dialog.ScrollArea>

        {/* ===== ACTIONS ===== */}
        <Dialog.Actions
          style={{
            flexDirection: isDesktop ? "row" : "column-reverse",
            gap: 8,
            padding: 16,
          }}
        >
          <Button onPress={onDismiss}>Annuler</Button>
          <Button
            mode="contained"
            onPress={onSave}
            disabled={!isValid}
          >
            {editMode ? "Mettre à jour" : "Confirmer"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
