FROM node:18-alpine
WORKDIR /usr/src/app

COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/marketplace-service/package.json ./services/marketplace-service/

RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

COPY services/marketplace-service/ ./services/marketplace-service/

EXPOSE 8020
ENV PORT=8020
CMD ["node", "services/marketplace-service/server.js"]