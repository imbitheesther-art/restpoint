# RestPoint - Mortuary Management System

## 🏗️ Architecture: Docker-Only (No PM2)

RestPoint is a modern microservices-based mortuary management system built with **Docker-only scaling** - no PM2 required.

---

## 🎯 Key Architecture Principles

### ✅ What We Use
- **Docker** - Container orchestration and process isolation
- **Docker Compose** - Service orchestration
- **NGINX** - Reverse proxy and load balancer
- **Redis** - Caching, sessions, and rate limiting
- **RabbitMQ** - Async communication and background jobs
- **MariaDB** - Primary database

### 🚫 What We DON'T Use
- **PM2 in Docker** - Not needed, Docker handles process management
- **Multiple processes per container** - One process per container
- **Host-level process managers** - Docker handles restarts

---

## 📁 Project Structure

```
restpoint/
├── docker-compose.prod.yml          # Production orchestration
├── docker-compose.yml               # Development orchestration
├── nginx.conf                       # Reverse proxy configuration
├── DOCKER_SCALING_GUIDE.md         # Complete Docker scaling guide
├── DOCKER_QUICK_REFERENCE.md       # Quick command reference
├── ecosystem.config.js             # PM2 config (non-Docker only)
├── services/                        # Microservices
│   ├── api-gateway/                 # API Gateway (port 5000)
│   ├── auth-service/                # Authentication (port 5001)
│   ├── tenant-service/              # Tenant management (port 5002)
│   ├── deceased-service/            # Deceased records (port 5003)
│   ├── hearse-service/              # Hearse management (port 5008)
│   ├── coffin-service/              # Coffin inventory (port 5006)
│   ├── billing-service/             # Billing & invoices (port 5020)
│   ├── notification-service/        # Notifications (port 5111)
│   ├── support-service/             # Support tickets (port 8111)
│   ├── documents-service/           # Document management (port 5011)
│   ├── socketio-service/            # WebSocket service (port 5013)
│   ├── scanner-service/             # Document scanner (port 2024)
│   └── [other services...]
├── FrontendClient/                  # React frontend
├── shared/                          # Shared utilities
├── packages/                        # Shared packages
└── global/                          # Global middleware
```

---

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 22+ (for development)
- Yarn (for development)

### Production Deployment

```bash
# 1. Clone repository
git clone https://github.com/imbitheesther-art/restpoint.git
cd restpoint

# 2. Configure environment
cp .env.example .env.production
# Edit .env.production with your settings

# 3. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify services
docker-compose -f docker-compose.prod.yml ps

# 5. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Development Setup

```bash
# 1. Install dependencies
yarn install

# 2. Start infrastructure
docker-compose up -d mariadb redis rabbitmq

# 3. Start individual services
cd services/auth-service
yarn dev

# 4. Start frontend
cd FrontendClient/client
yarn dev
```

---

## 📊 Services Overview

### Core Infrastructure
| Service | Port | Purpose |
|---------|------|---------|
| MariaDB | 3306 | Primary database |
| Redis | 6379 | Caching & sessions |
| RabbitMQ | 5672/15672 | Message queue |
| NGINX | 80/443 | Reverse proxy |

### Microservices (26+ services)
| Service | External Port | Internal Port | Purpose |
|---------|--------------|---------------|---------|
| API Gateway | 5000 | 5000 | Main entry point |
| Auth Service | 5001 | 5000 | Authentication & authorization |
| Tenant Service | 5002 | 5000 | Multi-tenant management |
| Deceased Service | 5003 | 5000 | Deceased records |
| Marketplace Service | 5004 | 5000 | Marketplace features |
| Invoice Service | 5005 | 5000 | Invoice generation |
| Coffin Service | 5006 | 5000 | Coffin inventory |
| Documents Service | 5007 | 5000 | Document management |
| Hearse Service | 5008 | 5000 | Hearse booking |
| Analytics Service | 5009 | 5000 | Analytics & reports |
| Calendar Service | 5010 | 5000 | Calendar & scheduling |
| MPESA Service | 5011 | 5000 | MPESA integration |
| QRCode Service | 5012 | 5000 | QR code generation |
| SocketIO Service | 5013 | 5000 | WebSocket server |
| Visitors Service | 5014 | 5000 | Visitor management |
| Body Checkout | 5015 | 5000 | Body checkout |
| Extra Services | 5016 | 5000 | Additional features |
| Call Service | 5018 | 5000 | Call management |
| Portal Service | 5019 | 5000 | Portal services |
| Billing Service | 5020 | 5000 | Billing management |
| Support Service | 8111 | 5000 | Support tickets |
| Notification | 5111 | 5000 | Notifications |
| Chemical Service | 5105 | 5000 | Chemical management |
| Scanner Service | 2024 | 2024 | Document scanner |
| Frontend | 8082 | 80 | React web app |

---

## 🎯 Scaling Strategy

### Docker-Only Scaling (Recommended)

```bash
# Scale specific service
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Scale multiple services
docker-compose -f docker-compose.prod.yml up -d \
  --scale auth-service=3 \
  --scale api-gateway=2 \
  --scale tenant-service=2
