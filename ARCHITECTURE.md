# RestPoint - System Architecture
## Docker-Only Microservices Architecture (No PM2)

---

## 🎯 Architecture Overview

RestPoint uses a **modern microservices architecture** with **Docker-only scaling** - no PM2 process manager inside containers.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer / SSL                      │
│                    (Cloudflare / HAProxy / Host NGINX)           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX (Port 80/443)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Reverse Proxy                                         │  │
│  │  • Load Balancer                                         │  │
│  │  • SSL Termination                                       │  │
│  │  • Static File Serving                                   │  │
│  │  • WebSocket Proxy                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ API Gateway  │ │ Socket.IO    │ │ Frontend     │
    │ (Port 5000)  │ │ Service      │ │ Client       │
    │              │ │ (Port 5013)  │ │ (Port 8082)  │
    └──────┬───────┘ └──────────────┘ └──────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ Auth Service │ │ Tenant Svc   │ │ Deceased Svc │          │
│  │ (Port 5001)  │ │ (Port 5002)  │ │ (Port 5003)  │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ Hearse Svc   │ │ Coffin Svc   │ │ Billing Svc  │          │
│  │ (Port 5008)  │ │ (Port 5006)  │ │ (Port 5020)  │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ Notification │ │ Support Svc  │ │ Documents    │          │
│  │ (Port 5111)  │ │ (Port 8111)  │ │ (Port 5011)  │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ Analytics    │ │ Visitors     │ │ Chemical     │          │
│  │ (Port 5009)  │ │ (Port 5014)  │ │ (Port 5105)  │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  ... and more services ...                                     │
└────────────────────────────────────────────────────────────────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────┐        ┌────────┐        ┌────────┐
   │MariaDB │        │ Redis  │        │RabbitMQ│
   │:3306   │        │:6379   │        │:5672   │
   └────────┘        └────────┘        └────────┘
   Primary DB         Cache/Sessions     Message Queue
```

---

## 🏗️ Architecture Layers

### 1. **Entry Point Layer**
- **NGINX**: Single entry point for all traffic
- **SSL Termination**: Handles HTTPS
- **Load Balancing**: Distributes traffic across service instances
- **Static Assets**: Serves React frontend

### 2. **API Gateway Layer**
- **API Gateway** (Port 5000): Main entry point for API requests
- **Socket.IO Service** (Port 5013): WebSocket connections
- **Frontend** (Port 8082): React application

### 3. **Microservices Layer**
- **26+ independent services**
- **1 container = 1 process** (no PM2)
- **Horizontal scaling** via Docker Compose
- **Health checks** on all services
- **Restart policies** configured

### 4. **Data Layer**
- **MariaDB**: Primary relational database
- **Redis**: Caching, sessions, rate limiting
- **RabbitMQ**: Async messaging, background jobs

---

## 🔑 Key Architecture Decisions

### ✅ Docker-Only Scaling (No PM2)

**Decision**: Use Docker for process management and scaling, not PM2.

**Rationale**:
1. **Process Isolation**: Each container is already isolated
2. **Restart Management**: Docker handles crashes and restarts
3. **Scaling**: Docker Compose/Kubernetes handles horizontal scaling
4. **Simplicity**: One less layer to manage
5. **Performance**: No CPU over-subscription from double scaling

**Implementation**:
```dockerfile
# Dockerfile - Direct Node.js execution (no PM2)
CMD ["node", "services/auth-service/server.js"]
```

**Scaling**:
```bash
# Scale horizontally with Docker
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3
```

### ✅ Single Network Architecture

**Decision**: All services on one Docker network (`restpoint_network`)

**Rationale**:
- Simpler networking
- Easier service discovery
- Better performance
- Easier debugging

**Implementation**:
```yaml
# docker-compose.prod.yml
networks:
  restpoint_network:
    driver: bridge
    name: restpoint_network
    attachable: true
```

### ✅ NGINX as Single Entry Point

**Decision**: All traffic flows through NGINX

**Rationale**:
- Centralized security
- Easy SSL management
- Load balancing
- WebSocket support
- Static asset caching

**Implementation**:
```nginx
# nginx.conf
upstream api_gateway {
    server restpoint_api_gateway:5000;
}

