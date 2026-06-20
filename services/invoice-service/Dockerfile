FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package.json files for workspace resolution
COPY package.json tsconfig.base.json ./
COPY services/invoice-service/package.json ./services/invoice-service/package.json
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Install ALL dependencies (including dev for building)
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy shared modules
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# BUILD shared packages first (CRITICAL!)
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Install production dependencies only (after building)
RUN npm prune --omit=dev

# Copy service source code
COPY services/invoice-service/ ./services/invoice-service/

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/invoice-service/server.js"]