```

### Why No PM2?

1. **Docker already isolates processes** - Each container is isolated
2. **Docker handles restarts** - `restart: unless-stopped` policy
3. **Docker Compose handles scaling** - Just increase replicas
4. **PM2 + Docker = double scaling** - Causes CPU over-subscription

**Result**: Simpler architecture, better performance, easier debugging

---

## 📚 Documentation

### Essential Reading
- **[DOCKER_SCALING_GUIDE.md](DOCKER_SCALING_GUIDE.md)** - Complete Docker scaling guide
- **[DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md)** - Quick command reference
- **[PM2_SETUP.md](PM2_SETUP.md)** - PM2 documentation (non-Docker only)

### Additional Documentation
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Production deployment
- **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** - Getting started guide
- **[SERVICE_TOPOLOGY.md](SERVICE_TOPOLOGY.md)** - Service architecture
- **[PORTS.md](PORTS.md)** - Port allocation reference

---

## 🔧 Common Commands

### Start/Stop Services
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart auth-service
```

### Scale Services
```bash
# Scale to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Verify scaling
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f auth-service
```

### Monitor
```bash
# Service status
docker-compose -f docker-compose.prod.yml ps

# Resource usage
docker stats

# Health checks
docker inspect --format='{{.State.Health.Status}}' restpoint_auth_service
```

---

## 🏥 Health Checks

All services have health checks configured:

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check specific service
docker inspect --format='{{.State.Health.Status}}' restpoint_auth_service

# Health check endpoints
curl http://localhost:5000/health  # API Gateway
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # Tenant Service
# ... etc
```

---

## 🔐 Default Credentials

### MariaDB
- Host: `localhost:3306`
- Root Password: `RestPoint2024!`
- Database: `restpoint_main`
- User: `restpoint_user`
- Password: `${DB_PASSWORD}` (set in your .env or environment)

### Redis
- Host: `localhost:6379`
- Password: `RestPointRedis2024`

### RabbitMQ
- Host: `localhost:5672`
- Management UI: `http://localhost:15672`
- Username: `restpoint`
- Password: `RestPointRabbit2024`

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Language**: JavaScript/TypeScript
- **Database**: MariaDB 10.11
- **Cache**: Redis 7
- **Message Queue**: RabbitMQ 3
- **API Gateway**: Express.js with NGINX

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios
- **Real-time**: Socket.IO

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: NGINX
- **Logging**: Loki + Promtail + Grafana
- **Process Management**: Docker (not PM2)

---

## 📈 Performance Features

### Built-in Optimizations
- ✅ Horizontal scaling via Docker
- ✅ Redis caching layer
- ✅ Database connection pooling
- ✅ Health checks on all services
- ✅ NGINX load balancing
- ✅ Static asset caching
- ✅ Gzip compression
- ✅ WebSocket support

### Monitoring
- ✅ Container health checks
- ✅ Centralized logging (Loki)
- ✅ Metrics collection (Promtail)
- ✅ Visualization (Grafana)

---

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs auth-service

# Check health
docker inspect --format='{{.State.Health.Status}}' restpoint_auth_service

# Restart
docker-compose -f docker-compose.prod.yml restart auth-service
```

### High Resource Usage
```bash
# Check stats
docker stats

# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3

# Set resource limits in docker-compose.prod.yml
```

### Database Connection Issues
```bash
# Check MariaDB health
docker inspect --format='{{.State.Health.Status}}' restpoint_mariadb

# Test connection
docker exec restpoint_auth_service ping restpoint_mariadb
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

- **Documentation**: See `DOCKER_SCALING_GUIDE.md` and `DOCKER_QUICK_REFERENCE.md`
- **Issues**: Create issue in GitHub repository
- **Architecture**: See `SERVICE_TOPOLOGY.md`

---

## 🎯 Architecture Status

| Component | Status | Notes |
|-----------|--------|-------|
| Docker Containers | ✅ Production Ready | 1 process per container |
| Docker Compose | ✅ Production Ready | Proper orchestration |
| NGINX | ✅ Production Ready | Load balancing & proxy |
| Redis | ✅ Production Ready | Caching & sessions |
| RabbitMQ | ✅ Production Ready | Async messaging |
| MariaDB | ✅ Production Ready | Primary database |
| PM2 in Docker | ❌ Not Used | Docker handles scaling |
| Health Checks | ✅ Configured | All services |
| Logging | ✅ Configured | Loki + Promtail |
| Monitoring | ✅ Configured | Grafana dashboards |

---

## 🚀 Production Readiness Checklist

- [x] Docker-only scaling (no PM2)
- [x] Health checks on all services
- [x] Restart policies configured
- [x] Environment variables externalized
- [x] Volumes for persistence
- [x] Network isolation
- [x] Reverse proxy (NGINX)
- [x] Caching layer (Redis)
- [x] Message queue (RabbitMQ)
- [x] Centralized logging
- [x] Monitoring & metrics
- [x] Security headers
- [x] SSL termination ready

---

**Version**: 1.0.0  
**Architecture**: Microservices with Docker  
**Scaling**: Horizontal (Docker containers)  
**Status**: ✅ Production Ready  

**Remember**: Docker handles everything - no PM2 needed! 🐳