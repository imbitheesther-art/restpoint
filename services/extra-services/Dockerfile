# RestPoint Extra Services — Clean Dockerfile
FROM node:22-alpine

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy package files
COPY package.json tsconfig.base.json ./
COPY services/extra-services/package.json ./services/extra-services/

# Install dependencies
RUN npm install --no-audit --no-fund --omit=optional || npm install --no-audit --no-fund

# Copy source code
COPY configurations/ ./configurations/
COPY global/ ./global/
COPY services/extra-services/ ./services/extra-services/

# Create data directory
RUN mkdir -p /usr/src/app/data && chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/extra-services/server.js"]
