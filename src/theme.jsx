// theme.js (ton thème MUI)
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', contrastText: '#fff' },
    secondary: { main: '#f57c00', contrastText: '#fff' },
    background: { default: '#f5f7fa', paper: '#fff' },
    text: { primary: '#212121', secondary: '#616161' },
    success: { main: '#388e3c' },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    h3: { fontWeight: 700, color: '#1976d2' },
    h4: { fontWeight: 600, color: '#1976d2' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, padding: '10px 24px' },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#1565c0', boxShadow: 'none' },
        },
        containedSecondary: {
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#ef6c00', boxShadow: 'none' },
        },
      },
    },
  },
});

export default theme;
