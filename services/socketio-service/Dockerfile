FROM node:22-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000
ENV PORT=5000
CMD ["node", "server.js"]
