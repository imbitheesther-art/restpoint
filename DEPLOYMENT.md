# RestPoint Docker Deployment Guide

## Overview

RestPoint is a complete microservices architecture with 22+ services orchestrated by Docker Compose. All services are standardized to use port 5000 internally and communicate via Docker DNS service names.

## Complete Service Port Map

| Service | Container | Internal | External | Status |
|---------|-----------|----------|----------|--------|
| API Gateway | restpoint_gateway | 5000 | 5000 | Core |
| Auth Service | restpoint_auth | 5000 | 5001 | Core |
| Tenant Service | restpoint_tenant | 5000 | 5002 | Core |
| Deceased Service | restpoint_deceased | 5000 | 5003 | Business |
| Marketplace Service | restpoint_marketplace | 5000 | 5004 | Business |
| Invoice Service | restpoint_invoice | 5000 | 5005 | Business |
| Coffin Service | restpoint_coffin | 5000 | 5006 | Business |
| Documents Service | restpoint_documents | 5000 | 5007 | Business |
| EDocuments Service | restpoint_edocuments | 5000 | 8116 | Business |
| Analytics Service | restpoint_analytics | 5000 | 5009 | Business |
| Calendar Service | restpoint_calendar | 5000 | 5010 | Business |
| M-Pesa Service | restpoint_mpesa | 5000 | 5011 | Business |
| Notification Service | restpoint_notification | 5000 | 5111 | Business |
| QR Code Service | restpoint_qrcode | 5000 | 5012 | Business |
| SocketIO Service | restpoint_socketio | 5000 | 5013 | Business |
| Visitors Service | restpoint_visitors | 5000 | 5014 | Business |
| Body Checkout Service | restpoint_bodycheckout | 5000 | 5015 | Business |
| Extra Services | restpoint_extra | 5000 | 5016 | Business |
| Call Service | restpoint_call | 5000 | 5018 | Business |
| Portal Service | restpoint_portal | 5000 | 5019 | Business |
| Chemical Service | restpoint_chemical | 5000 | 5105 | Business |
| Billing Service | restpoint_billing | 5000 | 5020 | Business |
| Frontend | restpoint_frontend | 80 | 8082 | UI |
| MariaDB | restpoint_mariadb | 3306 | 3306 | Infrastructure |
| Redis | restpoint_redis | 6379 | 6379 | Infrastructure |
| RabbitMQ | restpoint_rabbitmq | 5672 | 5672 | Infrastructure |

## Architecture

### Service Discovery
- Services communicate using Docker DNS: `http://service-name:5000`
- All services are on the same Docker network: `restpoint`
- Environment variables in each service's `.env` file contain service URLs

### Configuration
- **Root `.env`**: Shared infrastructure settings (DB, Redis, RabbitMQ, JWT secrets)
- **Service `.env` files**: Individual service configuration in `services/{service}/.env`
- Environment variables override defaults in Dockerfiles

### Frontend
- Nginx server proxies API requests to `http://api-gateway:5000/api`
- React SPA routing handled by Nginx (all routes → index.html)
- Static assets cached for 1 year
- Health check endpoint: `http://localhost/health`

## Quick Start  

### Prerequisites
- Docker & Docker Compose installed
- 4GB+ RAM available
- 20GB+ disk space

### Step 1: Start Services
```bash
./scripts/01-start-services.sh
```

This will:
1. Validate docker-compose.yml
2. Build Docker images
3. Start infrastructure (MariaDB, Redis, RabbitMQ)
4. Start core services (API Gateway, Auth, Tenant)
5. Start remaining services
6. Display running services

### Step 2: Verify Health
```bash
./scripts/02-health-check.sh
```

This checks all 22 services and reports their status.

### Step 3: Access Services
- **Frontend**: http://localhost:8082
- **API Gateway**: http://localhost:5000
- **RabbitMQ Management**: http://localhost:15672
- **Database**: localhost:3306

## Environment Configuration

