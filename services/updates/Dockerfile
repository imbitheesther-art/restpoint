FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY services/updates/package.json ./services/updates/package.json
RUN cd services/updates && npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install --omit=dev

# Copy shared modules (needed by configurations/sqlConfig/db.js)
COPY shared/ ./shared/
COPY global/ ./global/
COPY configurations/ ./configurations/
COPY packages/ ./packages/

# Copy service source code
COPY services/updates/ ./services/updates/

# Copy startup script
COPY scripts/docker-startup.sh ./scripts/docker-startup.sh
RUN chmod +x ./scripts/docker-startup.sh

EXPOSE 5017
ENV PORT=5017

ENTRYPOINT ["/usr/src/app/scripts/docker-startup.sh"]
CMD ["node", "services/updates/sendNotificationUpdates.js"]