#!/bin/bash
# ============================================
# RestPoint Complete Monitoring Setup Script
# ============================================
# This script sets up EVERYTHING needed for full observability
# Run on your server: bash setup-complete-monitoring.sh
# ============================================

set -e

HOST_IP="84.247.183.53"
MONITORING_DIR="/opt/restpoint/monitoring"

echo "=========================================="
echo "RestPoint Complete Monitoring Setup"
echo "=========================================="
echo ""

# ============================================
# STEP 1: Add Exporters to Docker Compose
# ============================================
echo "📦 Step 1: Adding database/cache/queue exporters..."

cat >> docker-compose.yml << 'EOF'

  # ============================================
  # MYSQL EXPORTER - Database Metrics
  # ============================================
  mysql-exporter:
    image: prom/mysqld-exporter:latest
    container_name: restpoint-mysql-exporter
    restart: always
    ports:
      - "9104:9104"
    environment:
      - DATA_SOURCE_NAME=exporter:exporter_password@(mariadb:3306)/
    networks:
      - monitoring
    depends_on:
      - mariadb

  # ============================================
  # REDIS EXPORTER - Cache Metrics
  # ============================================
  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: restpoint-redis-exporter
    restart: always
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis:6379
      - REDIS_PASSWORD=
    networks:
      - monitoring
    depends_on:
      - redis

  # ============================================
  # RABBITMQ EXPORTER - Message Queue Metrics
  # ============================================
  rabbitmq-exporter:
    image: kbudde/rabbitmq-exporter:latest
    container_name: restpoint-rabbitmq-exporter
    restart: always
    ports:
      - "9419:9419"
    environment:
      - RABBIT_URL=http://rabbitmq:15672
      - RABBIT_USER=guest
      - RABBIT_PASSWORD=guest
      - PUBLISH_PORT=9419
    networks:
      - monitoring
    depends_on:
      - rabbitmq

  # ============================================
  # PROCESS EXPORTER - Process-level metrics
  # ============================================
  process-exporter:
    image: ncabatoff/process-exporter:latest
    container_name: restpoint-process-exporter
    restart: always
    ports:
      - "9256:9256"
    volumes:
      - ./process-exporter/config.yml:/config/config.yml
      - /proc:/host/proc:ro
    command:
      - '--config.path=/config/config.yml'
      - '--procfs=/host/proc'
    networks:
      - monitoring
EOF

echo "✅ Exporters added to docker-compose.yml"

# ============================================
# STEP 2: Create Process Exporter Config
# ============================================
echo "📝 Step 2: Creating process exporter config..."

mkdir -p process-exporter
cat > process-exporter/config.yml << 'EOF'
process_names:
  - name: "{{.Comm}}"
    cmdline:
    - '.+'
EOF

echo "✅ Process exporter config created"

# ============================================
# STEP 3: Create MySQL Exporter DB User
# ============================================
echo "🗄️ Step 3: Creating MySQL exporter user..."

docker exec restpoint_mariadb mysql -u root -p"${MYSQL_ROOT_PASSWORD:-root}" -e "
  CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY 'exporter_password' WITH MAX_USER_CONNECTIONS 3;
  GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
  FLUSH PRIVILEGES;
" 2>/dev/null || echo "⚠️ Could not create MySQL user - create manually: GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%' IDENTIFIED BY 'exporter_password';"

echo "✅ MySQL exporter user configured"

# ============================================
# STEP 4: Update Prometheus Config with All Exporters
# ============================================
echo "📊 Step 4: Updating Prometheus config with all exporters..."

cat > prometheus/prometheus.yml << PROMEOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'restpoint-monitor'
    environment: 'production'

# Load alerting rules
rule_files:
  - '/etc/prometheus/alerts/*.yml'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: []

