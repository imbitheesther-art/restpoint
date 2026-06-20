FROM node:20-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/deceased-service/package.json ./services/deceased-service/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build shared packages first
RUN cd packages/shared-config && npm run build || true
RUN cd packages/shared-logger && npm run build || true
RUN cd packages/shared-utils && npm run build || true
RUN cd packages/shared-services && npm run build || true

# Install ts-node
RUN npm install -g ts-node

# Create a symlink for shared folder (makes imports work at runtime)
RUN ln -sf /usr/src/app/shared /usr/src/app/services/deceased-service/shared 2>/dev/null || true

EXPOSE 5000
ENV PORT=5000

# Run with ts-node --transpile-only (removed unsupported --ignore-warnings flag)
CMD ["npx", "ts-node", "--transpile-only", "services/deceased-service/server.ts"]