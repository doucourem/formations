import { createTheme } from '@mui/material/styles';

const baseColors = {
  violet: '#6A1B9A',
  violetDark: '#4a148c',
  gold: '#FFD700',
  goldDark: '#e6c200',
  textPrimary: '#212121',
  textSecondary: '#616161',
  backgroundDefault: '#f5f5f5',
  backgroundPaper: '#fff',
};

const theme = createTheme({
  palette: {
    mode: 'light', // change à 'dark' si tu veux le mode sombre
    primary: {
      main: baseColors.violet,
      dark: baseColors.violetDark,
      contrastText: '#fff',
    },
    secondary: {
      main: baseColors.gold,
      dark: baseColors.goldDark,
      contrastText: '#000',
      light: '#ffec7a',
    },
    background: {
      default: baseColors.backgroundDefault,
      paper: baseColors.backgroundPaper,
    },
    text: {
      primary: baseColors.textPrimary,
      secondary: baseColors.textSecondary,
    },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'background-color 0.3s ease',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: baseColors.violetDark,
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: baseColors.goldDark,
            boxShadow: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.violet,
          color: '#fff',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: baseColors.violet,
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: baseColors.violet,
          },
          '&:hover fieldset': {
            borderColor: baseColors.violetDark,
          },
          '&.Mui-focused fieldset': {
            borderColor: baseColors.violetDark,
            borderWidth: 2,
          },
        },
      },
    },
  },
});

export default theme;
