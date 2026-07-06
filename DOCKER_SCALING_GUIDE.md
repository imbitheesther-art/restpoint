# RestPoint - Docker-Only Scaling Guide
## Production Architecture (No PM2 Required)

---

## 🎯 Current Architecture Status

Your system is already configured correctly for **Docker-only scaling**:

```
┌─────────────────────────────────────────────────────────┐
│                    NGINX (Port 80/443)                   │
│              Single Entry Point / Load Balancer          │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌──────────┐
   │ API     │    │ Socket  │    │ Frontend │
   │ Gateway │    │ IO Svc  │    │  Client  │
   └────┬────┘    └─────────┘    └──────────┘
        │
        ▼
   ┌──────────────────────────────────────┐
   │  Microservices (1 process each)     │
   │  - auth-service                     │
   │  - tenant-service                   │
   │  - deceased-service                 │
   │  - hearse-service                   │
   │  - etc...                           │
   └───────┬──────────────────────────────┘
           │
   ┌───────┼───────┐
   │       │       │
   ▼       ▼       ▼
┌────┐ ┌────┐ ┌────┐
│ DB │ │Redis│ │MQ  │
└────┘ └────┘ └────┘
```

---

## ✅ What You Already Have (Correct Setup)

### 1. **Docker Containers** ✅
- Each service runs in its own container
- **1 container = 1 Node.js process** (no PM2 inside)
- Proper health checks on all services
- Restart policies configured (`unless-stopped` or `always`)

### 2. **NGINX Reverse Proxy** ✅
- Single entry point for all traffic
- Routes to appropriate services
- Handles WebSocket connections
- SSL termination ready

### 3. **Redis** ✅
- Caching layer
- Session storage
- Rate limiting

### 4. **RabbitMQ** ✅
- Async communication
- Background jobs
- Event-driven workflows

---

## 🚫 What You DON'T Need (PM2 in Docker)

### PM2 is NOT used inside Docker containers because:

1. **Docker already isolates processes** - Each container is isolated
2. **Docker handles restarts** - `restart: unless-stopped` policy
3. **Docker Compose/Kubernetes handles scaling** - Just increase replicas
4. **PM2 cluster mode + Docker = double scaling** - Causes CPU over-subscription

### Your PM2 ecosystem.config.js
- **Purpose**: For non-Docker deployments (legacy/alternative)
- **Status**: Can be kept for reference but NOT used with Docker
- **Action**: No changes needed to Dockerfiles

---

## 📊 Scaling Strategy

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

---

## 🔧 Current Configuration Review

### Docker Compose (docker-compose.prod.yml)

**Status**: ✅ Correctly configured

**Key Features**:
- Single network: `restpoint_network`
- Health checks on all services
- Proper dependencies (`depends_on` with conditions)
- Environment variables via `.env.production`
- Volume mounts for persistent data
- Restart policies

**No PM2 references found** - Perfect!

### Dockerfiles

**Status**: ✅ Correctly configured

**Pattern Used**:
```dockerfile
# Start application directly (no PM2)
CMD ["node", "services/auth-service/server.js"]
# OR
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "services/auth-service/server.js"]
```

**No PM2 in any Dockerfile** - Perfect!

### NGINX Configuration

**Status**: ✅ Correctly configured

**Features**:
- Single entry point
- Path rewriting (`/api/` → `/api/v1/restpoint/`)
- WebSocket support for Socket.IO
- Static asset caching
- Security headers
- Health check endpoint

---

## 📈 Performance Optimization

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

Already configured:
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

## 🚀 Deployment Workflow

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

## 🔍 Monitoring & Health Checks

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

## 🛠️ Troubleshooting

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

## 📋 Checklist: Docker-Only Setup

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

---

## 🎓 Best Practices

### DO ✅

1. **Scale horizontally** - Add more containers
2. **Use Docker Compose/K8s** for orchestration
3. **Monitor with health checks** - Already configured
4. **Use NGINX** as load balancer - Already configured
5. **Let Docker handle restarts** - Already configured

### DON'T ❌

1. **Don't use PM2 in Docker** - Double scaling
2. **Don't expose ports unnecessarily** - Only through NGINX
3. **Don't run multiple processes in one container** - One process per container
4. **Don't skip health checks** - Already configured, keep them
5. **Don't hardcode configurations** - Use environment variables

---

## 📚 Additional Resources

### Files in Your Setup

| File | Purpose | PM2 Used? |
|------|---------|-----------|
| `docker-compose.prod.yml` | Production orchestration | ❌ No |
| `docker-compose.yml` | Development orchestration | ❌ No |
| `ecosystem.config.js` | PM2 config (non-Docker only) | ⚠️ Legacy |
| `Dockerfile` (each service) | Container definition | ❌ No |
| `nginx.conf` | Reverse proxy | ❌ No |

### When to Use ecosystem.config.js

**Use PM2 ecosystem.config.js when**:
- Deploying directly to VPS without Docker
- Running services on host machine
- Need PM2-specific features (log rotation, etc.)

**Don't use PM2 when**:
- Running in Docker containers ❌
- Using Docker Compose ❌
- Using Kubernetes ❌
- Using Docker Swarm ❌

---

## 🎯 Summary

Your RestPoint system is **already correctly configured** for Docker-only scaling:

✅ **Architecture**: Microservices with Docker
✅ **Process Management**: Docker (not PM2)
✅ **Scaling**: Horizontal (add containers)
✅ **Load Balancing**: NGINX
✅ **Caching**: Redis
✅ **Async Jobs**: RabbitMQ

### Next Steps

1. **Keep current setup** - It's already correct!
2. **Scale when needed** - Use `docker-compose up --scale`
3. **Monitor performance** - Use `docker stats`
4. **Add resource limits** - Optional but recommended
5. **Consider Kubernetes** - When you need multi-server scaling

---

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