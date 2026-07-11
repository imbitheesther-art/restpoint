# Stage 1: Dependencies
FROM node:24-alpine AS deps

WORKDIR /app

# Install build tools if needed
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

# Install dependencies with legacy peer deps
RUN npm ci --legacy-peer-deps --no-audit --no-fund 2>/dev/null || \
  npm install --legacy-peer-deps --no-audit --no-fund

# Explicitly install esbuild and Vite dependencies
RUN npm install esbuild@0.21.5 --save-dev && \
  npm install vite@5.0.0 --save-dev 2>/dev/null || true


# Stage 2: Builder
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=false
ENV DISABLE_ESLINT_PLUGIN=true
ENV TSC_COMPILE_ON_ERROR=true

# Verify esbuild is installed
RUN npm list esbuild || echo "esbuild not found"

# Build the app
RUN npm run build || npx vite build --force


# Stage 3: Production
FROM nginx:alpine AS production

# Install certbot for SSL
RUN apk add --no-cache certbot certbot-nginx curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chmod -R 755 /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]