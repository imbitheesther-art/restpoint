FROM node:18-alpine
WORKDIR /usr/src/app

# Copy root workspace config first
COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY services/analytics-service/package.json ./services/analytics-service/

# Install all workspace dependencies
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy shared modules
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Copy service source code
COPY services/analytics-service/ ./services/analytics-service/

EXPOSE 8013
ENV PORT=8013
CMD ["node", "services/analytics-service/server.js"]