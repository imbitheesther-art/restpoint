# RestPoint Production Deployment Guide

**Status:** Production-Ready | **Last Updated:** 2026-06-18 | **Version:** 1.0.0

## Overview

RestPoint is a 22+ microservices SaaS mortuary management platform deployed on Docker Compose. This guide covers production deployment, monitoring, scaling, and operations.

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` to `.env` on production server
- [ ] Update ALL `CHANGE_THIS_*` passwords with strong values
- [ ] Generate strong JWT and internal secrets (minimum 32 characters)
- [ ] Update M-PESA production credentials
- [ ] Configure SMTP server for email notifications
- [ ] Update API URLs to production domain

### 2. Infrastructure Requirements
- [ ] **Compute:** 4+ CPU cores, 8GB+ RAM for full deployment
- [ ] **Storage:** 100GB+ for MariaDB + Redis + application data
- [ ] **Network:** Stable internet, DNS configured for domain
- [ ] **Docker:** v24.0+, Docker Compose v2.10+
- [ ] **OS:** Ubuntu 20.04 LTS or CentOS 8+

### 3. Security Pre-Checks
- [ ] Firewall configured to allow only necessary ports (80, 443, SSH)
- [ ] SSH keys configured for secure access
- [ ] SSL/TLS certificates ready (Let's Encrypt recommended)
- [ ] Database backups scheduled
- [ ] Monitoring and alerting configured

## Deployment Steps

### Step 1: Prepare Server

```bash
# SSH into production server
ssh root@your.server.ip

# Update system
apt-get update && apt-get upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
docker compose version
```

### Step 2: Clone & Configure

```bash
# Clone repository
cd /opt
git clone https://github.com/imbitheesther-art/restpoint.git
cd restpoint

# Configure environment
cp .env.production .env

# Edit .env with production credentials
nano .env
# Update ALL passwords, JWT secrets, SMTP config, etc.
```

### Step 3: Build & Deploy

```bash
# Use production compose file
export COMPOSE_FILE=docker-compose.prod.yml

# Build images (first time only, ~30 min)
docker compose build --no-cache

# Start services (with infrastructure first)
docker compose up -d

# Verify services started
docker compose ps

# Check logs for errors
docker compose logs -f api-gateway
```

### Step 4: Initialize Database

```bash
# Access MariaDB
docker compose exec mariadb mysql -uroot -p$DB_ROOT_PASSWORD

# Create initial schemas (if needed)
# Run any migration scripts from scripts/init-db/
```

### Step 5: SSL/TLS Configuration

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot certonly --standalone -d app.restpoint.co.ke

# Update nginx config with certificate paths
# Restart frontend container
docker compose restart frontend
```

### Step 6: Backup & Monitoring Setup

```bash
# Create backup script
cat > /opt/restpoint/scripts/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup MariaDB
docker compose exec -T mariadb mysqldump -uroot -p$DB_ROOT_PASSWORD --all-databases | gzip > $BACKUP_DIR/mariadb_$DATE.sql.gz

# Backup Redis
docker compose exec -T redis redis-cli --rdb /data/dump_$DATE.rdb

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
EOF

chmod +x /opt/restpoint/scripts/backup.sh

# Schedule daily backups at 2 AM
echo "0 2 * * * /opt/restpoint/scripts/backup.sh" | crontab -
```

## Monitoring & Operations

### Health Checks

```bash
# Check all services
docker compose ps

# Test API Gateway
curl -X GET http://localhost:5000/health

# Check database
docker compose exec mariadb mysql -uroot -p$DB_ROOT_PASSWORD -e "SELECT 1"

# Check Redis
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Check RabbitMQ
docker compose exec rabbitmq rabbitmq-diagnostics -q ping
```

### Logs

```bash
# Tail real-time logs
docker compose logs -f

# View specific service logs
docker compose logs -f api-gateway --tail 100

# Export logs for analysis
docker compose logs > logs-$(date +%Y%m%d).log
```

### Scaling Services

```bash
# Scale API Gateway to 3 instances (if using docker-compose.prod.yml)
docker compose up -d --scale api-gateway=3

# Scale Socket.IO for real-time connections
docker compose up -d --scale socketio-service=4
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
docker ps

# Verify image builds
docker images | grep restpoint

# Check resource limits
docker stats

# Inspect logs
docker compose logs api-gateway 2>&1 | grep -i error
```

