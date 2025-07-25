import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css";
import "./styles/mobile.css";
import "./styles/firefox-responsive.css";
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from "@/contexts/auth-context";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
