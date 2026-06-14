# ============================================
# Rest Point — Frontend Dockerfile
# Production: app.restpoint.co.ke:8082
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production with nginx
FROM nginx:alpine AS production

# Install certbot for SSL (optional)
RUN apk add --no-cache certbot certbot-nginx

# Copy custom nginx config (listens on port 8082)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8082 (frontend production port)
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8082/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]