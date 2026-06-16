FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy workspace-level config files
COPY package.json tsconfig.json tsconfig.base.json ./

# Copy all workspace package.json files for proper resolution
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY services/deceased-service/package.json ./services/deceased-service/

RUN npm install

COPY . .
RUN cd services/deceased-service && npx tsc

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/src/app/services/deceased-service/dist ./dist
EXPOSE 8004
ENV PORT=8004
CMD ["node", "dist/server.js"]