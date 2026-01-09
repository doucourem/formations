import { db } from "./db";
import { users, systemSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

async function initializeDatabase() {
  try {
    // Vérifier si des utilisateurs existent déjà
    const existingUsers = await db.select().from(users);
    
    
    if (existingUsers.length === 0) {
      console.log("Initialisation des données de base...");
      
      // Créer les utilisateurs de base
      await db.insert(users).values([
        {
          firstName: 'Admin',
          lastName: 'System',
          username: 'admin',
          password: 'admin123',
          role: 'admin'
        },
        {
          firstName: 'DIALLO',
          lastName: 'HAROUNA',
          username: 'orange',
          password: 'orange123',
          role: 'user'
        },
        {
          firstName: 'CIRE',
          lastName: 'BARRY',
          username: 'cire',
          password: '430001',
          role: 'user'
        },
        {
          firstName: 'HAROUN',
          lastName: 'DIALLO',
          username: 'haroun@gmail.com',
          password: '123456',
          role: 'user'
        }
      ]);
      
      console.log("Utilisateurs de base créés");
    }
    
    // Vérifier les paramètres système
    const existingSettings = await db.select().from(systemSettings);
    
    if (existingSettings.length === 0) {
      await db.insert(systemSettings).values({
        exchangeRate: '15.2000',
        mainBalanceGNF: '30000000.00'
      });
      
      console.log("Paramètres système initialisés");
    }
    
    console.log("Base de données initialisée avec succès");
    
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Ne pas arrêter le serveur, juste logger l'erreur
    console.log("Continuant le démarrage du serveur sans initialisation des données par défaut");
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().then(() => {
    console.log("Database initialized successfully");
    process.exit(0);
  });
}

export { initializeDatabase };