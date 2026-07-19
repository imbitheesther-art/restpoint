# Quick Start Guide - RestPoint Monitoring

## One-Command Setup

### Windows
```bash
cd monitoring
start-monitoring.bat
```

### Linux/Mac
```bash
cd monitoring
chmod +x start-monitoring.sh
./start-monitoring.sh
```

### Or use docker compose directly:
```bash
cd monitoring
docker compose up -d
```

## Access URLs

| Tool | URL | Credentials |
|------|-----|-------------|
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **Prometheus** | http://localhost:9090 | None |
| **Uptime Kuma** | http://localhost:3002 | Create on first visit |
| **cAdvisor** | http://localhost:8081 | None |
| **Loki** | http://localhost:3100 | None |

## First Steps

### 1. Import Grafana Dashboards (5 minutes)

1. Go to http://localhost:3001
2. Login with `admin` / `admin123`
3. Click "+" → "Import"
4. Enter these dashboard IDs:

| Dashboard | ID | What it shows |
|-----------|-----|---------------|
| Node Exporter Full | 1860 | Server CPU, RAM, Disk, Network |
| cAdvisor | 893 | Container metrics |
| Blackbox Exporter | 7587 | Service availability |
| Docker Monitoring | 179 | Docker container overview |
| Prometheus Stats | 2 | Prometheus itself |

### 2. Set Up Uptime Kuma (2 minutes)

1. Go to http://localhost:3002
2. Create admin account
3. Click "Add New Monitor"
4. Add these monitors:
   - **Website**: https://restpoint.co.ke
   - **API Gateway**: http://localhost:5000/health
   - **Deceased Service**: http://localhost:5001/health

### 3. Verify Everything Works (1 minute)

```bash
# Check all services are running
docker compose ps

# Check Prometheus targets
curl http://localhost:9090/targets

# Test Blackbox Exporter
curl 'http://localhost:9115/probe?target=google.com&module=http_2xx'
```

## Common Commands

```bash
# Start monitoring
docker compose up -d

# Stop monitoring
docker compose down

# View logs
docker compose logs -f

# Restart specific service
docker compose restart prometheus

# Check status
docker compose ps
```

## What Gets Monitored

### Server Health (Node Exporter)
- CPU usage per core
- Memory usage (RAM, swap)
- Disk space and I/O
- Network traffic
- System load

### Container Health (cAdvisor)
- CPU, memory, network per container
- Disk usage per container
- Container restarts
- Resource limits

### Service Availability (Blackbox Exporter)
- Website uptime
- API Gateway health
- All microservice health endpoints
- Database connectivity
- SSL certificate validity

### Application Metrics (Prometheus)
- HTTP request rate
- Response times
- Error rates
- Custom business metrics

### Logs (Loki + Promtail)
- Application logs
- Docker container logs
- System logs
- Nginx logs

## Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker info

# Check logs
docker compose logs

# Restart
docker compose down
docker compose up -d
```

### Can't access Grafana
```bash
# Check if port 3001 is in use
netstat -tulpn | grep :3001

# Check Grafana logs
docker logs restpoint-grafana
```

### No metrics appearing
```bash
# Check Prometheus targets
# Visit http://localhost:9090/targets

# Test Node Exporter
curl http://localhost:9100/metrics

# Test cAdvisor
curl http://localhost:8081/metrics
```

## Next Steps

1. **Add custom metrics** to your application (see README.md)
2. **Create custom dashboards** in Grafana
3. **Set up alerts** for critical metrics
4. **Configure notifications** in Uptime Kuma
5. **Review logs** in Grafana Explore

## Support

- Full documentation: See README.md
- Prometheus docs: https://prometheus.io/docs/
- Grafana docs: https://grafana.com/docs/

## Production Deployment

Before deploying to production:

1. **Change default passwords**
2. **Enable HTTPS** with SSL certificates
3. **Configure firewall** to restrict access
4. **Set up backups** for Grafana and Prometheus data
5. **Enable authentication** on all tools
6. **Configure alerts** with notification channels