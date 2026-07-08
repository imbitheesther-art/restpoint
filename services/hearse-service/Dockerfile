# RestPoint Hearse Service — Clean Dockerfile
FROM node:20-alpine

RUN apk add --no-cache dumb-init python3 make g++ wget

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy package files
COPY package.json tsconfig.base.json ./
COPY services/hearse-service/package.json ./services/hearse-service/

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy application code
COPY . .

# Build shared packages (optional - skip if not needed)
RUN cd packages/shared-config && npm run build || true && \
  cd packages/shared-logger && npm run build || true && \
  cd packages/shared-utils && npm run build || true && \
  cd packages/shared-services && npm run build || true

# Install tsx for running JavaScript
RUN npm install -g tsx

RUN mkdir -p /usr/src/app/services/hearse-service/uploads && chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/hearse-service/server.js"]