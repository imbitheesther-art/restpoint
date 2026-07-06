# 🚀 PRODUCTION QUICK REFERENCE GUIDE
## Workshop Management System

---

## 📱 ACCESS URLS

| Service | URL | Credentials |
|---------|-----|-------------|
| **Workshop Management** | http://localhost:8082/tenant/mumo-feuneral-home/workshop | Your login credentials |
| **API Gateway** | http://localhost:5000/health | - |
| **Workshop API** | http://localhost:6969/api/health | - |
| **Grafana Monitoring** | http://localhost:3000 | admin / admin |
| **RabbitMQ Management** | http://localhost:15672 | restpoint / RestPointRabbit2024 |

---

## 🔧 DAILY OPERATIONS

### Start System
```bash
docker-compose up -d
```

### Stop System
```bash
docker-compose down
```

### Restart System
```bash
docker-compose restart
```

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f workshop-service

# Last 100 lines
docker-compose logs --tail=100 workshop-service
```

---

## 💾 BACKUP COMMANDS

### Immediate Backup
```bash
# Database backup
docker-compose exec mariadb mysqldump -u restpoint_user -pRestPointUser2024 \
  restpoint_main > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress
gzip backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automated Backup (Setup Once)
```bash
# Add to crontab
crontab -e

# Daily at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh
```

### Verify Backup
```bash
# Test backup file
gzip -t db_backup_20250605_020000.sql.gz && echo "✅ Backup OK"

# Test restore
gunzip < db_backup_20250605_020000.sql.gz | \
  docker-compose exec -i mariadb mysql -u restpoint_user -pRestPointUser2024 test_db
```

---

## 🔄 ROLLBACK COMMANDS

### Quick Rollback (Last 24 Hours)
```bash
# Stop services
docker-compose down

# Restore database
LATEST_BACKUP=$(ls -t /backups/db_backup_*.sql.gz | head -1)
gunzip < $LATEST_BACKUP | docker-compose exec -i mariadb mysql -u root -pRestPoint2024! restpoint_main

# Start services
docker-compose up -d

# Verify
curl -f http://localhost:6969/api/health
```

### Rollback to Specific Date
```bash
./scripts/rollback.sh 20250605
```

### Restart Single Service
```bash
# Restart workshop service only
docker-compose restart workshop-service

# Rebuild and restart
docker-compose up -d --build workshop-service
```

---

## 🚨 EMERGENCY PROCEDURES

### System Down
```bash
# 1. Check status
docker-compose ps

# 2. Check logs
docker-compose logs --tail=50

# 3. Restart all
docker-compose restart

# 4. If still down, full restart
docker-compose down
docker-compose up -d
```

### Database Issues
```bash
# Check database
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 -e "SHOW DATABASES;"

# Restart database
docker-compose restart mariadb

# Restore from backup
gunzip < /backups/db_backup_latest.sql.gz | \
  docker-compose exec -i mariadb mysql -u root -pRestPoint2024! restpoint_main
```

### Data Loss
```bash
# 1. Stop services
docker-compose down

# 2. Restore from latest backup
gunzip < /backups/db_backup_latest.sql.gz | \
  docker-compose exec -i mariadb mysql -u root -pRestPoint2024! restpoint_main

# 3. Start services
docker-compose up -d

# 4. Verify
curl -f http://localhost:6969/api/health
```

---

## 📊 MONITORING COMMANDS

### Health Checks
```bash
# Check all services
curl http://localhost:5000/health
curl http://localhost:6969/api/health
curl http://localhost:8082/

# Check database
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 -e "SELECT 1;"

# Check Redis
docker-compose exec redis redis-cli ping

# Check RabbitMQ
docker-compose exec rabbitmq rabbitmq-diagnostics ping
```

### Resource Usage
```bash
# Docker stats
docker stats

# Disk usage
docker system df

# Volume sizes
docker system df -v

# Container logs
docker-compose logs --tail=100
```

### Database Monitoring
```bash
# Active connections
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "SHOW PROCESSLIST;"

# Database size
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "SELECT table_name, table_rows, data_length FROM information_schema.tables WHERE table_schema = 'restpoint_main';"

# Slow queries
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "SHOW VARIABLES LIKE 'slow_query%';"
```

---

## 🗄️ DATABASE OPERATIONS

### Create Backup
```bash
docker-compose exec mariadb mysqldump -u restpoint_user -pRestPointUser2024 \
  --routines --triggers --events \
  restpoint_main > backup.sql
```

### Restore Database
```bash
docker-compose exec -i mariadb mysql -u root -pRestPoint2024! restpoint_main < backup.sql
```

### Database Maintenance
```bash
# Optimize tables
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "USE restpoint_main; CHECK TABLE coffin_orders, materials, workers; OPTIMIZE TABLE coffin_orders, materials, workers;"

# Check integrity
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "USE restpoint_main; CHECK TABLE coffin_orders, materials, workers;"
```

---

## 📦 VOLUME MANAGEMENT

### List Volumes
```bash
docker volume ls | grep restpoint
```

### Inspect Volume
```bash
docker volume inspect restpoint_mariadb_data
```

### Backup Volume
```bash
docker run --rm \
  -v restpoint_mariadb_data:/data \
  -v /backups:/backup \
  alpine tar czf /backup/mariadb_backup.tar.gz /data
```