scrape_configs:
  # ============================================
  # PROMETHEUS SELF
  # ============================================
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # ============================================
  # NODE EXPORTER - Full Server Hardware
  # ============================================
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['${HOST_IP}:9100']
        labels:
          service: 'node-exporter'
          component: 'server'

  # ============================================
  # CADVISOR - Full Container Metrics
  # ============================================
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['${HOST_IP}:8081']
        labels:
          service: 'cadvisor'
          component: 'containers'

  # ============================================
  # MYSQL EXPORTER - Database Metrics
  # ============================================
  - job_name: 'mysql'
    static_configs:
      - targets: ['${HOST_IP}:9104']
        labels:
          service: 'mysql'
          component: 'database'

  # ============================================
  # REDIS EXPORTER - Cache Metrics
  # ============================================
  - job_name: 'redis'
    static_configs:
      - targets: ['${HOST_IP}:9121']
        labels:
          service: 'redis'
          component: 'cache'

  # ============================================
  # RABBITMQ EXPORTER - Message Queue Metrics
  # ============================================
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['${HOST_IP}:9419']
        labels:
          service: 'rabbitmq'
          component: 'queue'

  # ============================================
  # PROCESS EXPORTER - Process Metrics
  # ============================================
  - job_name: 'process-exporter'
    static_configs:
      - targets: ['${HOST_IP}:9256']
        labels:
          service: 'process-exporter'
          component: 'processes'

  # ============================================
  # BLACKBOX EXPORTER
  # ============================================
  - job_name: 'blackbox'
    static_configs:
      - targets: ['blackbox-exporter:9115']
    metrics_path: /probe
    params:
      module: [http_2xx]
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115

  # ============================================
  # ALL MICROSERVICES
  # ============================================
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['${HOST_IP}:5000']
        labels: { service: 'api-gateway', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'auth-service'
    static_configs:
      - targets: ['${HOST_IP}:5001']
        labels: { service: 'auth-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'tenant-service'
    static_configs:
      - targets: ['${HOST_IP}:5002']
        labels: { service: 'tenant-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'deceased-service'
    static_configs:
      - targets: ['${HOST_IP}:5003']
        labels: { service: 'deceased-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'invoice-service'
    static_configs:
      - targets: ['${HOST_IP}:5005']
        labels: { service: 'invoice-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'coffin-service'
    static_configs:
      - targets: ['${HOST_IP}:5006']
        labels: { service: 'coffin-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'analytics-service'
    static_configs:
      - targets: ['${HOST_IP}:5009']
        labels: { service: 'analytics-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'documents-service'
    static_configs:
      - targets: ['${HOST_IP}:5011']
        labels: { service: 'documents-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'bodycheckout-service'
    static_configs:
      - targets: ['${HOST_IP}:5015']
        labels: { service: 'bodycheckout-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'extra-services'
    static_configs:
      - targets: ['${HOST_IP}:5016']
        labels: { service: 'extra-services', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'leave-service'
    static_configs:
      - targets: ['${HOST_IP}:5017']
        labels: { service: 'leave-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'socketio-service'
    static_configs:
      - targets: ['${HOST_IP}:5018']
        labels: { service: 'socketio-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'billing-service'
    static_configs:
      - targets: ['${HOST_IP}:5020']
        labels: { service: 'billing-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'hearse-service'
    static_configs:
      - targets: ['${HOST_IP}:5023']
        labels: { service: 'hearse-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'chemical-service'
    static_configs:
      - targets: ['${HOST_IP}:5105']
        labels: { service: 'chemical-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'notification-service'
    static_configs:
      - targets: ['${HOST_IP}:5111']
        labels: { service: 'notification-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'workshop-service'
    static_configs:
      - targets: ['${HOST_IP}:6969']
        labels: { service: 'workshop-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'support-service'
    static_configs:
      - targets: ['${HOST_IP}:8111']
        labels: { service: 'support-service', component: 'application' }
    metrics_path: '/metrics'

  - job_name: 'frontend'
    static_configs:
      - targets: ['${HOST_IP}:8080']
        labels: { service: 'frontend', component: 'application' }
    metrics_path: '/metrics'

  # ============================================
  # BLACKBOX HTTP CHECKS - External Monitoring
  # ============================================
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - 'http://${HOST_IP}:5000/health'
          - 'http://${HOST_IP}:5001/health'
          - 'http://${HOST_IP}:5002/health'
          - 'http://${HOST_IP}:5003/health'
          - 'http://${HOST_IP}:8080'
          - 'https://restpoint.co.ke'
        labels:
          service: 'blackbox-checks'
          component: 'external'
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115

  - job_name: 'blackbox-ssl'
    metrics_path: /probe
    params:
      module: [http_2xx_ssl]
    static_configs:
      - targets:
          - 'https://restpoint.co.ke'
        labels:
          service: 'ssl-checks'
          component: 'ssl'
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115

  - job_name: 'blackbox-tcp'
    metrics_path: /probe
    params:
      module: [tcp_connect]
    static_configs:
      - targets:
          - '${HOST_IP}:3306'
          - '${HOST_IP}:6379'
          - '${HOST_IP}:5672'
          - '${HOST_IP}:15672'
        labels:
          service: 'tcp-checks'
          component: 'connectivity'
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
PROMEOF

echo "✅ Prometheus config updated with all exporters"

# ============================================
# STEP 5: Start All Services
# ============================================
echo "🚀 Step 5: Starting all monitoring services..."
docker compose up -d
sleep 10

echo ""
echo "✅ All services started. Verifying..."

# ============================================
# STEP 6: Verify Everything
# ============================================
echo ""
echo "=========================================="
echo "📊 VERIFICATION"
echo "=========================================="
echo ""

# Check all monitoring containers
echo "=== Monitoring Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "restpoint-|restpoint_"

echo ""
echo "=== Port Connectivity ==="
for port in 9090 3001 3002 8081 9100 9104 9121 9419 9115 9256 3100; do
  if curl -s -o /dev/null -w "%{http_code}" http://${HOST_IP}:$port/ 2>/dev/null | grep -q "200\|302\|301"; then
    echo "✅ Port $port - UP"
  else
    echo "❌ Port $port - DOWN"
  fi
done

echo ""
echo "=========================================="
echo "✅ COMPLETE MONITORING SETUP FINISHED!"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  Grafana:          http://${HOST_IP}:3001 (admin / admin123)"
echo "  Prometheus:       http://${HOST_IP}:9090"
echo "  Uptime Kuma:      http://${HOST_IP}:3002"
echo "  cAdvisor:         http://${HOST_IP}:8081"
echo "  Node Exporter:    http://${HOST_IP}:9100/metrics"
echo "  MySQL Exporter:   http://${HOST_IP}:9104/metrics"
echo "  Redis Exporter:   http://${HOST_IP}:9121/metrics"
echo "  RabbitMQ Exp:     http://${HOST_IP}:9419/metrics"
echo "  Blackbox Exp:     http://${HOST_IP}:9115/metrics"
echo "  Process Exp:      http://${HOST_IP}:9256/metrics"
echo "  Loki:             http://${HOST_IP}:3100"
echo ""
echo "Next Steps:"
echo "  1. Import Grafana dashboards (see README.md for dashboard IDs)"
echo "  2. Add /metrics endpoint to each microservice"
echo "  3. Configure Uptime Kuma monitors"
echo "  4. Set up alert notifications (Slack/Telegram/Email)"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop:      docker compose down"