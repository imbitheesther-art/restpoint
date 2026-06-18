const fs = require('fs');

const services = [
  { name: 'api-gateway', port: '5000', deps: ['redis', 'rabbitmq'], dockerfile: 'services/api-gateway/Dockerfile' },
  { name: 'auth-service', port: '5001', deps: ['mariadb', 'redis'], dockerfile: 'services/auth-service/Dockerfile' },
  { name: 'tenant-service', port: '5002', deps: ['mariadb', 'redis', 'rabbitmq'], dockerfile: 'services/tenant-service/Dockerfile' },
  { name: 'deceased-service', port: '5003', deps: ['mariadb', 'redis'], dockerfile: 'services/deceased-service/Dockerfile' },
  { name: 'marketplace-service', port: '5004', deps: ['mariadb', 'redis'], dockerfile: 'services/marketplace-service/Dockerfile' },
  { name: 'invoice-service', port: '5005', deps: ['mariadb', 'redis'], dockerfile: 'services/invoice-service/Dockerfile' },
  { name: 'coffin-service', port: '5006', deps: ['mariadb', 'redis'], dockerfile: 'services/coffin-service/Dockerfile' },
  { name: 'documents-service', port: '5007', deps: ['mariadb', 'redis'], dockerfile: 'services/documents-service/Dockerfile' },
  { name: 'edocuments-service', port: '8116', deps: [], dockerfile: 'services/edocuments-service/Dockerfile' },
  { name: 'analytics-service', port: '5009', deps: ['mariadb', 'redis'], dockerfile: 'services/analytics-service/Dockerfile' },
  { name: 'calender-service', port: '5010', deps: ['mariadb', 'redis'], dockerfile: 'services/calender-service/Dockerfile' },
  { name: 'mpesa-service', port: '5011', deps: ['mariadb'], dockerfile: 'services/mpesa-service/Dockerfile' },
  { name: 'notification-service', port: '5111', deps: ['redis', 'rabbitmq', 'mariadb'], dockerfile: 'services/notification-service/Dockerfile' },
  { name: 'qrcode-service', port: '5012', deps: [], dockerfile: 'services/qrcode-service/Dockerfile' },
  { name: 'socketio-service', port: '5013', deps: ['redis'], dockerfile: 'services/socketio-service/Dockerfile' },
  { name: 'visitors-service', port: '5014', deps: ['mariadb', 'redis'], dockerfile: 'services/visitors-service/Dockerfile' },
  { name: 'bodycheckout-service', port: '5015', deps: ['mariadb', 'redis'], dockerfile: 'services/bodycheckout-service/Dockerfile' },
  { name: 'extra-services', port: '5016', deps: ['mariadb'], dockerfile: 'services/extra-services/Dockerfile' },
  { name: 'call-service', port: '5018', deps: [], dockerfile: 'services/call-service/Dockerfile' },
  { name: 'portal-service', port: '5019', deps: ['mariadb'], dockerfile: 'services/portal-service/Dockerfile' },
  { name: 'chemical-service', port: '5105', deps: ['mariadb'], dockerfile: 'services/chemical-service/Dockerfile' },
  { name: 'billing-service', port: '5020', deps: ['mariadb', 'redis'], dockerfile: 'services/billing-service/Dockerfile' },
];

let serviceContent = '\nservices:\n';

services.forEach(svc => {
  const portEnvName = svc.name.replace(/-/g, '_').toUpperCase() + '_EXTERNAL_PORT';
  const depsYaml = svc.deps.length > 0 ? 
    `    depends_on:\n${svc.deps.map(d => `      ${d}:\n        condition: service_healthy`).join('\n')}\n` : '';

  serviceContent += `
  ${svc.name}:
    build:
      context: .
      dockerfile: ${svc.dockerfile}
    container_name: restpoint_${svc.name.replace(/-/g, '_')}
    restart: unless-stopped
    ports:
      - "\${${portEnvName}:-${svc.port}}:5000"
    env_file:
      - .env
      - ${svc.dockerfile.replace(/Dockerfile/, '.env')}
    environment:
      NODE_ENV: production
      PORT: 5000
${depsYaml}    networks:
      - restpoint
`;
});

// Add frontend
serviceContent += `
  frontend:
    build:
      context: ./FrontendClient/client
      dockerfile: Dockerfile
    container_name: restpoint_frontend
    restart: unless-stopped
    ports:
      - "\${FRONTEND_EXTERNAL_PORT:-8082}:80"
    env_file:
      - .env
    depends_on:
      api-gateway:
        condition: service_healthy
    networks:
      - restpoint
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 30s`;

fs.appendFileSync('docker-compose.yml', serviceContent);
console.log('✅ Added all services to docker-compose.yml');
