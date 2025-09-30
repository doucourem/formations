import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import React from 'react';

// Material UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Créer un thème MUI (personnalisable)
const theme = createTheme({
    palette: {
        mode: 'light', // light ou dark
        primary: {
            main: '#1976d2', // bleu
        },
        secondary: {
            main: '#9c27b0', // violet
        },
    },
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <React.StrictMode>
                <ThemeProvider theme={theme}>
                    <CssBaseline /> {/* Normalise le style global */}
                    <App {...props} />
                </ThemeProvider>
            </React.StrictMode>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
