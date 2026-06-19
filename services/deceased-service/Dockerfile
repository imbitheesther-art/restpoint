FROM node:20-alpine
WORKDIR /usr/src/app

# Copy package management files
COPY package.json yarn.lock ./
COPY services/shared-config/package.json ./services/shared-config/
COPY services/shared-logger/package.json ./services/shared-logger/
COPY services/shared-utils/package.json ./services/shared-utils/
COPY services/shared-services/package.json ./services/shared-services/
COPY services/deceased-service/package.json ./services/deceased-service/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Build shared packages first
RUN cd services/shared-config && yarn build || npm run build || true
RUN cd services/shared-logger && yarn build || npm run build || true
RUN cd services/shared-utils && yarn build || npm run build || true
RUN cd services/shared-services && yarn build || npm run build || true

# Build the deceased-service
RUN cd services/deceased-service && yarn build || npm run build

# Prune dev dependencies
RUN yarn install --production --frozen-lockfile

EXPOSE 5000
ENV PORT=5000
CMD ["node", "services/deceased-service/dist/server.js"]