FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY services/qrcode-service/package.json ./services/qrcode-service/package.json
RUN cd services/qrcode-service && npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 10 && \
    npm install --omit=dev

# Copy shared modules (needed by configurations/sqlConfig/db.js)
COPY shared/ ./shared/
COPY global/ ./global/
COPY configurations/ ./configurations/
COPY packages/ ./packages/

# Copy service source code
COPY services/qrcode-service/ ./services/qrcode-service/

# Copy startup script
COPY scripts/docker-startup.sh ./scripts/docker-startup.sh
RUN chmod +x ./scripts/docker-startup.sh

EXPOSE 8012
ENV PORT=8012

ENTRYPOINT ["/usr/src/app/scripts/docker-startup.sh"]
CMD ["node", "services/qrcode-service/server.js"]