location /api/ {
    proxy_pass http://api_gateway;
    rewrite ^/api/(.*)$ /api/v1/restpoint/$1 break;
}
```

### ✅ Health Checks on All Services

**Decision**: Every service has a health check endpoint

**Rationale**:
- Docker can restart unhealthy services
- Load balancers can skip unhealthy instances
- Monitoring and alerting
- Better reliability

**Implementation**:
```yaml
# docker-compose.prod.yml
healthcheck:
  test: [ "CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health" ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🔄 Data Flow

### API Request Flow

```
Client → NGINX → API Gateway → Microservice → Database/Cache
                ↓
            Socket.IO Service (for WebSocket)
```

### Async Job Flow

```
Microservice → RabbitMQ → Worker Service → Database
                ↓
            (Background processing)
```

### Cache Flow

```
Microservice → Redis Cache
     ↓              ↓
  Cache Hit     Cache Miss
     ↓              ↓
  Return Data   Query DB → Cache Result
```

---

## 📦 Service Communication

### Service Discovery

**Method**: Docker DNS (container names)

**Example**:
```javascript
// In auth-service
const dbConfig = {
  host: 'restpoint_mariadb',  // Docker DNS name
  port: 3306,
  user: 'restpoint_user',
  password: 'RestPointUser2024'
};
```

### Inter-Service Communication

**Method**: HTTP/REST via API Gateway or direct service calls

**Example**:
```javascript
// API Gateway routing to auth-service
const authServiceUrl = 'http://restpoint_auth_service:5000';
const response = await axios.post(`${authServiceUrl}/api/v1/restpoint/auth/login`, credentials);
```

### Async Communication

**Method**: RabbitMQ message queues

**Example**:
```javascript
// Publisher
await channel.sendToQueue('notification_queue', Buffer.from(JSON.stringify({
  userId: user.id,
  message: 'Welcome!'
})));

// Consumer
channel.consume('notification_queue', (msg) => {
  const data = JSON.parse(msg.content);
  sendNotification(data.userId, data.message);
});
```

---

## 🎯 Scaling Strategy

### Horizontal Scaling (Preferred)

**When to scale**:
- High CPU/Memory usage
- Increased request latency
- Queue backlog in RabbitMQ
- Database connection pool exhaustion

**How to scale**:
```bash
# Scale specific service
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Verify
docker-compose -f docker-compose.prod.yml ps
```

**Load Balancing**:
- NGINX upstream configuration
- Docker Compose creates numbered containers
- Update NGINX config when scaling

### Vertical Scaling (When Needed)

**When to scale**:
- Service needs more CPU/RAM
- Database performance issues
- Redis memory limits reached

**How to scale**:
```yaml
# docker-compose.prod.yml
services:
  auth-service:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 🔒 Security Architecture

### Network Security
- **Private network**: Services communicate via internal Docker network
- **No direct port access**: Only NGINX exposes ports externally
- **Service isolation**: Each service in own container

### Authentication & Authorization
- **JWT tokens**: Stateless authentication
- **Refresh tokens**: Long-lived sessions
- **API Gateway**: Centralized auth validation

### Data Security
- **Environment variables**: No hardcoded secrets
- **Redis password**: Protected cache
- **RabbitMQ credentials**: Secure messaging
- **MariaDB users**: Principle of least privilege

### Application Security
- **Security headers**: X-Frame-Options, X-XSS-Protection, etc.
- **Input validation**: All endpoints validate input
- **SQL injection prevention**: Parameterized queries
- **Rate limiting**: Redis-based rate limiting

---

## 📊 Monitoring & Observability

### Health Checks
- **Endpoint**: `/health` on all services
- **Frequency**: Every 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Action**: Docker restarts unhealthy services

### Logging
- **Centralized**: Loki + Promtail + Grafana
- **Structured**: JSON logging
- **Aggregated**: All service logs in one place
- **Retention**: Configurable

### Metrics
- **Container stats**: CPU, memory, network
- **Application metrics**: Request count, latency, errors
- **Database metrics**: Connection pool, query time
- **Queue metrics**: RabbitMQ message count, consumer count

### Alerting
- **Service down**: Health check failures
- **High resource usage**: CPU/Memory thresholds
- **Queue backlog**: Message count thresholds
- **Database issues**: Connection failures, slow queries

---

## 🚀 Deployment Architecture

### Production Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Server                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Docker Engine                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ MariaDB    │  │ Redis      │  │ RabbitMQ   │    │  │
│  │  │ Container  │  │ Container  │  │ Container  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ NGINX      │  │ Frontend   │  │ API Gateway│    │  │
│  │  │ Container  │  │ Container  │  │ Container  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ Auth Svc   │  │ Tenant Svc │  │ Deceased   │    │  │
│  │  │ Container  │  │ Container  │  │ Container  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │  ... more service containers ...                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Server Deployment (Future)

```
┌─────────────────────┐      ┌─────────────────────┐
│   Server 1          │      │   Server 2          │
│  ┌───────────────┐  │      │  ┌───────────────┐  │
│  │ NGINX + LB    │  │      │  │ Services      │  │
│  └───────────────┘  │      │  └───────────────┘  │
└─────────────────────┘      └─────────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
            ┌────────────────┐
            │ Shared Storage │
            │ (NFS/Cloud)    │
            └────────────────┘
```

---

## 🎓 Design Patterns Used

### 1. **Microservices Pattern**
- Each service is independent
- Own database schema (or shared with clear boundaries)
- Communicates via HTTP/REST or message queues

### 2. **API Gateway Pattern**
- Single entry point
- Request routing
- Authentication/Authorization
- Rate limiting

### 3. **Circuit Breaker Pattern**
- Prevents cascade failures
- Timeout handling
- Fallback responses

### 4. **Event-Driven Architecture**
- RabbitMQ for async communication
- Loose coupling between services
- Scalable background processing

### 5. **Caching Pattern**
- Redis for frequently accessed data
- Reduces database load
- Improves response time

### 6. **Health Check Pattern**
- All services expose `/health` endpoint
- Docker monitors and restarts unhealthy services
- Load balancers can route around failures

---

## 📈 Scalability Characteristics

### Horizontal Scaling
- ✅ Easy: Just increase container count
- ✅ Fast: Docker Compose `--scale` flag
- ✅ Cost-effective: Add more servers when needed

### Vertical Scaling
- ✅ Possible: Increase CPU/RAM limits
- ⚠️ Limited: Single server constraints
- ⚠️ Cost: More expensive than horizontal

### Database Scaling
- **Read Replicas**: For read-heavy workloads
- **Sharding**: For write-heavy workloads (future)
- **Connection Pooling**: Already implemented

### Cache Scaling
- **Redis Cluster**: For high availability (future)
- **Cache Warming**: Pre-load frequently accessed data

---

## 🔮 Future Enhancements

### Short Term
- [ ] Add resource limits to docker-compose.prod.yml
- [ ] Implement NGINX upstream auto-discovery
- [ ] Add distributed tracing (OpenTelemetry)
- [ ] Implement rate limiting at NGINX level

### Medium Term
- [ ] Migrate to Kubernetes
- [ ] Add service mesh (Istio/Linkerd)
- [ ] Implement Redis Cluster
- [ ] Add database read replicas

### Long Term
- [ ] Multi-region deployment
- [ ] Auto-scaling based on metrics
- [ ] Event sourcing for critical services
- [ ] CQRS pattern for read-heavy services

---

## 📚 Related Documentation

- **[DOCKER_SCALING_GUIDE.md](DOCKER_SCALING_GUIDE.md)** - Complete scaling guide
- **[DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md)** - Quick commands
- **[SERVICE_TOPOLOGY.md](SERVICE_TOPOLOGY.md)** - Service dependencies
- **[PORTS.md](PORTS.md)** - Port allocation
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Deployment steps

---

## 🎯 Architecture Principles

1. **Single Responsibility**: Each service has one job
2. **Isolation**: Services don't share resources
3. **Scalability**: Scale horizontally, not vertically
4. **Resilience**: Health checks and automatic restarts
5. **Observability**: Logging, metrics, and tracing
6. **Security**: Defense in depth
7. **Simplicity**: No unnecessary complexity (no PM2 in Docker!)

---

**Last Updated**: 2025-01-05  
**Architecture Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Scaling**: Docker-only (No PM2)