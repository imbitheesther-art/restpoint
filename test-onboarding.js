const http = require('http');

const data = JSON.stringify({
    tenant_name: 'TestOrg',
    email: 'admin@test.com',
    password: 'Test123!',
    full_name: 'Admin User',
    location: 'Nairobi',
    country: 'Kenya',
    phone: '+254700000000',
    accept_terms: true
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/restpoint/tenant/onboarding/organization',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.write(data);
req.end();