# Production Dockerfile for Chemical Service - Minimal
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY services/chemical-service/package.json ./

# Install dependencies with fallback
RUN npm install --no-audit --no-fund --omit=optional || npm install --no-audit --no-fund

# Copy application code
COPY services/chemical-service/server.js ./
COPY services/chemical-service/controllers/ ./controllers/
COPY services/chemical-service/routes/ ./routes/
COPY configurations/ ./configurations/

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node server.js & sleep 2 && kill %1 && exit 0 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]