### Database Connection Issues

```bash
# Verify MariaDB is healthy
docker compose exec mariadb healthcheck.sh --su-mysql --connect

# Check credentials
docker compose exec mariadb mysql -u$DB_USER -p$DB_PASSWORD -e "SELECT 1"

# Test from service container
docker compose exec api-gateway curl -X GET http://mariadb:3306
```

### High Memory Usage

```bash
# Check memory limits
docker stats

# Update resource limits in docker-compose.prod.yml
# Then restart service
docker compose up -d --no-deps api-gateway
```

### Port Already in Use

```bash
# Find what's using port
lsof -i :5000

# Kill process or change port in .env
KILL $(lsof -t -i :5000)
```

## Backup & Recovery

### Backup Schedule

- **Database:** Daily at 2 AM (via cron job)
- **Application Data:** Weekly (user uploads, documents)
- **Configuration:** Git repository (backed up automatically)

### Restore from Backup

```bash
# Stop services
docker compose down

# Restore MariaDB
gunzip < /backups/mariadb_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T mariadb mysql -uroot -p$DB_ROOT_PASSWORD

# Restart services
docker compose up -d
```

## Performance Tuning

### MariaDB Optimization

```bash
# In .env or docker-compose config:
MARIADB_MAX_CONNECTIONS=500
MARIADB_INNODB_BUFFER_POOL_SIZE=2G
```

### Redis Optimization

```bash
# Command line tuning
docker compose exec redis redis-cli CONFIG SET maxmemory 1gb
docker compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### CPU/Memory Limits

Adjust in `docker-compose.prod.yml` under each service's `deploy.resources`:

```yaml
deploy:
  resources:
    limits:
      cpus: "1"
      memory: 512M
    reservations:
      cpus: "0.5"
      memory: 256M
```

## Secrets Management

**CRITICAL:** Never commit real secrets to Git.

### Option 1: Environment Variables

```bash
# Set before docker compose
export DB_PASSWORD="your-secret-password"
export JWT_SECRET="your-secret-key"
docker compose up
```

### Option 2: Docker Secrets (Swarm)

```bash
echo "secret_value" | docker secret create db_password -
```

### Option 3: .env File (Local Only)

```bash
# Use .env.production (git-ignored)
# NEVER commit real credentials
```

## Updates & Rollback

### Deploy Update

```bash
# Pull latest code
git pull

# Rebuild affected services
docker compose build api-gateway

# Replace running container (zero-downtime)
docker compose up -d --no-deps api-gateway
```

### Quick Rollback

```bash
# Checkout previous version
git checkout HEAD~1

# Rebuild and restart
docker compose build
docker compose up -d
```

## CI/CD Integration

### GitHub Actions Pipeline

See `.github/workflows/main.yml` for:
- Automated testing on push
- Image building and pushing to registry
- Automatic deployment to staging
- Manual approval for production

## Support & Troubleshooting

### Critical Issues

1. **All services down:** Check Docker daemon, disk space, network
2. **Database corrupted:** Restore from latest backup
3. **Memory exhausted:** Kill non-essential services, increase RAM
4. **SSL certificate expired:** Run `certbot renew`

### Getting Help

```bash
# Collect diagnostics
docker compose ps
docker compose logs > diagnostics.log
docker stats --no-stream > stats.log
df -h > diskspace.log
free -h > memory.log

# Contact support with files above
```

## Important Files & Locations

| File | Purpose | Production |
|------|---------|-----------|
| `.env` | Configuration | UPDATE BEFORE DEPLOY |
| `docker-compose.yml` | Dev/test config | Use `docker-compose.prod.yml` |
| `docker-compose.prod.yml` | Production config | PRIMARY |
| `scripts/backup.sh` | Database backups | REQUIRED |
| `/backups/` | Backup storage | MONITOR DISK SPACE |
| `/var/lib/docker/volumes/` | Persistent data | BACKUP REGULARLY |

## Recovery Time Objectives (RTO)

- **Service Restart:** < 2 minutes
- **Database Restore:** < 15 minutes  
- **Full System Recovery:** < 30 minutes

---

**Last Updated:** 2026-06-18  
**Maintained By:** DevOps Team  
**Review Schedule:** Quarterly
