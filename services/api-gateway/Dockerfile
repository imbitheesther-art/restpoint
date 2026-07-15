# RestPoint API Gateway — Clean Dockerfile (SIASA-HUB pattern)
FROM node:24-alpine

# Install build dependencies for TypeScript/tsx
RUN apk add --no-cache dumb-init python3 make g++ wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy root workspace config
COPY package.json package-lock.json tsconfig.base.json ./

# Copy ALL workspace package.json files (including shared) before install
# This ensures npm workspace resolution works correctly
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY shared/package.json ./shared/

# Copy service package.json
COPY services/api-gateway/package.json ./services/api-gateway/

# Install ALL dependencies (respecting package-lock.json)
RUN npm config set fetch-timeout 600000 && npm install --omit=optional

# Copy source code
COPY services/configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY services/app-global/ ./services/app-global/
COPY services/api-gateway/ ./services/api-gateway/

# Build shared packages (critical for TypeScript imports)
RUN cd packages/shared-config && npm run build
RUN cd packages/shared-logger && npm run build
RUN cd packages/shared-services && npm run build
RUN cd packages/shared-utils && npm run build

# Set ownership
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start application
CMD ["node", "services/api-gateway/server.js"]
