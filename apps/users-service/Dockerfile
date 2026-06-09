FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8003

# Start application
CMD ["npm", "start"]
