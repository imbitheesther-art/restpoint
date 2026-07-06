# RestPoint - Docker Scaling Quick Reference
## No PM2 - Docker Only

---

## 🚀 Quick Commands

### Start Services
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Start specific services
docker-compose -f docker-compose.prod.yml up -d mariadb redis rabbitmq
```

### Stop Services
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

### Scale Services
```bash
# Scale auth-service to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Scale multiple services
docker-compose -f docker-compose.prod.yml up -d \
  --scale auth-service=3 \
  --scale api-gateway=2 \
  --scale tenant-service=2
```

### Check Status
```bash
# List all services
docker-compose -f docker-compose.prod.yml ps

# Check specific service
docker-compose -f docker-compose.prod.yml ps auth-service

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f auth-service
```

### Restart Services
```bash
# Restart specific service
docker-compose -f docker-compose.prod.yml restart auth-service

# Restart all services
docker-compose -f docker-compose.prod.yml restart
```

---

## 📊 Monitoring

### Health Checks
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' restpoint_auth_service

# View health check logs
docker inspect --format='{{json .State.Health}}' restpoint_auth_service | jq
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Specific service
docker stats restpoint_auth_service

# Stop stats
# Press Ctrl+C
```

### Logs
```bash
# Follow all logs
docker-compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# Since 1 hour ago
docker-compose -f docker-compose.prod.yml logs --since 1h
```

---

## 🔧 Common Tasks

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose -f docker-compose.prod.yml up -d --build auth-service

# Rebuild all services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Execute Commands in Container
```bash
# Open shell in container
docker exec -it restpoint_auth_service sh

# Run command in container
docker exec restpoint_auth_service node -e "console.log('test')"

# Check environment variables
docker exec restpoint_auth_service env
```

### Database Operations
```bash
# Connect to MariaDB
docker exec -it restpoint_mariadb mysql -u restpoint_user -p restpoint_main

# Backup database
docker exec restpoint_mariadb mysqldump -u restpoint_user -p restpoint_main > backup.sql

# Restore database
docker exec -i restpoint_mariadb mysql -u restpoint_user -p restpoint_main < backup.sql
```

### Redis Operations
```bash
# Connect to Redis CLI
docker exec -it restpoint_redis redis-cli -a RestPointRedis2024

# Check Redis stats
docker exec restpoint_redis redis-cli -a RestPointRedis2024 INFO

# Flush all keys (CAUTION!)
docker exec restpoint_redis redis-cli -a RestPointRedis2024 FLUSHALL
```

### RabbitMQ Operations
```bash
# Access RabbitMQ management UI
# Open browser: http://localhost:15672
# Username: restpoint
# Password: RestPointRabbit2024

# List queues
docker exec restpoint_rabbitmq rabbitmqctl list_queues
```

---

## 🎯 Scaling Examples

### Example 1: Scale High-Traffic Service
```bash
# Situation: auth-service is slow under load
# Solution: Scale to 3 instances

docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Update NGINX upstream (if using direct upstream)
# Then reload NGINX
docker exec restpoint_frontend nginx -s reload
```

### Example 2: Scale During Peak Hours
```bash
# Morning peak: Scale up
docker-compose -f docker-compose.prod.yml up -d \
  --scale auth-service=3 \
  --scale api-gateway=2

# Evening: Scale down
docker-compose -f docker-compose.prod.yml up -d \
  --scale auth-service=1 \
  --scale api-gateway=1
```

### Example 3: Zero-Downtime Update
```bash
# Pull new image
docker-compose -f docker-compose.prod.yml pull

# Recreate containers with new image
docker-compose -f docker-compose.prod.yml up -d --no-deps --build auth-service

# Verify
docker-compose -f docker-compose.prod.yml ps auth-service
```

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs auth-service

# Check if port is in use
netstat -ano | findstr :5000

# Restart service
docker-compose -f docker-compose.prod.yml restart auth-service
```

### High Memory Usage
```bash
# Check memory usage
docker stats

# Set memory limit in docker-compose.prod.yml
# Add to service:
#   deploy:
#     resources:
#       limits:
#         memory: 512M

# Restart service
docker-compose -f docker-compose.prod.yml up -d auth-service
```

### Database Connection Issues
```bash
# Check if MariaDB is healthy
docker inspect --format='{{.State.Health.Status}}' restpoint_mariadb

# Check network connectivity
docker exec restpoint_auth_service ping restpoint_mariadb

# Check environment variables
docker exec restpoint_auth_service env | grep DB_
```

### Redis Connection Issues
```bash
# Check if Redis is healthy
docker inspect --format='{{.State.Health.Status}}' restpoint_redis

# Test Redis connection
docker exec restpoint_auth_service redis-cli -h restpoint_redis ping

