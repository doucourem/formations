import { MD3DarkTheme } from "react-native-paper";

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // Couleurs principales
    primary: "#4CAF50",
    secondary: "#FF9800",
    error: "#F44336",

    // Fond
    background: "#121212",
    surface: "#1E1E1E",

    // Texte
    onBackground: "#FFFFFF",
    onSurface: "#FFFFFF",
    onSurfaceVariant: "#CCCCCC",

    // Boutons
    primaryContainer: "#2E7D32",
    onPrimaryContainer: "#FFFFFF",
  },
};

export default theme;
