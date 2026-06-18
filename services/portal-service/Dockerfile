FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json files for workspace resolution
COPY package.json tsconfig.base.json ./
COPY services/portal-service/package.json ./services/portal-service/package.json
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Install dependencies
RUN npm install --production --legacy-peer-deps && npm cache clean --force

# Copy shared modules
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Copy service source code
COPY services/portal-service/ ./services/portal-service/

EXPOSE 5019

CMD ["node", "services/portal-service/server.js"]
