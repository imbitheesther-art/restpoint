# RestPoint Deceased Service — Clean Dockerfile
FROM node:22-alpine

RUN apk add --no-cache dumb-init python3 make g++ wget

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /usr/src/app

COPY package.json tsconfig.base.json ./
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-services/package.json ./packages/shared-services/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY services/deceased-service/package.json ./services/deceased-service/

RUN yarn install --no-lockfile && yarn cache clean

COPY configurations/ ./configurations/
COPY packages/ ./packages/
COPY shared/ ./shared/
COPY global/ ./global/
COPY services/deceased-service/ ./services/deceased-service/

# Build shared packages in dependency order (shared-config → shared-logger → shared-utils → shared-services)

# Install tsx for running TypeScript directly (server.ts entry point)
RUN yarn global add tsx

RUN mkdir -p /usr/src/app/services/deceased-service/uploads && chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["tsx", "services/deceased-service/server.ts"]

