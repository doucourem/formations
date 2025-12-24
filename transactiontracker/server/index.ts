import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import pgSession from "connect-pg-simple";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

import { initializeDatabase } from "./init-db";

const MemoryStoreSession = MemoryStore(session);

const app = express();

// CORS headers for external browser access
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
// Mobile-optimized headers middleware for Reserved VM
app.use((req, res, next) => {
  // Security headers
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Mobile compatibility headers
  res.setHeader("X-UA-Compatible", "IE=edge");
  res.setHeader("Vary", "User-Agent, Accept-Encoding");

  // Performance headers for mobile connections
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=5, max=1000");

  // PWA support headers
  res.setHeader("X-Viewport", "width=device-width, initial-scale=1");

  next();
});

// Enhanced compression for Reserved VM and mobile optimization
/*app.use(
  compression({
    filter: (req, res) => {
      // Compress all responses except WebSocket upgrades
      if (req.headers.upgrade === "websocket") return false;

      // Always compress for mobile user agents (prioritize bandwidth saving)
      const userAgent = req.headers["user-agent"] || "";
      if (
        userAgent.includes("Mobile") ||
        userAgent.includes("Android") ||
        userAgent.includes("iPhone")
      ) {
        return true;
      }

      return compression.filter(req, res);
    },
    level: 9, // Maximum compression for Reserved VM (CPU is not a constraint)
    threshold: 512, // Compress responses larger than 512 bytes
    chunkSize: 1024, // Optimize for mobile connections
    windowBits: 15, // Maximum window size for best compression
    memLevel: 9, // Use more memory for better compression
  }),
);
*/

app.use((req, res, next) => {
  const _send = res.send;
  res.send = function (body) {
    console.log(
      "➡️  Sent Content-Encoding:",
      res.getHeader("Content-Encoding"),
    );
    return _send.call(this, body);
  };
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration stable et simple
app.use(
  session({
    secret: process.env.SESSION_SECRET || "stable-secret-key",
    name: "connect.sid",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Prolonge automatiquement la session à chaque requête
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // Vérification quotidienne des sessions expirées
    }),
    cookie: {
      secure: false, // Simple pour la version stable
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours au lieu de 24h
      httpOnly: true,
      sameSite: "lax", // Configuration stable
      path: "/",
    },
  }),
);

// Enhanced monitoring for Reserved VM deployment
const monitoringData = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0,
  peakMemory: 0,
  slowRequestCount: 0,
  mobileRequestCount: 0,
};

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Update monitoring data
  monitoringData.requestCount++;

  // Track mobile requests
  const userAgent = req.headers["user-agent"] || "";
  if (
    userAgent.includes("Mobile") ||
    userAgent.includes("Android") ||
    userAgent.includes("iPhone")
  ) {
    monitoringData.mobileRequestCount++;
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const memory = process.memoryUsage();

    // Track peak memory usage
    if (memory.heapUsed > monitoringData.peakMemory) {
      monitoringData.peakMemory = memory.heapUsed;
    }

    // Track errors
    if (res.statusCode >= 400) {
      monitoringData.errorCount++;
    }

    // Track slow requests (>1000ms)
    if (duration > 1000) {
      monitoringData.slowRequestCount++;
      log(`⚠️  Slow request: ${req.method} ${path} - ${duration}ms`);
    }

    // Enhanced logging for API requests
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize the server without wrapping in async IIFE to prevent early exit
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    // Archive service removed

    // Enhanced health check endpoint with monitoring data
    app.get("/health", (req, res) => {
      const uptime = process.uptime();
      const memory = process.memoryUsage();

      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime,
        memory,
        monitoring: {
          requestCount: monitoringData.requestCount,
          errorCount: monitoringData.errorCount,
          errorRate:
            monitoringData.requestCount > 0
              ? (
                  (monitoringData.errorCount / monitoringData.requestCount) *
                  100
                ).toFixed(2) + "%"
              : "0%",
          slowRequestCount: monitoringData.slowRequestCount,
          mobileRequestCount: monitoringData.mobileRequestCount,
          mobilePercentage:
            monitoringData.requestCount > 0
              ? (
                  (monitoringData.mobileRequestCount /
                    monitoringData.requestCount) *
                  100
                ).toFixed(1) + "%"
              : "0%",
          peakMemoryMB: Math.round(monitoringData.peakMemory / 1024 / 1024),
          currentMemoryMB: Math.round(memory.heapUsed / 1024 / 1024),
          uptimeHours: Math.round((uptime / 3600) * 100) / 100,
        },
        deployment: {
          type: "Reserved VM",
          environment: process.env.NODE_ENV || "development",
          port: process.env.PORT || "5000",
          startTime: new Date(monitoringData.startTime).toISOString(),
        },
      });
    });

    // Health check endpoint will be available at /health for deployment monitoring

    const server = await registerRoutes(app);

    // Critical: Prevent API responses from being overridden by Vite catch-all
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/') && res.headersSent) {
        console.log(`🚫 [API PROTECTION] Blocking further middleware for ${req.method} ${req.path}`);
        return;
      }
      next();
    });

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Static file optimization middleware (before Vite setup)
    if (app.get("env") !== "development") {
      // Add cache headers for production static files
      app.use((req, res, next) => {
        if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          res.setHeader("X-Content-Type-Options", "nosniff");
        }
        next();
      });
    }

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || "5000", 10);

    server.listen(port, "0.0.0.0", () => {
      log(`✅ Stable server started successfully`);
      log(`serving on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || "development"}`);
      log(
        `Database: ${process.env.DATABASE_URL ? "Connected" : "Missing DATABASE_URL"}`,
      );
      log("Server is running and ready to handle requests");
    });

    // Signal handlers will be set up in initializeServer function

    // Keep the process alive by returning the server instance
    return server;
  } catch (error) {
    log(
      `Failed to start server: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

// Initialize server without early exit
async function initializeServer() {
  try {
    const server = await startServer();
    log("✅ Stable server started successfully");

    // Keep the process alive indefinitely with enhanced monitoring
    const keepAlive = setInterval(() => {
      // Health monitoring - log every 5 minutes
      if (Date.now() % 300000 < 1000) {
        // roughly every 5 minutes
        const memory = process.memoryUsage();
        const uptime = process.uptime();
        const mobilePercentage =
          monitoringData.requestCount > 0
            ? (
                (monitoringData.mobileRequestCount /
                  monitoringData.requestCount) *
                100
              ).toFixed(1)
            : 0;

        log(
          `💚 Server health check - Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB, Uptime: ${Math.round(uptime)}s`,
        );
        log(
          `📊 Requests: ${monitoringData.requestCount}, Errors: ${monitoringData.errorCount}, Mobile: ${mobilePercentage}%`,
        );
        log(
          `🚀 Peak Memory: ${Math.round(monitoringData.peakMemory / 1024 / 1024)}MB, Slow Requests: ${monitoringData.slowRequestCount}`,
        );
      }
    }, 60000); // Check every minute

    // Cleanup on shutdown
    process.on("SIGTERM", () => {
      log("🛑 SIGTERM received, shutting down gracefully...");
      clearInterval(keepAlive);
      server.close(() => {
        log("✅ Server closed gracefully");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      log("🛑 SIGINT received, shutting down gracefully...");
      clearInterval(keepAlive);
      server.close(() => {
        log("✅ Server closed gracefully");
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    log(
      `❌ Server startup failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

// Start the server and prevent main process exit
initializeServer();
