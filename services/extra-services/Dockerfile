FROM node:18-alpine
WORKDIR /usr/src/app

COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/extra-services/package.json ./services/extra-services/

RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/

COPY services/extra-services/ ./services/extra-services/

EXPOSE 8014
ENV PORT=8014
CMD ["node", "services/extra-services/server.js"]