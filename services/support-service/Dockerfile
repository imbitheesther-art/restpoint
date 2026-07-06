FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 8111

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8111/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start the service
CMD ["node", "server.js"]