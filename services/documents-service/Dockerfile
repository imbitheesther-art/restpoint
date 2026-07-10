# RestPoint Documents Service — Clean Dockerfile
FROM node:24-alpine

RUN apk add --no-cache dumb-init wget

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /usr/src/app

COPY package.json tsconfig.base.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY services/documents-service/package.json ./services/documents-service/

RUN yarn config set network-timeout 600000 && yarn install --no-lockfile --network-timeout 600000 && yarn cache clean

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY app-global/ ./global/


COPY services/documents-service/ ./services/documents-service/

RUN mkdir -p /usr/src/app/uploads && chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/documents-service/server.js"]

