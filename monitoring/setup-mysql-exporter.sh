#!/bin/bash
# ============================================
# MySQL/MariaDB Exporter - Production Setup
# ============================================
# Run this on your production server
# ============================================

set -e

HOST_IP="84.247.183.53"

echo "=========================================="
echo "MySQL/MariaDB Exporter Setup"
echo "=========================================="
echo ""

# Step 1: Create the exporter user in MariaDB
echo "🗄️ Step 1: Creating exporter user in MariaDB..."

docker exec restpoint_mariadb mysql -u root -p -e "
  CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY 'exporter_password' WITH MAX_USER_CONNECTIONS 3;
  GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
  FLUSH PRIVILEGES;
  SELECT 'Exporter user created successfully' AS status;
"

echo "✅ Exporter user created"
echo ""

# Step 2: Start the MySQL exporter container
echo "📦 Step 2: Starting MySQL exporter container..."
cd /opt/restpoint/monitoring
docker compose up -d mysql-exporter
echo "✅ MySQL exporter started"
echo ""

# Step 3: Verify the exporter is collecting metrics
echo "🔍 Step 3: Verifying metrics..."
sleep 5
echo ""
echo "=== Connection count ==="
curl -s "http://${HOST_IP}:9104/metrics" | grep "mysql_global_status_threads_connected" | head -3

echo ""
echo "=== Query rate ==="
curl -s "http://${HOST_IP}:9104/metrics" | grep "mysql_global_status_queries" | head -3

echo ""
echo "=== Slow queries ==="
curl -s "http://${HOST_IP}:9104/metrics" | grep "mysql_global_status_slow_queries" | head -3

echo ""
echo "=== Buffer pool ==="
curl -s "http://${HOST_IP}:9104/metrics" | grep "mysql_global_status_innodb_buffer_pool_read" | head -3

echo ""
echo "=========================================="
echo "✅ MySQL Exporter is running!"
echo "=========================================="
echo ""
echo "Access MySQL metrics:"
echo "  Raw:  http://${HOST_IP}:9104/metrics"
echo ""
echo "In Grafana, import dashboard ID: 7362 (MySQL Overview)"
echo ""
echo "Key PromQL queries:"
echo "  Connections:    mysql_global_status_threads_connected"
echo "  Query rate:     rate(mysql_global_status_queries[5m])"
echo "  Slow queries:   rate(mysql_global_status_slow_queries[5m])"
echo "  Buffer pool:    mysql_global_status_innodb_buffer_pool_read_requests"
echo "  Deadlocks:      increase(mysql_global_status_innodb_deadlocks[5m])"