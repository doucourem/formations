# Production Dockerfile for GesFinance - Replit Optimized
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
RUN apk add --no-cache dumb-init

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY dist/ ./
COPY public/ ./public/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S gesfinance -u 1001
RUN chown -R gesfinance:nodejs /app
USER gesfinance

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check optimized for Replit
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]