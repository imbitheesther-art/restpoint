FROM node:20-alpine

WORKDIR /usr/src/app

# Step 1: Copy and install chemical service dependencies
COPY services/chemical-service/package.json ./services/chemical-service/package.json
RUN cd services/chemical-service && npm install --production

# Step 2: Copy shared modules needed by the service
COPY shared/ ./shared/
COPY global/ ./global/
COPY packages/ ./packages/

# Step 3: Copy all service files
COPY services/chemical-service/ ./services/chemical-service/

# Step 4: Copy the startup script
COPY scripts/docker-startup.sh ./scripts/docker-startup.sh
RUN chmod +x ./scripts/docker-startup.sh

EXPOSE 5105

ENTRYPOINT ["/usr/src/app/scripts/docker-startup.sh"]
CMD ["node", "services/chemical-service/server.js"]