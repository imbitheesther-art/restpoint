FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package.json files for workspace resolution
COPY package.json tsconfig.base.json ./
COPY services/invoice-service/package.json ./services/invoice-service/package.json
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/

# Install dependencies
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy shared modules
COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

# Copy service source code
COPY services/invoice-service/ ./services/invoice-service/

EXPOSE 8006
ENV PORT=8006
CMD ["node", "services/invoice-service/server.js"]
