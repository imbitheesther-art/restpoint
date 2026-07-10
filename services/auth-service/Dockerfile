# RestPoint Auth Service — Clean Dockerfile (SIASA-HUB pattern)
FROM node:24-alpine

# Install runtime dependencies
RUN apk add --no-cache dumb-init wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy root workspace config
COPY package.json tsconfig.base.json ./

# Copy shared package.json files
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Copy service package.json
COPY services/auth-service/package.json ./services/auth-service/

# Install ALL dependencies (including dev for building shared packages)
RUN yarn config set network-timeout 600000 && yarn install --no-lockfile --network-timeout 600000 && yarn cache clean

# Copy source code
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY app-global/ ./global/
COPY services/auth-service/ ./services/auth-service/

# Build shared packages (critical for TypeScript imports)
RUN cd packages/shared-config && yarn build
RUN cd packages/shared-logger && yarn build
RUN cd packages/shared-services && yarn build
RUN cd packages/shared-utils && yarn build

# Create data directory
RUN mkdir -p /usr/src/app/data && chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/auth-service/server.js"]

