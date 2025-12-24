import type { Request, Response, NextFunction } from "express";

// Cache en mémoire ultra-rapide pour améliorer les performances
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Configuration du cache par route
const cacheConfig = {
  '/api/transactions': { ttl: 60000 }, // 1 minute
  '/api/clients': { ttl: 120000 }, // 2 minutes
  '/api/users': { ttl: 300000 }, // 5 minutes
  '/api/stats/daily': { ttl: 60000 }, // 1 minute
  // '/api/system/settings': { ttl: 300000 }, // Désactivé pour mises à jour instantanées
};

export function performanceCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  // Seulement pour les requêtes GET
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const config = cacheConfig[key as keyof typeof cacheConfig];
  
  if (!config) {
    return next();
  }

  const cached = cache.get(key);
  const now = Date.now();

  // Vérifier si les données en cache sont encore valides
  if (cached && (now - cached.timestamp) < cached.ttl) {
    console.log(`⚡ [CACHE] Cache hit for ${key}`);
    return res.json(cached.data);
  }

  // Intercepter la réponse pour la mettre en cache
  const originalJson = res.json;
  res.json = function(data: any) {
    // Mettre en cache seulement les réponses réussies
    if (res.statusCode === 200) {
      cache.set(key, {
        data,
        timestamp: now,
        ttl: config.ttl
      });
      console.log(`⚡ [CACHE] Cache set for ${key}`);
    }
    return originalJson.call(this, data);
  };

  next();
}

// Fonction pour invalider le cache
export function invalidateCache(pattern?: string) {
  if (pattern) {
    // Invalider les clés qui correspondent au pattern
    const keys = Array.from(cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        cache.delete(key);
        console.log(`⚡ [CACHE] Invalidated ${key}`);
      }
    }
  } else {
    // Invalider tout le cache
    cache.clear();
    console.log('⚡ [CACHE] All cache cleared');
  }
}

// Nettoyage automatique du cache expiré
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  for (const [key, value] of entries) {
    if ((now - value.timestamp) > value.ttl) {
      cache.delete(key);
    }
  }
}, 60000); // Nettoyage toutes les minutes