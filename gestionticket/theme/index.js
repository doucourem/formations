import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

export const DarkTheme = {
  ...MD3DarkTheme,
  roundness: 10,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4CAF50",
    secondary: "#FF9800",
    error: "#F44336",
    background: "#121212",
    surface: "#1E1E1E",
    onSurface: "#FFFFFF",
    onSurfaceVariant: "#BDBDBD",
    outline: "#333",
  },
};

export const LightTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4CAF50",
  },
};
