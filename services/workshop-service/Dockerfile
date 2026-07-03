# Production Dockerfile for Workshop Service
FROM node:22-alpine

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy package files
COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/workshop-service/package.json ./services/workshop-service/

# Install dependencies
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy source code
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Build shared packages
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Copy workshop service code
COPY services/workshop-service/ ./services/workshop-service/

# Build TypeScript
RUN cd services/workshop-service && npm run build || true

# Create data directory and set permissions
RUN mkdir -p /usr/src/app/data && chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 6969
ENV NODE_ENV=production
ENV PORT=6969

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:6969/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/workshop-service/dist/server.js"]