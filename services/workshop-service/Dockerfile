
# Production Dockerfile for Notification Service
FROM node:24-alpine

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
COPY services/workshop-service/package.json ./services/workshop-service/

# Install ALL dependencies 
# Increase network timeout to handle slow connections
RUN yarn config set network-timeout 600000 && yarn install --no-lockfile --network-timeout 600000 && yarn cache clean

# Copy shared source modules first
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Build shared packages first (CRITICAL for TypeScript imports!)

# Copy service source code
COPY services/workshop-service/ ./services/workshop-service/



RUN mkdir -p /usr/src/app/data && chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user

USER nodejs

EXPOSE 6969
ENV NODE_ENV=production
ENV PORT=6969

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:6969/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/workshop-service/dist/server.js"]


