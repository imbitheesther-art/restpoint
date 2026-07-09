const fs = require('fs');

let content = fs.readFileSync('docker-compose.yml', 'utf8');

// Services that should NOT expose ports (internal microservices)
const internalServices = [
    'auth-service',
    'tenant-service',
    'deceased-service',
    'billing-service',
    'notification-service',
    'support-service',
    'documents-service',
    'socketio-service',
    'invoice-service',
    'coffin-service',
    'analytics-service',
    'bodycheckout-service',
    'chemical-service',
    'workshop-service',
    'extra-services',
    'visitors-service',
    'scanner-service'
];

internalServices.forEach(service => {
    // Match the service block and remove ports section
    const regex = new RegExp(`(  ${service}:\\s*\\n)(\\s*ports:.*?\\n)(\\s*environment:)`, 'gs');
    content = content.replace(regex, '$1$3');
});

fs.writeFileSync('docker-compose.yml', content);
console.log(' Removed port exposure from internal microservices');
console.log('Only API Gateway (5000), Frontend (8080), and infrastructure services expose ports');