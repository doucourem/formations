import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6A1B9A', // violet
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFD700', // or
      contrastText: '#000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
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
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#4a148c', // un violet plus foncé au hover
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#e6c200', // or plus foncé au hover
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

export default theme;
