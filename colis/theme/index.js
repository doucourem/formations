import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

export const DarkTheme = {
  ...MD3DarkTheme,
  roundness: 10,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4CAF50",
    secondary: "#FF9800",
    error: "#F44336",
    background: "#181818", // un peu plus clair que 121212
    surface: "#242424",    // un peu plus clair que 1E1E1E
    onSurface: "#E0E0E0",  // moins contrasté que #FFFFFF
    onSurfaceVariant: "#B0B0B0",
    outline: "#444",        // légèrement plus clair que 333
  },
};

export const LightTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4CAF50",
    secondary: "#FF9800",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    onSurface: "#212121",
    outline: "#E0E0E0",
  },
};
