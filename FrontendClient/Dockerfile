# Multi-stage build for React frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY client/ .

# Build the React app
RUN npm run build

# Production image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]