# Check Redis password
docker exec restpoint_redis redis-cli -a RestPointRedis2024 ping
```

---

## 📋 Service Ports Reference

| Service | Internal Port | External Port | Health Check |
|---------|--------------|---------------|--------------|
| API Gateway | 5000 | 5000 | /health |
| Auth Service | 5000 | 5001 | /health |
| Tenant Service | 5000 | 5002 | /health |
| Deceased Service | 5000 | 5003 | /health |
| Marketplace Service | 5000 | 5004 | /health |
| Invoice Service | 5000 | 5005 | /health |
| Coffin Service | 5000 | 5006 | /health |
| Documents Service | 5000 | 5007 | /health |
| Hearse Service | 5000 | 5008 | /health |
| Analytics Service | 5000 | 5009 | /health |
| Calendar Service | 5000 | 5010 | /health |
| MPESA Service | 5000 | 5011 | /health |
| QRCode Service | 5000 | 5012 | /health |
| SocketIO Service | 5000 | 5013 | /health |
| Visitors Service | 5000 | 5014 | /health |
| Body Checkout | 5000 | 5015 | /health |
| Extra Services | 5000 | 5016 | /health |
| Call Service | 5000 | 5018 | /health |
| Portal Service | 5000 | 5019 | /health |
| Billing Service | 5000 | 5020 | /health |
| Support Service | 5000 | 8111 | /health |
| Notification | 5000 | 5111 | /health |
| Chemical Service | 5000 | 5105 | /health |
| Scanner Service | 2024 | 2024 | /health |
| Frontend | 80 | 8082 | / |
| MariaDB | 3306 | 3306 | - |
| Redis | 6379 | 6379 | - |
| RabbitMQ | 5672/15672 | 5672/15672 | - |

---

## 🔐 Default Credentials

### MariaDB
- Host: localhost:3306
- Root Password: RestPoint2024!
- Database: restpoint_main
- User: restpoint_user
- Password: RestPointUser2024

### Redis
- Host: localhost:6379
- Password: RestPointRedis2024

### RabbitMQ
- Host: localhost:5672
- Management UI: http://localhost:15672
- Username: restpoint
- Password: RestPointRabbit2024

---

## 📈 Performance Tips

### 1. Use Docker Compose Profiles
```bash
# Start only essential services
docker-compose -f docker-compose.prod.yml --profile essential up -d

# Start with monitoring
docker-compose -f docker-compose.prod.yml --profile monitoring up -d
```

### 2. Optimize Builds
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.prod.yml build

# Build with cache
docker-compose -f docker-compose.prod.yml build --cache-from
```

### 3. Resource Limits
```yaml
# Add to docker-compose.prod.yml
services:
  auth-service:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 🚨 Emergency Procedures

### Complete System Restart
```bash
# Stop everything
docker-compose -f docker-compose.prod.yml down

# Start infrastructure
docker-compose -f docker-compose.prod.yml up -d mariadb redis rabbitmq

# Wait 30 seconds
sleep 30

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

### Clear All Data and Restart (CAUTION!)
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Remove volumes
docker-compose -f docker-compose.prod.yml down -v

# Remove images
docker-compose -f docker-compose.prod.yml down --rmi all

# Start fresh
docker-compose -f docker-compose.prod.yml up -d
```

### Emergency Scale Up
```bash
# Scale all services to handle traffic spike
docker-compose -f docker-compose.prod.yml up -d \
  --scale auth-service=5 \
  --scale api-gateway=3 \
  --scale tenant-service=3 \
  --scale deceased-service=3
```

---

## 📚 Documentation

- **DOCKER_SCALING_GUIDE.md** - Complete Docker scaling guide
- **PM2_SETUP.md** - PM2 documentation (for non-Docker only)
- **PRODUCTION_DEPLOYMENT_GUIDE.md** - Production deployment steps
- **README.md** - Project overview

---

## ⚠️ Important Notes

1. **NO PM2 in Docker** - Each container runs one process
2. **Scale horizontally** - Add more containers, not PM2 clusters
3. **NGINX handles load balancing** - Update upstream when scaling
4. **Health checks are critical** - Don't disable them
5. **Use environment variables** - Don't hardcode configs

---

## 🆘 Quick Help

```bash
# Show this guide
cat DOCKER_QUICK_REFERENCE.md

# Show Docker Compose file
cat docker-compose.prod.yml

# Show service status
docker-compose -f docker-compose.prod.yml ps

# Show all containers
docker ps -a

# Show Docker info
docker info

# Show Docker version
docker version
```

---

**Last Updated**: 2025-01-05
**Architecture**: Docker-Only (No PM2)
**Status**: ✅ Production Ready

**Remember**: Docker handles scaling, not PM2!