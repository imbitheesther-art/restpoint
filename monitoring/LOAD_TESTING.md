# Load Testing Guide - RestPoint Monitoring

Complete load testing setup using k6, InfluxDB, and Grafana for performance testing and analysis.

## Architecture

```
                    K6 Grafana (port 3003)
                       ▲
                       |
                  InfluxDB (port 8086)
                       ▲
                       |
                    K6 (port 6565)
                       |
                 Your Application
```

## Components

### 1. **K6** (port 6565)
- **Purpose**: Load and performance testing
- **Features**:
  - Simulates up to 200 concurrent users
  - Tests critical API endpoints
  - Measures response times, error rates, throughput
  - Exports results to InfluxDB

### 2. **InfluxDB** (port 8086)
- **Purpose**: Time-series database for k6 results
- **Credentials**: admin / admin123
- **Features**:
  - Stores load test metrics
  - Enables historical analysis
  - Powers Grafana dashboards

### 3. **K6 Grafana** (port 3003)
- **Purpose**: Load test results visualization
- **Credentials**: admin / admin123
- **Features**:
  - Pre-configured k6 dashboard
  - Real-time test monitoring
  - Historical performance tracking

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Main monitoring stack running (optional but recommended)
- Application running and accessible

### Start Load Testing Stack

```bash
cd monitoring/load-testing
docker compose up -d
```

### Verify Services

```bash
docker compose ps
```

Expected output:
- k6: Running on port 6565
- influxdb: Running on port 8086
- k6-grafana: Running on port 3003

## Running Load Tests

### Basic Load Test

```bash
cd monitoring/load-testing

# Run load test with default settings
docker compose exec k6 run /scripts/load-test.js
```

### Custom Load Test

```bash
# Test against specific URL
BASE_URL=http://your-app.com docker compose exec k6 run /scripts/load-test.js

# Run with custom output
docker compose exec k6 run /scripts/load-test.js --out json=/results/custom-results.json
```

### Load Test Scenarios

The default load test (`load-test.js`) includes these scenarios:

1. **Health Endpoints** - Tests API health checks
2. **Deceased List** - Tests deceased records listing
3. **Deceased Detail** - Tests individual record retrieval
4. **Dashboard Analytics** - Tests analytics endpoints
5. **Branch Operations** - Tests branch management
6. **Coffin Inventory** - Tests coffin inventory
7. **Hearse Availability** - Tests hearse management

### Test Configuration

The load test ramps up users gradually:

```
0-2 minutes:   Ramp up to 50 users
2-7 minutes:   Hold at 50 users
7-9 minutes:   Ramp up to 100 users
9-14 minutes:  Hold at 100 users
14-16 minutes: Ramp up to 200 users
16-21 minutes: Hold at 200 users
21-26 minutes: Ramp down to 0 users
```

### Performance Thresholds

The test enforces these thresholds:

- **Error Rate**: < 10%
- **Response Time (p95)**: < 500ms
- **HTTP Request Duration (p95)**: < 500ms

If thresholds are violated, k6 will exit with an error.

## Viewing Results

### Grafana Dashboard

1. **Access K6 Grafana**: http://localhost:3003
2. **Login**: admin / admin123
3. **Navigate to**: Dashboards → Load Testing → K6 Load Test Results

The dashboard shows:
- **HTTP Request Duration**: Response times over time (p95, p99)
- **Current Response Time by Endpoint**: Real-time gauge per endpoint
- **Request Rate**: Requests per second over time
- **Virtual Users (VUs)**: Active concurrent users
- **Error Rate**: Percentage of failed requests
- **Failed Requests**: Failed requests over time

### Prometheus Metrics

If you have the main monitoring stack running, k6 metrics are also available in Prometheus:

```promql
# Request rate
rate(k6_http_reqs[5m])

# Response time
histogram_quantile(0.95, k6_http_req_duration)

# Error rate
rate(k6_http_req_failed[5m])

# Virtual users
k6_vus
```

### Console Output

During the test, k6 outputs real-time statistics:

```
running (26m30.0s), 000/200 VUs, 15234 complete iterations
time="2024-01-15 10:30:00"  time="2024-01-15 10:30:01"
time="2024-01-15 10:30:02"  time="2024-01-15 10:30:03"

█ http_req_duration
  ✓ avg=123.45ms  min=12.34ms  med=98.76ms  max=567.89ms  p(95)=234.56ms  p(99)=456.78ms

█ http_req_failed
  ✓ 0.00% ✓ 12345  ✗ 0

█ http_reqs
  ✓ 15234  1234.567/s
```

