# Rest Point Production Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Make installed (optional but recommended)
- At least 4GB RAM available
- Ports 80, 3306, 6379, 5672 available

### One-Command Deployment

```bash
# Clone repository
git clone https://github.com/imbitheesther-art/REST-POINT.git
cd REST-POINT

# Copy environment file
cp .env.example .env

# Deploy everything
make deploy
```

### Default Login Credentials
- **Email:** infowelttallis@gmail.com
- **Password:** 40045355
- **Domain:** http://app.restpoint.co.ke (or http://localhost)

## Manual Deployment Steps

### 1. Environment Setup

```bash
# Copy and configure environment
cp .env.example .env

# Edit .env with your values (optional)
nano .env
```

### 2. Build and Start Services

```bash
# Create Docker network
docker network create restpoint

# Build all services
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 3. View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api-gateway
```

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services |
| `make up-backend` | Start only backend services |
| `make up-frontend` | Start only frontend |
| `make down` | Stop all services |
| `make logs` | View all logs |
| `make build` | Build all services |
| `make rebuild` | Rebuild and restart |
| `make migrate` | Run database migrations |
| `make seed` | Seed database with defaults |
| `make clean` | Remove everything |
| `make ps` | Show running containers |
| `make deploy` | Full deployment |

## Service Architecture

### Ports
- **80** - Frontend (nginx)
- **8000** - API Gateway
- **8001** - Auth Service
- **8002** - Tenant Service
- **8004** - Deceased Service
- **8005** - Invoice Service
- **8006** - Calendar Service
- **8007** - MPESA Service
- **8008** - Notification Service
- **3000** - Socket.IO Service
- **3306** - MariaDB
- **6379** - Redis
- **5672** - RabbitMQ
- **15672** - RabbitMQ Management

### Network
All services communicate through the `restpoint` Docker network.

## Tenant Onboarding

When a new tenant is registered:

1. **Tenant Service** creates tenant database
2. **Auth Service** creates tenant admin user
3. **Migrations** run automatically on tenant database
4. **Default data** is seeded

### Manual Tenant Creation

```bash
# Access tenant service shell
make shell service=tenant-service

# Create tenant via API
curl -X POST http://localhost:8002/api/v1/restpoint/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Mortuary",
    "slug": "new-mortuary",
    "email": "admin@newmortuary.com",
    "password": "securepassword"
  }'
```

## Database Migrations

Migrations run automatically on service startup. To run manually:

```bash
make migrate
```

## Backup and Restore

### Backup Database

```bash
docker exec restpoint_mariadb mysqldump -u root -pRestPoint2024! restpoint_main > backup.sql
```

### Restore Database

```bash
docker exec -i restpoint_mariadb mysql -u root -pRestPoint2024! restpoint_main < backup.sql
```

## Monitoring

### Health Checks

All services have health check endpoints:

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Individual health check
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

### Logs

```bash
# Real-time logs
make logs

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api-gateway
```

## Troubleshooting

### Services Won't Start

1. Check if ports are available:
```bash
netstat -tulpn | grep :80
```

2. Check Docker logs:
```bash
docker-compose -f docker-compose.prod.yml logs [service-name]
```

3. Restart services:
```bash
make rebuild
```

### Database Connection Issues

```bash
# Check if database is running
docker exec restpoint_mariadb mysql -u root -pRestPoint2024! -e "SHOW DATABASES;"

# Restart database
docker restart restpoint_mariadb
```

### Frontend Not Loading

1. Check if frontend is running:
```bash
docker logs restpoint_frontend
```

2. Check nginx configuration:
```bash
docker exec restpoint_frontend nginx -t
```

## Production Considerations

### Security
1. Change all default passwords in `.env`
2. Use strong JWT_SECRET
3. Enable HTTPS (configure in nginx)
4. Set up firewall rules
5. Use SSL certificates (Let's Encrypt)

### Performance
1. Increase database connection pool
2. Configure Redis persistence
3. Set up monitoring (Prometheus/Grafana)
4. Enable logging aggregation
5. Configure backup schedules

### Scaling
1. Use Docker Swarm or Kubernetes for orchestration
2. Set up load balancer
3. Configure horizontal pod autoscaling
4. Use external database service
5. Use managed Redis and RabbitMQ

## Support

For issues and questions:
- GitHub Issues: https://github.com/imbitheesther-art/REST-POINT/issues
- Email: support@restpoint.co.ke

## License

Proprietary - Rest Point 2024