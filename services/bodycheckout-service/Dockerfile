# Production Dockerfile for Body Checkout Service
FROM node:20-alpine

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy root workspace files
COPY package.json tsconfig.base.json ./
COPY packages/ packages/

# Copy this service's package.json
COPY services/bodycheckout-service/package.json ./services/bodycheckout-service/

# Build shared packages
RUN cd packages/shared-config && npm run build 2>/dev/null || true && \
  cd ../shared-logger && npm run build 2>/dev/null || true && \
  cd ../shared-services && npm run build 2>/dev/null || true && \
  cd ../shared-utils && npm run build 2>/dev/null || true

# Install dependencies - remove @montezuma packages temporarily to avoid npm registry lookup
RUN cd services/bodycheckout-service && \
  cp package.json package.json.bak && \
  node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); delete pkg.dependencies['@montezuma/shared-config']; delete pkg.dependencies['@montezuma/shared-logger']; delete pkg.dependencies['@montezuma/shared-services']; delete pkg.dependencies['@montezuma/shared-utils']; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" && \
  npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts --omit=optional 2>/dev/null || true && \
  mv package.json.bak package.json && \
  mkdir -p node_modules/@montezuma && \
  cp -r packages/shared-config node_modules/@montezuma/shared-config && \
  cp -r packages/shared-logger node_modules/@montezuma/shared-logger && \
  cp -r packages/shared-services node_modules/@montezuma/shared-services && \
  cp -r packages/shared-utils node_modules/@montezuma/shared-utils

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

RUN mkdir -p /usr/src/app/data && chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/bodycheckout-service/server.js"]