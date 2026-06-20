# Production Dockerfile for Tenant Service
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy workspace-level config files
COPY package.json tsconfig.base.json ./

# Copy all workspace package.json files for proper resolution
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY services/tenant-service/package.json ./services/tenant-service/

# Install ALL dependencies (including dev for building)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# BUILD shared packages first (CRITICAL!)
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy workspace-level config files
COPY package.json tsconfig.base.json ./
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY services/tenant-service/package.json ./services/tenant-service/

# Install production dependencies
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy source from builder
COPY --from=builder /usr/src/app /usr/src/app

# Install tsx for running TypeScript directly
RUN npm install -g tsx

# Create uploads directory
RUN mkdir -p /usr/src/app/uploads && chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose port - Match docker-compose expected port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5002/health || exit 1

# Start application with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["tsx", "services/tenant-service/server.ts"]