### Restore Volume
```bash
docker-compose down
docker run --rm \
  -v restpoint_mariadb_data:/data \
  -v /backups:/backup \
  alpine tar xzf /backup/mariadb_backup.tar.gz -C /data
docker-compose up -d
```

---

## 🔐 SECURITY

### Change Passwords
```bash
# 1. Update .env file
# 2. Rebuild services
docker-compose down
docker-compose up -d --build

# 3. Update database password
docker-compose exec mariadb mysql -u root -pRestPoint2024! -e "ALTER USER 'restpoint_user'@'%' IDENTIFIED BY 'NewPassword'; FLUSH PRIVILEGES;"
```

### View Logs for Security Issues
```bash
# Failed login attempts
docker-compose logs | grep -i "failed\|error\|unauthorized"

# API errors
docker-compose logs workshop-service | grep -i "error\|exception"
```

---

## 📈 PERFORMANCE

### Scale Services
```bash
# Scale workshop service to 3 instances
docker-compose up -d --scale workshop-service=3

# Scale API gateway
docker-compose up -d --scale api-gateway=2
```

### Clear Cache
```bash
# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# Clear Docker cache
docker system prune -a
```

### Database Optimization
```bash
# Analyze tables
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "USE restpoint_main; ANALYZE TABLE coffin_orders, materials, workers;"

# Add indexes (if needed)
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "USE restpoint_main; CREATE INDEX idx_orders_status ON coffin_orders(status); CREATE INDEX idx_materials_category ON materials(category);"
```

---

## 🆘 TROUBLESHOOTING

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild
docker-compose up -d --build <service-name>

# Remove and recreate
docker-compose down <service-name>
docker-compose up -d <service-name>
```

### Database Connection Issues
```bash
# Check database is running
docker-compose ps mariadb

# Check credentials
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 -e "SELECT 1;"

# Restart database
docker-compose restart mariadb
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Remove old backups
rm /backups/db_backup_*.sql.gz
```

---

## 📞 SUPPORT CONTACTS

| Role | Contact | When to Call |
|------|---------|--------------|
| **On-call Developer** | +254-700-000-000 | Service down, errors |
| **DevOps Lead** | +254-700-000-001 | Infrastructure issues |
| **Database Admin** | +254-700-000-003 | Data loss, corruption |
| **System Admin** | +254-700-000-004 | Server issues |

---

## ✅ DAILY CHECKLIST

### Morning (Before Work Starts)
- [ ] All services running (`docker-compose ps`)
- [ ] Health checks passing (`curl http://localhost:6969/api/health`)
- [ ] Database accessible
- [ ] No errors in logs
- [ ] Disk space adequate (>20% free)
- [ ] Backup from last night completed

### Evening (After Work Ends)
- [ ] All orders saved
- [ ] No pending operations
- [ ] Backup completed
- [ ] Logs reviewed for errors
- [ ] System status documented

### Weekly
- [ ] Review backup logs
- [ ] Check disk usage trends
- [ ] Review error logs
- [ ] Test backup restoration
- [ ] Update documentation

### Monthly
- [ ] Full system backup
- [ ] Disaster recovery drill
- [ ] Security audit
- [ ] Performance review
- [ ] Update dependencies

---

## 🎯 QUICK FIXES

### Service Won't Start
```bash
docker-compose down
docker-compose up -d
```

### Database Connection Lost
```bash
docker-compose restart mariadb
sleep 10
docker-compose restart workshop-service
```

### Out of Memory
```bash
# Restart services
docker-compose restart

# Check for memory leaks
docker stats
```

### Slow Performance
```bash
# Clear cache
docker-compose exec redis redis-cli FLUSHALL

# Restart services
docker-compose restart

# Check database
docker-compose exec mariadb mysql -u restpoint_user -pRestPointUser2024 \
  -e "SHOW PROCESSLIST;"
```

---

## 📋 IMPORTANT FILES

| File | Purpose | Location |
|------|---------|----------|
| **docker-compose.yml** | Service configuration | Root directory |
| **.env** | Environment variables | Root directory |
| **BACKUP_AND_ROLLBACK.md** | Backup procedures | Root directory |
| **PRODUCTION_DEPLOYMENT.md** | Deployment guide | Root directory |
| **SYSTEM_READY.md** | System overview | Root directory |
| **scripts/backup-database.sh** | Backup script | scripts/ |
| **scripts/rollback.sh** | Rollback script | scripts/ |
| **scripts/health-check.sh** | Health check | scripts/ |

---

## 🎉 REMEMBER

✅ **Database volumes are PERSISTENT** - Data is never lost when containers stop
✅ **Backups run daily at 2 AM** - Automatic and compressed
✅ **30-day retention** - Old backups auto-deleted
✅ **Health checks every 5 minutes** - Issues caught early
✅ **One-click rollback** - Restore to any previous state

---

## 🆘 EMERGENCY

**If everything fails:**
```bash
# 1. Stop everything
docker-compose down

# 2. Restore from backup
gunzip < /backups/db_backup_latest.sql.gz | \
  docker-compose exec -i mariadb mysql -u root -pRestPoint2024! restpoint_main

# 3. Start everything
docker-compose up -d

# 4. Verify
curl -f http://localhost:6969/api/health
```

**Your data is safe. Your system is backed up. You can always rollback.**

---

**Last Updated:** 2025-06-05
**Version:** 1.0.0
**Status:** Production Ready ✅