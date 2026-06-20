FROM node:20-alpine
WORKDIR /usr/src/app

# Copy root workspace config first
COPY package.json tsconfig.base.json ./

# Copy shared package.json files
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Copy service package.json
COPY services/auth-service/package.json ./services/auth-service/

# Install ALL dependencies (including dev for building shared packages)
# Use npm install (not ci) since we didn't copy package-lock.json for monorepo root
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy shared source modules first
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Build shared packages first (CRITICAL for TypeScript imports!)
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Copy service source code
COPY services/auth-service/ ./services/auth-service/

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/auth-service/server.js"]