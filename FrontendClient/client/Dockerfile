# Stage 1: Dependencies
FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# Use npm install instead of ci for more flexibility
RUN npm install --legacy-peer-deps


# Stage 2: Builder
FROM node:24-alpine AS builder

WORKDIR /app

# Copy everything from deps
COPY --from=deps /app ./

# Copy source code
COPY . .

# Explicitly install esbuild and all needed deps
RUN npm install --legacy-peer-deps && \
  npm install esbuild@0.21.5 --save-dev && \
  npm install vite@5.4.0 --save-dev

# Build the app
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS production

RUN apk add --no-cache certbot certbot-nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]