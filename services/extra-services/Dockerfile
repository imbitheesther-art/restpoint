# RestPoint Extra Services — Minimal Dockerfile
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY services/extra-services/package.json ./

# Install dependencies
RUN npm install --no-audit --no-fund --production

# Copy application code
COPY services/extra-services/server.js ./
COPY configurations/ ./configurations/

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node server.js & sleep 2 && kill %1 && exit 0 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]