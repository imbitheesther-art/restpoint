# ============================================
# RestPoint Gateway — Single-stage Dockerfile (JS only, no TypeScript)
# ============================================

FROM node:22-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package.json
COPY services/api-gateway/package.json ./services/api-gateway/

# Install production dependencies
RUN cd services/api-gateway && npm install --omit=dev

# Copy source code
COPY services/api-gateway/ ./services/api-gateway/

# Copy env
COPY .env ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "services/api-gateway/server.js"]
