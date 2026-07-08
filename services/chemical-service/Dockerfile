# Production Dockerfile for Chemical Service
FROM node:22-alpine

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy all package.json files first for better layer caching
COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/chemical-service/package.json ./services/chemical-service/

# Copy package source files before installing dependencies
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/
COPY configurations/ ./configurations/
COPY services/chemical-service/ ./services/chemical-service/

# Install dependencies
RUN npm install --legacy-peer-deps && npm cache clean --force

# Build shared packages if they have build scripts
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

RUN mkdir -p /usr/src/app/data && chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/chemical-service/server.js"]