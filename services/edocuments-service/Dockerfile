FROM node:18-alpine
WORKDIR /usr/src/app

COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/edocuments-service/package.json ./services/edocuments-service/

RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

COPY services/edocuments-service/ ./services/edocuments-service/

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/edocuments-service/server.js"]