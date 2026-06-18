FROM node:18-alpine
WORKDIR /usr/src/app

COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/mpesa-service/package.json ./services/mpesa-service/

RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

COPY services/mpesa-service/ ./services/mpesa-service/

EXPOSE 8009
ENV PORT=8009
CMD ["node", "services/mpesa-service/server.js"]