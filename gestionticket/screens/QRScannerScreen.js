import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Linking, Platform } from "react-native";
import { Text, Button, ActivityIndicator, useTheme } from "react-native-paper";

// Import dynamique ou conditionnel pour éviter les erreurs sur le Web
let Camera, useCameraDevice, useCodeScanner;
if (Platform.OS !== 'web') {
  const NativeCamera = require("react-native-vision-camera");
  Camera = NativeCamera.Camera;
  useCameraDevice = NativeCamera.useCameraDevice;
  useCodeScanner = NativeCamera.useCodeScanner;
}

export default function QRScannerScreen({ navigation }) {
  const theme = useTheme();

  // --- CAS DU NAVIGATEUR WEB ---
  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
          Caméra indisponible sur Web
        </Text>
        <Text style={styles.webSubtitle}>
          Le scanner de billets nécessite une installation native sur Android ou iOS.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Retourner au Dashboard
        </Button>
      </View>
    );
  }

  // --- CAS MOBILE NATIVE ---
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isActive) {
        setIsActive(false);
        Alert.alert("Billet détecté", `Données : ${codes[0].value}`, [
          { text: "OK", onPress: () => setIsActive(true) }
        ]);
      }
    }
  });

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Permission caméra requise</Text>
        <Button mode="contained" onPress={() => Linking.openSettings()}>Autoriser</Button>
      </View>
    );
  }

  if (!device) return <ActivityIndicator size="large" style={styles.center} />;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.btn}>
          Fermer
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webSubtitle: { textAlign: 'center', marginVertical: 15, color: '#666' },
  overlay: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  btn: { backgroundColor: 'rgba(0,0,0,0.5)' }
});