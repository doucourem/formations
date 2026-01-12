import React, { useMemo } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Dialog,
  Portal,
  TextInput,
  Text,
  Button,
} from "react-native-paper";

const { width, height } = Dimensions.get("window");
const isDesktop = width >= 768;

/* ---------- Section Title ---------- */
const SectionTitle = ({ children, theme }) => (
  <Text
    style={{
      marginBottom: 6,
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

  /* ---------- Validation ---------- */
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
          borderRadius: 16,
          alignSelf: "center",
          width: isDesktop ? 560 : "94%",
          maxWidth: 640,
          maxHeight: "90%",
        }}
      >
        {/* ===== TITLE ===== */}
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

        {/* ===== CONTENT (MOBILE SAFE) ===== */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ maxHeight: height * 0.75 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Dialog.Content>

              {/* ===== CAISSE ===== */}
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
                    style={{ marginBottom: 8 }}
                  />

                  {!!form.cashQuery && (
                    <View
                      style={{
                        maxHeight: 160,
                        borderWidth: 1,
                        borderColor: theme.colors.outline,
                        borderRadius: 10,
                        overflow: "hidden",
                        backgroundColor: theme.colors.surfaceVariant,
                        marginBottom: 12,
                      }}
                    >
                      <FlatList
                        keyboardShouldPersistTaps="handled"
                        data={cashes.filter((c) =>
                          c.name
                            .toLowerCase()
                            .includes(form.cashQuery.toLowerCase())
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                          const selected = form.cashId === item.id;
                          return (
                            <TouchableOpacity
                              onPress={() =>
                                setForm({
                                  ...form,
                                  cashId: item.id,
                                  cashQuery: item.name,
                                })
                              }
                              style={{
                                padding: 10,
                                backgroundColor: selected
                                  ? theme.colors.primary
                                  : "transparent",
                              }}
                            >
                              <Text
                                style={{
                                  color: selected
                                    ? "white"
                                    : theme.colors.onSurface,
                                  fontWeight: selected ? "600" : "400",
                                }}
                              >
                                {item.name} {selected ? "✅" : ""}
                              </Text>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>
                  )}
                </>
              )}

              {/* ===== MONTANT + TYPE ===== */}
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  gap: 12,
                }}
              >
                {/* Montant */}
                <View style={{ flex: 1 }}>
                  <SectionTitle theme={theme}>Montant</SectionTitle>
                  <TextInput
                    label="Montant (FCFA)"
                    value={form.amount}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    autoFocus={!isDesktop}
                    onChangeText={(text) =>
                      setForm({
                        ...form,
                        amount: text.replace(/[^0-9]/g, ""),
                      })
                    }
                    mode="outlined"
                  />
                </View>

                {/* CREDIT / DEBIT */}
                {profile?.role?.toLowerCase() !== "grossiste" && (
                  <View style={{ flex: 1 }}>
                    <SectionTitle theme={theme}>Type</SectionTitle>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {profile?.role?.toLowerCase() === "admin" && (
                        <Button
                          mode={
                            form.type === "CREDIT" ? "contained" : "outlined"
                          }
                          onPress={() =>
                            setForm({ ...form, type: "CREDIT" })
                          }
                          style={{ flex: 1 }}
                          buttonColor={
                            form.type === "CREDIT"
                              ? theme.colors.error
                              : undefined
                          }
                        >
                          Envoi
                        </Button>
                      )}

                      <Button
                        mode={
                          form.type === "DEBIT" ? "contained" : "outlined"
                        }
                        onPress={() =>
                          setForm({ ...form, type: "DEBIT" })
                        }
                        style={{ flex: 1 }}
                        buttonColor={
                          form.type === "DEBIT"
                            ? theme.colors.success
                            : undefined
                        }
                      >
                        Paiement
                      </Button>
                    </View>
                  </View>
                )}
              </View>

              {/* ===== TYPE TRANSACTION ===== */}
              <SectionTitle theme={theme}>Type de transaction</SectionTitle>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginVertical: 6,
                }}
              >
                {transactionTypes.map((t) => {
                  const selected = form.transactionType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() =>
                        setForm({
                          ...form,
                          transactionType: t,
                          otherType: "",
                        })
                      }
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 18,
                        backgroundColor: selected
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                        margin: 4,
                        borderWidth: 1,
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.outline,
                      }}
                    >
                      <Text
                        style={{
                          color: selected
                            ? "white"
                            : theme.colors.onSurface,
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
                  onChangeText={(text) =>
                    setForm({ ...form, otherType: text })
                  }
                  mode="outlined"
                  style={{ marginTop: 8 }}
                />
              )}
            </Dialog.Content>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ===== ACTIONS ===== */}
        <Dialog.Actions
          style={{
            justifyContent: "flex-end",
            gap: 10,
            paddingHorizontal: 16,
          }}
        >
          <Button
            onPress={onDismiss}
            mode="outlined"
            textColor={theme.colors.error}
          >
            Annuler
          </Button>

          <Button
            mode="contained"
            onPress={onSave}
            disabled={!isValid}
          >
            {editMode ? "Modifier" : "Enregistrer"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
