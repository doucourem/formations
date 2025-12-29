import { DarkTheme as NavDarkTheme } from "@react-navigation/native";

export const NavigationDarkTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    border: "#2A2A2A",
    primary: "#4CAF50",
  },
};
