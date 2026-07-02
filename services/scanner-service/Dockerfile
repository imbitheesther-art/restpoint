# Build stage
FROM golang:1.25-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

# Set working directory
WORKDIR /app

# Configure Go module behavior for local builds without go.sum
ENV GONOSUMDB=* GOFLAGS=-mod=mod GOTOOLCHAIN=auto

# Copy go mod files first to cache deps
COPY services/scanner-service/go.mod ./

# Tidy & download dependencies (generates go.sum from imports)
RUN go mod tidy && go mod download

# Copy source code
COPY services/scanner-service/cmd/ ./cmd/
COPY services/scanner-service/internal/ ./internal/
COPY services/scanner-service/pkg/ ./pkg/

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o scanner-service ./cmd/server/

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata
ENV TZ=Africa/Nairobi

# Create appuser
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /home/appuser

# Copy binary from builder
COPY --from=builder --chown=appuser:appgroup /app/scanner-service .

# Create uploads directory
RUN mkdir -p /home/appuser/uploads/scanned && \
    chown -R appuser:appgroup /home/appuser/uploads

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 2024

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:2024/health || exit 1

# Run the application
CMD ["./scanner-service"]