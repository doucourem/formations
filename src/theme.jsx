// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#8e24aa', contrastText: '#fff' },       // violet branding
    secondary: { main: '#ffb300', contrastText: '#000' },      // or storytelling
    background: { default: '#fafafa', paper: '#ffffff' },
    text: {
      primary: '#2e2e2e',
      secondary: '#6f6f6f',
    },
    success: { main: '#43a047' },
    warning: { main: '#f4511e' },
    info: { main: '#29b6f6' },
  },

  typography: {
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, fontSize: '2.8rem', color: '#8e24aa' },
    h2: { fontWeight: 700, fontSize: '2.2rem', color: '#8e24aa' },
    h3: { fontWeight: 600, fontSize: '1.8rem', color: '#333' },
    button: { textTransform: 'none', fontWeight: 600 },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 22px',
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#6a1b9a',
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#ffa000',
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default theme;
