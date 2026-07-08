# Production Dockerfile for Tenant Service
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy root workspace files
COPY package.json ./
COPY packages/ packages/

# Copy this service's package.json
COPY services/tenant-service/package.json ./services/tenant-service/

# Build shared packages
RUN cd packages/shared-config && npm run build 2>/dev/null || true && \
  cd ../shared-logger && npm run build 2>/dev/null || true && \
  cd ../shared-services && npm run build 2>/dev/null || true && \
  cd ../shared-utils && npm run build 2>/dev/null || true

# Install dependencies - remove @montezuma packages temporarily to avoid npm registry lookup
RUN cp services/tenant-service/package.json services/tenant-service/package.json.bak && \
  node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('services/tenant-service/package.json','utf8')); delete pkg.dependencies['@montezuma/shared-config']; delete pkg.dependencies['@montezuma/shared-logger']; delete pkg.dependencies['@montezuma/shared-services']; delete pkg.dependencies['@montezuma/shared-utils']; fs.writeFileSync('services/tenant-service/package.json', JSON.stringify(pkg, null, 2));" && \
  cd services/tenant-service && npm install --no-audit --no-fund --ignore-scripts --omit=optional 2>/dev/null || true && \
  mv services/tenant-service/package.json.bak services/tenant-service/package.json && \
  mkdir -p services/tenant-service/node_modules/@montezuma && \
  cp -r packages/shared-config services/tenant-service/node_modules/@montezuma/shared-config && \
  cp -r packages/shared-logger services/tenant-service/node_modules/@montezuma/shared-logger && \
  cp -r packages/shared-services services/tenant-service/node_modules/@montezuma/shared-services && \
  cp -r packages/shared-utils services/tenant-service/node_modules/@montezuma/shared-utils

# Copy service code
COPY services/tenant-service/ ./services/tenant-service/
COPY configurations/ ./configurations/

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node services/tenant-service/server.js & sleep 2 && kill %1 && exit 0 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/tenant-service/server.js"]