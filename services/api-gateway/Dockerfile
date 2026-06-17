# ============================================
# RestPoint Gateway — Multi-stage Docker Build
# ============================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Create workspace directory structure so yarn can resolve all workspaces
COPY package.json ./
COPY services/api-gateway/package.json ./services/api-gateway/
RUN mkdir -p packages/shared-config packages/shared-logger packages/shared-services packages/shared-utils && \
    echo '{"name":"@montezuma/shared-config","version":"1.0.0"}' > packages/shared-config/package.json && \
    echo '{"name":"@montezuma/shared-logger","version":"1.0.0"}' > packages/shared-logger/package.json && \
    echo '{"name":"@montezuma/shared-services","version":"1.0.0"}' > packages/shared-services/package.json && \
    echo '{"name":"@montezuma/shared-utils","version":"1.0.0"}' > packages/shared-utils/package.json

# Copy tsconfig
COPY tsconfig.json tsconfig.base.json ./
COPY services/api-gateway/tsconfig.json ./services/api-gateway/

# Install dependencies
RUN yarn install --production=false

# Copy source code
COPY services/api-gateway/ ./services/api-gateway/

# Build
RUN cd services/api-gateway && npx tsc

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built artifacts from builder
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist

# Copy only the api-gateway package.json (no workspace deps needed)
COPY services/api-gateway/package.json ./services/api-gateway/

# Install production dependencies directly (no yarn workspace)
RUN cd services/api-gateway && npm install --omit=dev

# Copy env
COPY .env ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "services/api-gateway/dist/server.js"]