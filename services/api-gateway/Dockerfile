# ============================================
# RestPoint Gateway — Single-stage Dockerfile (JS only, no TypeScript)
# Uses http-proxy-middleware for reliable routing
# ============================================

FROM node:22-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package.json and install dependencies (includes http-proxy-middleware)
COPY services/api-gateway/package.json ./services/api-gateway/
RUN cd services/api-gateway && npm install --omit=dev

# Copy source code (server.js uses http-proxy-middleware + built-in http/https)
COPY services/api-gateway/ ./services/api-gateway/

# Copy global shared modules (shared utilities across services)
COPY global/ ./global/

# Copy env
COPY .env ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "services/api-gateway/server.js"]