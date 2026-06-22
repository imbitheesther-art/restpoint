# RestPoint eDocuments Service — Clean Dockerfile
# Full QuickBooks replacement: invoices, receipts, Excel/CSV, PDF, canvas editing
FROM node:22-alpine

RUN apk add --no-cache dumb-init wget

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy root workspace config
COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/edocuments-service/package.json ./services/edocuments-service/

RUN yarn install --frozen-lockfile && yarn cache clean

# Copy shared source code
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Copy ONLY the Node.js server (NO PHP Laravel)
COPY services/edocuments-service/server.js ./services/edocuments-service/
COPY services/edocuments-service/uploads ./services/edocuments-service/uploads

# Create storage directories
RUN mkdir -p /usr/src/app/services/edocuments-service/data && \
    mkdir -p /usr/src/app/services/edocuments-service/uploads/_documents && \
    mkdir -p /usr/src/app/services/edocuments-service/uploads/_templates && \
    chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/edocuments-service/server.js"]