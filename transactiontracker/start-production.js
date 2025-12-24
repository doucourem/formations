#!/usr/bin/env node

/**
 * PRODUCTION STARTUP SCRIPT - GesFinance
 * Fixed deployment script that prevents "main done, exiting" errors
 * Ensures server runs continuously for Cloud Run deployment
 */

const { spawn } = require('child_process');
const path = require('path');

// Set production environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Starting GesFinance Production Server...');
console.log(`📍 Port: ${process.env.PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Missing DATABASE_URL'}`);

// Use tsx to run the TypeScript server directly
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  }
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server process:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`🛑 Server process exited with code ${code} and signal ${signal}`);
  if (code !== 0) {
    console.error('❌ Server process failed');
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

// Keep the process alive
console.log('✅ Production startup script running - server will stay alive');