## Application Metrics Integration

### Adding Metrics to Your Application

To track application-level metrics during load tests, integrate the `application-metrics.js` module:

#### 1. Install prom-client

```bash
npm install prom-client
```

#### 2. Add Metrics Middleware

```javascript
const { metricsMiddleware, setupGlobalErrorHandlers, metricsEndpoint } = require('./monitoring/load-testing/scripts/application-metrics');

// Add metrics middleware to all routes
app.use(metricsMiddleware('api-gateway'));

// Setup global error handlers
setupGlobalErrorHandlers('api-gateway');

// Add metrics endpoint
app.get('/metrics', metricsEndpoint);
```

#### 3. Track Database Queries

```javascript
const { trackDbQuery, trackDbError } = require('./monitoring/load-testing/scripts/application-metrics');

// Wrap database queries
const start = Date.now();
try {
  const result = await db.query('SELECT * FROM deceased');
  const duration = (Date.now() - start) / 1000;
  trackDbQuery('api-gateway', 'select', 'deceased', duration);
} catch (err) {
  trackDbError('api-gateway', err.name);
  throw err;
}
```

#### 4. Track Business Events

```javascript
const { trackDeceasedRegistration, trackBooking, trackInvoice } = require('./monitoring/load-testing/scripts/application-metrics');

// Track deceased registration
trackDeceasedRegistration('deceased-service', 'Nairobi');

// Track booking
trackBooking('hearse-service', 'hearse', 'confirmed');

// Track invoice
trackInvoice('invoice-service', 'paid');
```

### Metrics Exposed

The application metrics module exposes these metrics:

**HTTP Metrics:**
- `http_requests_total` - Total HTTP requests (by method, route, status, service)
- `http_request_duration_seconds` - Request duration histogram
- `http_errors_total` - HTTP error responses (4xx, 5xx)

**Error Metrics:**
- `unhandled_rejection_total` - Unhandled promise rejections
- `uncaught_exception_total` - Uncaught exceptions

**Resource Metrics:**
- `active_connections` - Current active connections
- `process_memory_usage_bytes` - Memory usage (RSS, heap, external)
- `event_loop_lag_seconds` - Node.js event loop lag

**Database Metrics:**
- `database_queries_total` - Total database queries
- `database_query_duration_seconds` - Query duration histogram
- `database_connection_errors_total` - Database connection errors

**Business Metrics:**
- `deceased_registrations_total` - Deceased registrations
- `bookings_total` - Bookings by type and status
- `invoices_total` - Invoices by status

## Custom Load Tests

### Creating Custom Test Scenarios

Create a new test file in `monitoring/load-testing/scripts/`:

```javascript
// custom-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  // Your test scenario
  const response = http.get('http://localhost:5000/api/v1/restpoint/your-endpoint');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

### Running Custom Tests

```bash
docker compose exec k6 run /scripts/custom-test.js
```

### Load Test with Authentication

```javascript
export function setup() {
  const loginResponse = http.post(`${BASE_URL}/auth/login`, {
    email: 'test@example.com',
    password: 'password'
  });
  
  return {
    token: loginResponse.json('data.token')
  };
}

