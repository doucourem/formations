import { Request, Response, NextFunction } from "express";

interface NetworkOptimizedRequest extends Request {
  isSlowConnection?: boolean;
  clientRegion?: string;
}

// Middleware pour détecter et optimiser les connexions lentes
export function networkOptimizationMiddleware(
  req: NetworkOptimizedRequest,
  res: Response,
  next: NextFunction,
) {
  // Headers de compression et cache agressifs pour connexions lentes
  const userAgent = req.get("User-Agent") || "";
  const acceptEncoding = req.get("Accept-Encoding") || "";

  // Détecter les connexions depuis la Guinée ou mobiles
  const isGuineaConnection =
    req.get("CF-IPCountry") === "GN" ||
    req.get("X-Country-Code") === "GN" ||
    userAgent.includes("Guinea") ||
    userAgent.includes("Mobile");

  // Détecter les connexions lentes via headers
  const connectionType = req.get("X-Connection-Type");
  const isSlowConnection =
    connectionType &&
    ["2g", "3g", "slow-2g"].includes(connectionType.toLowerCase());

  req.isSlowConnection = isSlowConnection || isGuineaConnection;
  req.clientRegion = isGuineaConnection ? "guinea" : "other";

  // Optimisations pour connexions lentes
  if (req.isSlowConnection) {
    // Cache plus agressif pour connexions lentes
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600",
    );

    // Compression adaptée

    // Headers de connexion optimisés
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Keep-Alive", "timeout=30, max=100");
  } else {
    // Cache normal pour connexions rapides
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=120",
    );
  }

  next();
}

// Middleware pour réponses optimisées selon le réseau
export function optimizedResponseMiddleware(
  req: NetworkOptimizedRequest,
  res: Response,
  next: NextFunction,
) {
  const originalJson = res.json;

  res.json = function (obj: any) {
    // Pour les connexions lentes, optimiser la réponse
    if (req.isSlowConnection && Array.isArray(obj)) {
      // Limiter les données pour connexions lentes
      if (obj.length > 50) {
        console.log(
          `🌐 [NETWORK] Connexion lente détectée - Limitation à 50 éléments (${obj.length} total)`,
        );
        obj = obj.slice(0, 50);
      }

      // Simplifier les objets complexes
      obj = obj.map((item: any) => {
        if (item.proof && item.proof.length > 10000) {
          // Réduire la taille des preuves pour connexions lentes
          return {
            ...item,
            proof: item.proof.substring(0, 5000) + "...[tronqué]",
          };
        }
        return item;
      });
    }

    return originalJson.call(this, obj);
  };

  next();
}

// Timeout adaptatif selon la connexion
export function adaptiveTimeoutMiddleware(
  req: NetworkOptimizedRequest,
  res: Response,
  next: NextFunction,
) {
  const timeout = req.isSlowConnection ? 30000 : 15000; // 30s pour connexions lentes, 15s normal

  req.setTimeout(timeout, () => {
    console.warn(`🌐 [NETWORK] Timeout ${timeout}ms atteint pour ${req.path}`);
    if (!res.headersSent) {
      res.status(408).json({
        error: "Request timeout",
        message: "Connexion trop lente, veuillez réessayer",
        isSlowConnection: req.isSlowConnection,
      });
    }
  });

  next();
}
