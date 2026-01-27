import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, Image } from "react-native";
import { TextInput, Button, Card, Text, Divider, IconButton, Menu, Provider } from "react-native-paper";
import { createParcel, updateParcel, getAgencies } from "../services/parcelApi";
import * as ImagePicker from "react-native-image-picker";
import { useRoute } from "@react-navigation/native";

const paymentMethods = [
  { id: 1, name: "Espèces" },
  { id: 2, name: "Orange Money" },
  { id: 3, name: "Wave" },
];

export default function AddParcelScreen({ navigation }) {
  const route = useRoute();
  const existingParcel = route.params?.parcel || null;

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(existingParcel?.parcel_image_url || null);

  const [departureMenuVisible, setDepartureMenuVisible] = useState(false);
  const [arrivalMenuVisible, setArrivalMenuVisible] = useState(false);
  const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);

  const [agencies, setAgencies] = useState([]);

  // Récupérer les agences
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await getAgencies();
        setAgencies(response.data || []);
      } catch (e) {
        console.error("Erreur récupération agences:", e);
        Alert.alert("Erreur", "Impossible de charger les agences.");
      }
    };
    fetchAgencies();
  }, []);

  // Génération du tracking number
  const generateTracking = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `COLIS-${date}-${rand}`;
  };

  const [form, setForm] = useState({
    tracking_number: existingParcel?.tracking_number || generateTracking(),
    sender_name: existingParcel?.sender_name || "",
    sender_phone: existingParcel?.sender_phone || "",
    recipient_name: existingParcel?.recipient_name || "",
    recipient_phone: existingParcel?.recipient_phone || "",
    weight_kg: existingParcel?.weight_kg?.toString() || "",
    price: existingParcel?.price?.toString() || "",
    description: existingParcel?.description || "",
    departure_agency_id: existingParcel?.departure_agency_id || null,
    arrival_agency_id: existingParcel?.arrival_agency_id || null,
    payment_method: existingParcel?.payment_method || "",
    status: existingParcel?.status || "pending",
    parcel_image: null, // nouvelle image si choisie
  });

  const onChange = (key, value) => setForm({ ...form, [key]: value });

  // Sélection d'image
  const pickImage = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: "photo", maxWidth: 800, maxHeight: 800, quality: 0.8 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) return Alert.alert("Erreur", response.errorMessage);

        const asset = response.assets?.[0];
        if (asset) {
          setForm({ ...form, parcel_image: asset });
          setImagePreview(asset.uri);
        }
      }
    );
  };

  // Validation et soumission
  const submit = async () => {
    if (
      !form.sender_name || !form.recipient_name ||
      !form.sender_phone || !form.recipient_phone ||
      !form.departure_agency_id || !form.arrival_agency_id ||
      form.departure_agency_id === form.arrival_agency_id ||
      !form.payment_method ||
      !form.tracking_number ||
      Number(form.weight_kg) <= 0 ||
      Number(form.price) <= 0
    ) {
      return Alert.alert("Erreur", "Merci de remplir tous les champs obligatoires correctement.");
    }

    try {
      setLoading(true);

      const data = new FormData();

      // Champs
      Object.entries({
        tracking_number: form.tracking_number,
        sender_name: form.sender_name,
        sender_phone: form.sender_phone,
        recipient_name: form.recipient_name,
        recipient_phone: form.recipient_phone,
        weight_kg: form.weight_kg,
        price: form.price,
        status: form.status,
        departure_agency_id: form.departure_agency_id,
        arrival_agency_id: form.arrival_agency_id,
        description: form.description,
        payment_method: form.payment_method,
      }).forEach(([key, value]) => value !== null && data.append(key, value.toString()));

      // Image
      if (form.parcel_image) {
        let uri = form.parcel_image.uri;
        if (!uri.startsWith("file://")) uri = "file://" + uri;
        const type = form.parcel_image.type?.split(";")[0] || "image/jpeg";

        data.append("parcel_image", {
          uri,
          type,
          name: form.parcel_image.fileName || `parcel-${Date.now()}.jpg`,
        });
      }

      // Appel API
      if (existingParcel) {
        await updateParcel(existingParcel.id, data);
        Alert.alert("Succès", "Colis mis à jour avec succès", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        await createParcel(data);
        Alert.alert("Succès", "Colis ajouté avec succès", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }

    } catch (e) {
      console.error("Erreur création/édition colis :", e);
      if (e.response?.data?.errors) {
        const messages = Object.values(e.response.data.errors).flat().join("\n");
        Alert.alert("Erreur validation", messages);
      } else {
        Alert.alert("Erreur", "Impossible d’ajouter le colis.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        <Card elevation={3}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.title}>
              {existingParcel ? "Éditer Colis" : "Nouveau Colis"}
            </Text>

            {/* Tracking */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                label="Numéro de tracking"
                value={form.tracking_number}
                editable={!existingParcel}
                style={{ flex: 1 }}
              />
              {!existingParcel && (
                <IconButton
                  icon="autorenew"
                  onPress={() => onChange("tracking_number", generateTracking())}
                />
              )}
            </View>

            <Divider style={{ marginVertical: 10 }} />

            {/* Expéditeur / Destinataire */}
            <TextInput label="Expéditeur" value={form.sender_name} onChangeText={v => onChange("sender_name", v)} style={styles.input} />
            <TextInput label="Téléphone expéditeur" keyboardType="phone-pad" value={form.sender_phone} onChangeText={v => onChange("sender_phone", v)} style={styles.input} />
            <TextInput label="Destinataire" value={form.recipient_name} onChangeText={v => onChange("recipient_name", v)} style={styles.input} />
            <TextInput label="Téléphone destinataire" keyboardType="phone-pad" value={form.recipient_phone} onChangeText={v => onChange("recipient_phone", v)} style={styles.input} />

            {/* Agences */}
            <Menu
              visible={departureMenuVisible}
              onDismiss={() => setDepartureMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setDepartureMenuVisible(true)}>
                  {form.departure_agency_id ? agencies.find(a => a.id === form.departure_agency_id)?.name : "Sélectionner l'agence de départ"}
                </Button>
              }
            >
              {agencies.map(a => (
                <Menu.Item key={a.id} onPress={() => { onChange("departure_agency_id", a.id); setDepartureMenuVisible(false); }} title={a.name} />
              ))}
            </Menu>

            <Menu
              visible={arrivalMenuVisible}
              onDismiss={() => setArrivalMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setArrivalMenuVisible(true)} style={{ marginTop: 10 }}>
                  {form.arrival_agency_id ? agencies.find(a => a.id === form.arrival_agency_id)?.name : "Sélectionner l'agence d'arrivée"}
                </Button>
              }
            >
              {agencies.map(a => (
                <Menu.Item key={a.id} onPress={() => { onChange("arrival_agency_id", a.id); setArrivalMenuVisible(false); }} title={a.name} />
              ))}
            </Menu>

            {/* Méthode de paiement */}
            <Menu
              visible={paymentMenuVisible}
              onDismiss={() => setPaymentMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setPaymentMenuVisible(true)} style={{ marginTop: 10 }}>
                  {form.payment_method || "Sélectionner le mode de paiement"}
                </Button>
              }
            >
              {paymentMethods.map(pm => (
                <Menu.Item key={pm.id} onPress={() => { onChange("payment_method", pm.name); setPaymentMenuVisible(false); }} title={pm.name} />
              ))}
            </Menu>

            {/* Poids / Prix / Description */}
            <TextInput label="Poids (kg)" keyboardType="numeric" value={form.weight_kg.toString()} onChangeText={v => onChange("weight_kg", v)} style={styles.input} />
            <TextInput label="Prix (CFA)" keyboardType="numeric" value={form.price.toString()} onChangeText={v => onChange("price", v)} style={styles.input} />
            <TextInput label="Description" value={form.description} onChangeText={v => onChange("description", v)} multiline numberOfLines={3} style={[styles.input, { height: 80 }]} />

            {/* Image */}
            <Button icon="camera" onPress={pickImage} style={{ marginBottom: 10 }}>Ajouter une photo</Button>
            {imagePreview && (
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Image source={{ uri: imagePreview }} style={{ width: 200, height: 200, borderRadius: 8 }} />
                <Button onPress={() => { setForm({ ...form, parcel_image: null }); setImagePreview(null); }} mode="outlined" style={{ marginTop: 5 }}>Supprimer l'image</Button>
              </View>
            )}

            <Button mode="contained" loading={loading} onPress={submit} style={{ marginTop: 20 }}>
              {existingParcel ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
  title: { marginBottom: 16, fontWeight: "bold" },
  input: { marginBottom: 12 },
});