export default function (data) {
  const response = http.get(`${BASE_URL}/api/v1/restpoint/protected`, {
    headers: {
      'Authorization': `Bearer ${data.token}`
    }
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

## Analyzing Results

### Key Metrics to Monitor

**Performance:**
- **p95 Response Time**: 95% of requests complete within this time
- **p99 Response Time**: 99% of requests complete within this time
- **Average Response Time**: Mean response time
- **Request Rate**: Requests per second (throughput)

**Reliability:**
- **Error Rate**: Percentage of failed requests
- **Failed Requests**: Absolute number of failures
- **HTTP Errors**: 4xx and 5xx status codes

**Capacity:**
- **Virtual Users (VUs)**: Concurrent users simulated
- **Active Connections**: Current open connections
- **Request Distribution**: Requests per endpoint

### Identifying Bottlenecks

**High Response Times:**
```promql
# Find slowest endpoints
topk(10, avg by (route) (k6_http_req_duration{quantile="0.95"}))
```

**High Error Rates:**
```promql
# Find endpoints with most errors
topk(10, sum by (route) (rate(k6_http_req_failed[5m])))
```

**Database Bottlenecks:**
```promql
# Slow database queries
histogram_quantile(0.95, sum by (table) (rate(database_query_duration_seconds[5m])))
```

## Integration with Main Monitoring

### Add k6 to Prometheus

Add this to `monitoring/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'k6'
    static_configs:
      - targets: ['host.docker.internal:6565']
        labels:
          service: 'k6'
          component: 'load-testing'
```

### Unified Grafana Dashboard

Create a unified dashboard that shows:
- Application metrics (from Prometheus)
- Load test results (from InfluxDB)
- Infrastructure metrics (from Node Exporter)
- Container metrics (from cAdvisor)

## Best Practices

### 1. Test Environment

- **Isolate test environment** from production
- **Use production-like data** (anonymized)
- **Test during off-peak hours**
- **Monitor infrastructure** during tests

### 2. Test Scenarios

- **Start small**: Begin with 10-20 users, gradually increase
- **Test critical paths**: Focus on most-used endpoints
- **Include think time**: Add realistic delays between requests
- **Test error scenarios**: Include 404s, 500s, timeouts

### 3. Performance Baselines

- **Establish baselines** before optimization
- **Set SLOs** (Service Level Objectives)
- **Track trends** over time
- **Compare before/after** changes

### 4. Continuous Testing

- **Run tests in CI/CD** pipeline
- **Test on every deployment**
- **Alert on performance regressions**
- **Document performance trends**

## Troubleshooting

### k6 Won't Start

```bash
# Check k6 logs
docker compose logs k6

# Verify InfluxDB is running
docker compose ps influxdb

# Restart k6
docker compose restart k6
```

### No Data in Grafana

```bash
# Verify InfluxDB connection
curl http://localhost:8086/ping

# Check k6 is outputting to InfluxDB
docker compose logs k6 | grep influxdb

# Verify Grafana datasource
# Visit http://localhost:3003/datasources
```

### Tests Failing

```bash
# Run test with more verbose output
docker compose exec k6 run /scripts/load-test.js --verbose

# Test single endpoint manually
curl http://localhost:5000/api/v1/restpoint/health

# Check application logs
docker logs restpoint-api-gateway
```

### High Error Rates

Common causes:
- **Application not running**: Verify app is accessible
- **Database overloaded**: Check DB connection pool
- **Insufficient resources**: Monitor CPU/RAM during test
- **Network issues**: Check firewall/ports

## Advanced Configuration

### Custom Test Parameters

```bash
# Override environment variables
BASE_URL=https://staging.example.com docker compose exec k6 run /scripts/load-test.js

# Run with custom iterations
docker compose exec k6 run /scripts/load-test.js --iterations 1000

# Run for specific duration
docker compose exec k6 run /scripts/load-test.js --duration 5m
```

### Distributed Load Testing

Run k6 on multiple machines:

```bash
# Start k6 in distributed mode
k6 run --out influxdb=http://influxdb:8086/k6 load-test.js

# On other machines
k6 run --out influxdb=http://influxdb:8086/k6 load-test.js
```

### Load Test Profiles

Create different test profiles:

**Smoke Test** (quick sanity check):
```javascript
export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 5 },
    { duration: '30s', target: 0 },
  ],
};
```

**Load Test** (normal expected load):
```javascript
export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '5m', target: 0 },
  ],
};
```

**Stress Test** (find breaking point):
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 300 },
    { duration: '5m', target: 400 },
    { duration: '2m', target: 0 },
  ],
};
```

**Soak Test** (long-term stability):
```javascript
export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '2h', target: 100 },
    { duration: '5m', target: 0 },
  ],
};
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Test

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
        - name: Start load testing stack
          run: |
            cd monitoring/load-testing
            docker compose up -d
      
      - name: Run load test
        run: |
          cd monitoring/load-testing
          docker compose exec k6 run /scripts/load-test.js
      
      - name: Check thresholds
        run: |
          # Add threshold validation here
          echo "Load test passed"
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: k6-results
          path: monitoring/load-testing/results/
```

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [InfluxDB Documentation](https://docs.influxdata.com/influxdb/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/load-testing/)

## Support

For issues with load testing:
1. Check k6 logs: `docker compose logs k6`
2. Verify InfluxDB: `curl http://localhost:8086/ping`
3. Check Grafana: http://localhost:3003
4. Review application logs during test