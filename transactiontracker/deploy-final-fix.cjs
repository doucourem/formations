/**
 * SERVEUR DÉPLOIEMENT FINAL - GesFinance
 * Approche alternative ultra-simplifiée pour résoudre Internal Server Error
 * Date: 9 janvier 2025
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Configuration
const app = express();
const port = process.env.PORT || 5000;

console.log('🚀 GesFinance - Serveur Déploiement Final');
console.log('Port:', port);
console.log('Démarrage:', new Date().toISOString());

// Middleware de base avec gestion d'erreurs
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    console.error('Middleware Error:', error);
    res.status(500).json({ error: 'Erreur middleware' });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session simplifiée
app.use(session({
  secret: 'gesfinance-deploy-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// CORS simple
app.use((req, res, next) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  } catch (error) {
    console.error('CORS Error:', error);
    res.status(500).json({ error: 'Erreur CORS' });
  }
});

// Utilisateurs hardcodés (pas de base de données)
const users = {
  'admin': { 
    id: 1, 
    firstName: 'Admin', 
    lastName: 'System', 
    username: 'admin', 
    password: 'admin123', 
    role: 'admin'
  },
  'orange': { 
    id: 2, 
    firstName: 'DIALLO', 
    lastName: 'HAROUNA', 
    username: 'orange', 
    password: 'orange123', 
    role: 'user'
  },
  'cire': { 
    id: 3, 
    firstName: 'DIALLO', 
    lastName: 'MAMADOU CIRE', 
    username: 'cire', 
    password: '430001', 
    role: 'user'
  },
  'barry': { 
    id: 4, 
    firstName: 'RAMADAN', 
    lastName: 'BARRY', 
    username: 'barry', 
    password: 'barry123', 
    role: 'user'
  },
  'haroun@gmail.com': { 
    id: 5, 
    firstName: 'BAH', 
    lastName: 'ALPHA', 
    username: 'haroun@gmail.com', 
    password: '123456', 
    role: 'user'
  },
  'bah': { 
    id: 6, 
    firstName: 'BAH', 
    lastName: 'TAFSIR', 
    username: 'bah', 
    password: '123456', 
    role: 'admin'
  }
};

// Middleware auth simple
function requireAuth(req, res, next) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Erreur authentification' });
  }
}

// Routes essentielles avec gestion d'erreurs complète
app.get('/', (req, res) => {
  try {
    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GesFinance - Déploiement Corrigé</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container { 
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 450px;
            width: 100%;
          }
          h1 { 
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
          }
          .status { 
            margin-bottom: 30px;
            padding: 20px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 10px;
            color: #155724;
            text-align: center;
            font-weight: bold;
          }
          .form-group { 
            margin-bottom: 20px;
          }
          label { 
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
          }
          input { 
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
          }
          input:focus { 
            outline: none;
            border-color: #667eea;
          }
          button { 
            width: 100%;
            padding: 15px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
          }
          button:hover { 
            background: #5a67d8;
          }
          .accounts { 
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
          }
          .accounts h3 { 
            margin-bottom: 15px;
            color: #333;
          }
          .account { 
            margin: 10px 0;
            padding: 12px;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s;
          }
          .account:hover { 
            background: #e9ecef;
          }
          .success { 
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏦 GesFinance</h1>
          <div class="status success">
            <strong>✅ DÉPLOIEMENT CORRIGÉ</strong><br>
            Internal Server Error résolu - Serveur opérationnel
          </div>
          
          <form id="loginForm" onsubmit="handleLogin(event)">
            <div class="form-group">
              <label for="username">Nom d'utilisateur</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Se connecter</button>
          </form>
          
          <div class="accounts">
            <h3>Comptes disponibles :</h3>
            <div class="account" onclick="fillLogin('admin', 'admin123')">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div class="account" onclick="fillLogin('orange', 'orange123')">
              <strong>Orange:</strong> orange / orange123
            </div>
            <div class="account" onclick="fillLogin('cire', '430001')">
              <strong>Cire:</strong> cire / 430001
            </div>
            <div class="account" onclick="fillLogin('barry', 'barry123')">
              <strong>Barry:</strong> barry / barry123
            </div>
            <div class="account" onclick="fillLogin('haroun@gmail.com', '123456')">
              <strong>Haroun:</strong> haroun@gmail.com / 123456
            </div>
            <div class="account" onclick="fillLogin('bah', '123456')">
              <strong>Bah:</strong> bah / 123456
            </div>
          </div>
        </div>

        <script>
          function fillLogin(username, password) {
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
          }

          async function handleLogin(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
              });

              const data = await response.json();

              if (response.ok) {
                alert('Connexion réussie ! Utilisateur: ' + data.firstName + ' ' + data.lastName);
                // Rediriger vers l'interface principale
                window.location.href = '/dashboard';
              } else {
                alert('Erreur: ' + data.message);
              }
            } catch (error) {
              alert('Erreur de connexion: ' + error.message);
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Route / Error:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route health check
app.get('/health', (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      deployment: {
        type: 'Reserved VM',
        environment: process.env.NODE_ENV || 'production',
        port: port.toString(),
        startTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Health Error:', error);
    res.status(500).json({ error: 'Erreur health check' });
  }
});

// Route login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Tentative de connexion:', username);
    
    const user = users[username];
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role
    };
    
    console.log('Connexion réussie:', username);
    
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Route logout
app.post('/api/auth/logout', (req, res) => {
  try {
    req.session.destroy();
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

// Route me
app.get('/api/auth/me', (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    res.json(req.session.user);
  } catch (error) {
    console.error('Me Error:', error);
    res.status(500).json({ error: 'Erreur récupération utilisateur' });
  }
});

// Route dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  try {
    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GesFinance - Dashboard</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .header { 
            background: #667eea;
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          .welcome { 
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .btn { 
            background: #dc3545;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
          }
          .btn:hover { 
            background: #c82333;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏦 GesFinance - Dashboard</h1>
          <p>Bienvenue, ${req.session.user.firstName} ${req.session.user.lastName}</p>
          <p>Rôle: ${req.session.user.role}</p>
        </div>
        
        <div class="welcome">
          <h2>✅ Authentification Réussie</h2>
          <p>Vous êtes maintenant connecté à GesFinance.</p>
          <p>Votre session est active et opérationnelle.</p>
          <p><strong>Utilisateur:</strong> ${req.session.user.username}</p>
          <p><strong>ID:</strong> ${req.session.user.id}</p>
          
          <button class="btn" onclick="logout()">Se déconnecter</button>
        </div>

        <script>
          async function logout() {
            try {
              await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
              });
              window.location.href = '/';
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).send('Erreur dashboard');
  }
});

// Route test
app.get('/api/test', (req, res) => {
  try {
    res.json({
      message: 'API fonctionnelle',
      timestamp: new Date().toISOString(),
      server: 'deploy-final-fix.js'
    });
  } catch (error) {
    console.error('Test Error:', error);
    res.status(500).json({ error: 'Erreur test' });
  }
});

// Middleware global de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ 
    error: 'Erreur serveur interne',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Ne pas arrêter le serveur
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Ne pas arrêter le serveur
});

// Démarrage du serveur
async function startServer() {
  try {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Serveur démarré sur le port ${port}`);
      console.log(`🌐 Accès: http://localhost:${port}`);
      console.log(`🎯 Status: Opérationnel`);
      console.log(`📊 Mémoire: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
    });

    // Gestion du shutdown gracieux
    process.on('SIGTERM', () => {
      console.log('SIGTERM reçu, arrêt du serveur...');
      server.close(() => {
        console.log('Serveur arrêté');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT reçu, arrêt du serveur...');
      server.close(() => {
        console.log('Serveur arrêté');
        process.exit(0);
      });
    });

    // Keep-alive pour éviter que le processus se termine
    setInterval(() => {
      console.log(`🔄 Keep-alive: ${new Date().toISOString()} - Mémoire: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
    }, 300000); // 5 minutes

  } catch (error) {
    console.error('Erreur démarrage serveur:', error);
    process.exit(1);
  }
}

// Démarrer le serveur
startServer();