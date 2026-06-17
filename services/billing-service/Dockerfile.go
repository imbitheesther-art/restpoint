FROM golang:1.21-alpine

WORKDIR /app

# Copy Go module files
COPY fallback-billing-go/go.mod ./
RUN go mod download

# Copy Go source
COPY fallback-billing-go/main.go ./

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o fallback-billing-go main.go

# Expose port
EXPOSE 5022

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5022/health || exit 1

# Start the Go fallback service
CMD ["./fallback-billing-go"]