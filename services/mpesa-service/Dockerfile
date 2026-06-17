FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY services/mpesa-service/package.json ./services/mpesa-service/package.json
RUN cd services/mpesa-service && npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install --omit=dev

# Copy shared modules
COPY shared/ ./shared/
COPY global/ ./global/
COPY packages/ ./packages/

# Copy service source code
COPY services/mpesa-service/ ./services/mpesa-service/

# Copy startup script
COPY scripts/docker-startup.sh ./scripts/docker-startup.sh
RUN chmod +x ./scripts/docker-startup.sh

EXPOSE 8007
ENV PORT=8007

ENTRYPOINT ["/usr/src/app/scripts/docker-startup.sh"]
CMD ["node", "services/mpesa-service/server.js"]