# RestPoint Scanner Service - Minimal Dockerfile
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata dumb-init
ENV TZ=Africa/Nairobi

# Create appuser
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /home/appuser

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

# Run the application (placeholder - needs actual binary)
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "echo 'Scanner service - requires pre-built binary' && sleep infinity"]
