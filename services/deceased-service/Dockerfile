FROM node:20-alpine
WORKDIR /usr/src/app

COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/deceased-service/package.json ./services/deceased-service/

# Install ALL dependencies (including dev for TypeScript compilation)
RUN npm install --legacy-peer-deps && npm cache clean --force

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

COPY services/deceased-service/ ./services/deceased-service/

# Build TypeScript
RUN npm run build --workspace=services/deceased-service

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/deceased-service/dist/server.js"]