# ============================================
# Rest Point — Frontend Dockerfile (OPTIMIZED)
# BuildKit caching, multi-stage, fast builds
# ============================================
          
# Stage 1: Dependencies - cache layer
FROM node:20-alpine AS deps
LABEL stage=deps         

WORKDIR /app

# Copy only dependency files (cached layer)
COPY package.json yarn.lock ./

# Install with yarn for reproducibility
RUN yarn install --frozen-lockfile --prefer-offline || \
    yarn install --prefer-offline

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app
  
# Copy node_modules from deps stage (cached)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock

# Copy source code
COPY . .

# Build the application (uses cached node_modules)
RUN npm run build
    
# Stage 3: Production with nginx
FROM nginx:alpine AS production
  
# Install certbot for SSL (optional)
RUN apk add --no-cache certbot certbot-nginx
  
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
  
# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
  
# Expose port 80 (nginx listens on 80 inside container)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]