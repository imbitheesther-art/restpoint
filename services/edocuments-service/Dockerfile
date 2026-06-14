FROM node:20-alpine

WORKDIR /usr/src/app

# Install build dependencies for sharp
RUN apk add --no-cache python3 make g++ vips-dev

COPY services/edocuments-service/package.json ./
RUN npm install --production

COPY services/edocuments-service/ .

# Create uploads directories
RUN mkdir -p uploads/_templates uploads/_documents

EXPOSE 8116

CMD ["node", "server.js"]