### Root .env Variables
```
NODE_ENV=production
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=restpoint_main
DB_USER=restpoint_user
DB_PASSWORD=RestPointUser2024

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=RestPointRedis2024

JWT_SECRET=YourSecretHere
```

### Service-Specific Configuration
Each service has a `.env` file at `services/{service-name}/.env` with:
- PORT=5000 (standardized)
- Database credentials
- Redis connection
- Service-to-service URLs using Docker DNS

## Troubleshooting

### Check Service Logs
```bash
docker-compose logs -f service-name
```

### Interactive Troubleshooting
```bash
./scripts/03-troubleshoot.sh
```

### Common Issues

**Services not communicating:**
- Verify all services use Docker DNS: `http://service-name:5000`
- Check service `.env` files have correct service URLs
- Ensure all services are healthy: `./scripts/02-health-check.sh`

**Database connection errors:**
- Verify MariaDB is running: `docker-compose ps mariadb`
- Check database credentials in `.env`
- Ensure DB_HOST=mariadb (not localhost)

**Port conflicts:**
- Check external ports in `.env` are not in use
- Modify `EXTERNAL_PORT` variables if needed

**High memory usage:**
- Reduce services: comment out unused services in docker-compose.yml
- Monitor with: `docker stats`

## Deployment Scripts

### 01-start-services.sh
Starts all services with dependency order and health checks.

### 02-health-check.sh
Verifies all 22 services are responding to health checks.

### 03-troubleshoot.sh
Interactive tool for debugging services with log viewing, connectivity tests, and container management.

### 04-cleanup.sh
Stops all services and optionally removes volumes for a clean reset.

## Service Dependencies

### Infrastructure (Always Started First)
- mariadb (provides: database)
- redis (provides: cache)
- rabbitmq (provides: messaging)

### Core Services (Depend on Infrastructure)
- api-gateway (depends: redis, rabbitmq)
- auth-service (depends: mariadb, redis)
- tenant-service (depends: mariadb, redis, rabbitmq)

### Business Services
- Most depend on mariadb and/or redis
- Some have no dependencies (qrcode, edocuments, call)

### Frontend
- Depends on api-gateway being healthy

## Monitoring

### Docker Stats
```bash
docker stats
```

### Service Health
```bash
docker-compose ps
```

### Logs
```bash
docker-compose logs -f --tail=100
```

## Production Considerations

1. **Secrets Management**: Use Docker secrets or external secret management instead of .env files
2. **Resource Limits**: Add mem_limit and cpus limits to services
3. **Persistence**: Configure proper backup strategy for MariaDB volumes
4. **Monitoring**: Add Prometheus, Grafana, or similar monitoring
5. **Logging**: Use ELK stack or similar for centralized logging
6. **SSL/TLS**: Configure SSL certificates for production domains
7. **API Gateway**: Add rate limiting, authentication middleware
8. **Database**: Set up replication and backup strategy

## File Structure

```
new-repo/
├── .env                          # Root configuration
├── docker-compose.yml            # Service orchestration
├── nginx.conf                    # Frontend nginx config
├── DEPLOYMENT.md                 # This file
├── scripts/
│   ├── 01-start-services.sh
│   ├── 02-health-check.sh
│   ├── 03-troubleshoot.sh
│   └── 04-cleanup.sh
├── services/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   └── .env
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   └── .env
│   └── [20 more services with same structure]
└── FrontendClient/
    └── client/
        ├── Dockerfile
        └── nginx.conf (copied by build)
```

## Next Steps

1. Update `.env` with your production secrets
2. Update service `.env` files with specific configurations
3. Run `./scripts/01-start-services.sh`
4. Verify with `./scripts/02-health-check.sh`
5. Access frontend at http://localhost:8082

## Support

For issues:
1. Check logs: `docker-compose logs -f service-name`
2. Run troubleshooting: `./scripts/03-troubleshoot.sh`
3. Verify environment variables are set correctly
4. Ensure Docker daemon has sufficient resources

---

**Last Updated**: June 2026
**Version**: 1.0.0
