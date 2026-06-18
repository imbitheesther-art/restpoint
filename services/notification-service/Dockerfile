FROM node:18-alpine
WORKDIR /usr/src/app

# Copy root workspace config first
COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/notification-service/package.json ./services/notification-service/

# Install all workspace dependencies
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy shared modules
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Copy service source code
COPY services/notification-service/ ./services/notification-service/

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/notification-service/server.js"]