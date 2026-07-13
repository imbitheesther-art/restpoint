

##  Scaling Strategy

### Option A: Docker Compose Scaling (Recommended for Single Server)

#### Horizontal Scaling (Add More Containers)

```bash
# Scale specific services
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3
docker-compose -f docker-compose.prod.yml up -d --scale api-gateway=2

# Verify scaled services
docker-compose -f docker-compose.prod.yml ps
```

#### Update NGINX for Multiple Instances

When you scale a service, update NGINX upstream configuration:

```nginx
# nginx.conf - Example for scaled auth-service
upstream auth_backend {
    # Add all scaled instances
    server restpoint_auth_service_1:5000;
    server restpoint_auth_service_2:5000;
    server restpoint_auth_service_3:5000;
}

location /api/auth/ {
    proxy_pass http://auth_backend;
    # ... rest of config
}
```

**Note**: Docker Compose creates numbered containers when scaling:
- `restpoint_auth_service_1`
- `restpoint_auth_service_2`
- etc.

### Option B: Docker Swarm (For Multi-Server)

```bash
# Initialize swarm
docker swarm init

# Deploy with replicas
docker stack deploy -c docker-compose.prod.yml restpoint

# Scale services
docker service scale restpoint_auth-service=5
docker service scale restpoint_api-gateway=3
```

### Option C: Kubernetes (For Enterprise)

Convert docker-compose to Kubernetes deployments:

```yaml
# Example: auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3  # Scale here
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: restpoint-auth-service:latest
        ports:
        - containerPort: 5000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
```


##  Performance Optimization

### 1. **Resource Limits** (Add to docker-compose.prod.yml)

```yaml
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

### 2. **Redis Optimization**

configured:
```yaml
redis:
  command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
```

### 3. **RabbitMQ Optimization**

Add to docker-compose.prod.yml:
```yaml
rabbitmq:
  environment:
    RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
    RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    RABBITMQ_VM_MEMORY_HIGH_WATERMARK: 0.5  # 50% of RAM
```

---

##  Deployment Workflow

### Production Deployment (Docker-Only)

```bash
# 1. Build all images
docker-compose -f docker-compose.prod.yml build

# 2. Start infrastructure first
docker-compose -f docker-compose.prod.yml up -d mariadb redis rabbitmq

# 3. Wait for health checks
sleep 30

# 4. Start application services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify all services
docker-compose -f docker-compose.prod.yml ps

# 6. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Scaling Production

```bash
# Scale specific service
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Update NGINX config with new instances
# Reload NGINX
docker exec restpoint_frontend nginx -s reload

# Verify
docker-compose -f docker-compose.prod.yml ps
```

---

##  Monitoring & Health Checks

### Health Check Status

```bash
# Check all service health
docker-compose -f docker-compose.prod.yml ps

# Check specific service health
docker inspect --format='{{.State.Health.Status}}' restpoint_auth_service

# View health check logs
docker inspect --format='{{json .State.Health}}' restpoint_auth_service | jq
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f auth-service

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 auth-service
```

### Metrics

```bash
# Container resource usage
docker stats

# Specific service stats
docker stats restpoint_auth_service
```

---

##  Troubleshooting

### Issue: Service won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs auth-service

# Check health check status
docker inspect restpoint_auth_service | grep -A 10 Health

# Restart service
docker-compose -f docker-compose.prod.yml restart auth-service
```

### Issue: High CPU/Memory usage

```bash
# Check resource usage
docker stats

# Scale horizontally instead of using PM2
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Set resource limits
# Add to docker-compose.prod.yml:
#   deploy:
#     resources:
#       limits:
#         cpus: '0.5'
#         memory: 512M
```

### Issue: Need zero-downtime deployment

```bash
# Use rolling update with Docker Swarm
docker service update --image restpoint-auth-service:v2 restpoint_auth_service

# Or use Kubernetes rolling updates
kubectl set image deployment/auth-service auth-service=restpoint-auth-service:v2
kubectl rollout status deployment/auth-service
```

---

##  Checklist: Docker-Only Setup

- [x] Docker containers run single process (no PM2)
- [x] Each service in own container
- [x] Health checks configured
- [x] Restart policies set
- [x] NGINX as single entry point
- [x] Redis for caching/sessions
- [x] RabbitMQ for async jobs
- [x] Docker network configured
- [x] Volumes for persistence
- [x] Environment variables configured



## 🆘 Need Help?

### Common Commands

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Scale service
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps

# Restart service
docker-compose -f docker-compose.prod.yml restart auth-service
```

### PM2 Commands (Only for Non-Docker Deployments)

```bash
# Start with PM2 (NOT for Docker!)
pm2 start ecosystem.config.js

# View PM2 status
pm2 status

# View PM2 logs
pm2 logs

# Restart with PM2
pm2 reload ecosystem.config.js
```

---

**Last Updated**: 2025-01-05
**Architecture**: Docker-Only (No PM2)
**Status**: ✅ Production Ready