#!/bin/bash

# RestPoint Monitoring Stack - Quick Start Script
# This script starts the complete monitoring stack

echo "=========================================="
echo "RestPoint Monitoring Stack"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker compose is available (Docker Compose V2)
if ! docker compose version &> /dev/null; then
    echo "❌ Error: docker compose is not installed."
    exit 1
fi

echo "✅ docker compose is available"
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p prometheus/alerts
mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/dashboards
mkdir -p blackbox-exporter
mkdir -p loki
mkdir -p promtail

echo "✅ Directories created"
echo ""

# Start the monitoring stack
echo "🚀 Starting monitoring services..."
docker compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
echo "----------------------------------------"
docker compose ps

echo ""
echo "=========================================="
echo "Monitoring Stack Started!"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  Grafana:      http://localhost:3001 (admin / admin123)"
echo "  Prometheus:   http://localhost:9090"
echo "  Uptime Kuma:  http://localhost:3002"
echo "  cAdvisor:     http://localhost:8080"
echo "  Loki:         http://localhost:3100"
echo ""
echo "Next Steps:"
echo "  1. Access Grafana and import dashboards (see README.md for dashboard IDs)"
echo "  2. Configure Uptime Kuma with your notification preferences"
echo "  3. Add custom metrics to your application (see README.md)"
echo "  4. Set up alerts in Grafana"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop:      docker compose down"
echo ""