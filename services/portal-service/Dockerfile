FROM node:20-alpine

WORKDIR /usr/src/app

COPY services/portal-service/package.json ./
RUN npm install --production

COPY services/portal-service/ .

EXPOSE 5019

CMD ["node", "server.js"]