FROM node:22-alpine
WORKDIR /usr/src/app

# Copy monorepo root files
COPY package.json tsconfig.base.json ./

# Copy shared packages
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Copy service package.json
COPY services/api-gateway/package.json ./services/api-gateway/

# Install dependencies with retry configuration
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install --omit=dev --legacy-peer-deps && \
    npm cache clean --force

# Copy monorepo structure
COPY packages/ ./packages/
COPY services/api-gateway/ ./services/api-gateway/

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/api-gateway/server.js"]