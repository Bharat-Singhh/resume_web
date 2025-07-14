# Dockerfile for Resume Web Application
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# Backend build stage
FROM base AS backend-deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production && npm cache clean --force

FROM base AS backend-build
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/
RUN cd backend && npm run build || echo "No build script found"

# Production stage
FROM node:18-alpine AS production
RUN apk add --no-cache dumb-init curl
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=backend-deps --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build --chown=nodejs:nodejs /app/backend ./backend/

# Copy frontend assets
COPY --chown=nodejs:nodejs index.html ./
COPY --chown=nodejs:nodejs dashboard.html ./
COPY --chown=nodejs:nodejs assets/ ./assets/
COPY --chown=nodejs:nodejs admin/ ./admin/

# Copy views.json to the correct location and ensure it's writable
COPY --chown=nodejs:nodejs backend/views.json ./views.json
RUN chmod 664 /app/views.json

# Create a writable directory for logs and temp files
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/server.js"]