# Production Dockerfile for Analytics Service
FROM node:22-alpine

# Install runtime dependencies
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy root workspace config first
COPY package.json tsconfig.base.json ./

# Copy shared package.json files
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Copy service package.json
COPY services/analytics-service/package.json ./services/analytics-service/

# Install ALL dependencies (including dev for building shared packages)
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy shared source modules first
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Build shared packages first (CRITICAL for TypeScript imports!)
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Copy service source code
COPY services/analytics-service/ ./services/analytics-service/

RUN mkdir -p /usr/src/app/data && chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start application with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/analytics-service/server.js"]