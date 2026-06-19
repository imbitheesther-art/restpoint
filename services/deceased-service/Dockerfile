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

# Build the deceased-service with skipLibCheck
RUN cd services/deceased-service && npx tsc --skipLibCheck

# Prune dev dependencies
RUN npm prune --omit=dev

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/deceased-service/dist/server.js"]