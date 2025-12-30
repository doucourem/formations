import { DarkTheme as NavDarkTheme } from "@react-navigation/native";

export const NavigationDarkTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    background: "#1A1A1A", // un peu plus clair que #121212
    card: "#262626",       // surface des headers et tabs
    text: "#E0E0E0",       // texte gris clair pour moins de contraste
    border: "#444",        // bordures plus douces
    primary: "#4CAF50",    // couleur principale
    notification: "#FF9800", // accent secondaire
  },
};
