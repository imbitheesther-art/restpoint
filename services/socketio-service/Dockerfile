FROM node:22-alpine
WORKDIR /usr/src/app

# Copy root workspace config and service package.json
COPY package.json tsconfig.base.json ./
COPY services/socketio-service/package.json ./services/socketio-service/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Install ALL dependencies (including dev for building)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# BUILD shared packages first (CRITICAL!)
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Install production dependencies only (after building)
RUN npm prune --omit=dev

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/socketio-service/server.js"]