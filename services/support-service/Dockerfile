# RestPoint Support Service — Clean Dockerfile (SIASA-HUB pattern)
FROM node:24-alpine

# Install build dependencies for TypeScript/tsx
RUN apk add --no-cache dumb-init python3 make g++ wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app/support-service

# Copy root workspace config
COPY package.json package-lock.json tsconfig.base.json ./

# Copy shared package.json files
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# Copy service package.json
COPY services/support-service/package.json ./services/support-service/

# Install ALL dependencies (including dev for building)
RUN npm install --omit=optional

# Copy source code
COPY services/configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY services/app-global/ ./services/app-global/
COPY services/support-service/ ./services/support-service/

# Build shared packages (critical for TypeScript imports)
RUN cd packages/shared-config && npm run build
RUN cd packages/shared-logger && npm run build
RUN cd packages/shared-services && npm run build
RUN cd packages/shared-utils && npm run build

# Install tsx for running TypeScript directly
RUN npm install -g tsx

# Create uploads directory
RUN mkdir -p /usr/src/app/uploads && chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start application with dumb-init
# Initialize database first, then start the server
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node services/support-service/init-db.js && node services/support-service/server.js"]
