import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Test configuration
export const options = {
    stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 200 },  // Ramp up to 200 users
        { duration: '5m', target: 200 },  // Stay at 200 users
        { duration: '5m', target: 0 },    // Ramp down to 0 users
    ],
    thresholds: {
        errors: ['rate<0.1'],           // Error rate should be < 10%
        response_time: ['p(95)<500'],   // 95% of requests should be < 500ms
        http_req_duration: ['p(95)<500'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_PREFIX = '/api/v1/restpoint';

// Helper function to make authenticated requests
function makeRequest(method, path, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const params = {
        headers,
        tags: {
            test: 'load-test',
            method: method,
            endpoint: path,
        },
    };

    const start = Date.now();
    let response;

    try {
        if (method === 'GET') {
            response = http.get(`${BASE_URL}${path}`, params);
        } else if (method === 'POST') {
            response = http.post(`${BASE_URL}${path}`, JSON.stringify(body), params);
        } else if (method === 'PUT') {
            response = http.put(`${BASE_URL}${path}`, JSON.stringify(body), params);
        } else if (method === 'DELETE') {
            response = http.del(`${BASE_URL}${path}`, params);
        }

        const duration = (Date.now() - start) / 1000;
        responseTime.add(duration, { endpoint: path });
        requestCount.add(1);

        return response;
    } catch (error) {
        errorRate.add(1);
        requestCount.add(1);
        throw error;
    }
}

// Test scenarios
export function testHealthEndpoints() {
    console.log('Testing health endpoints...');

    // API Gateway health
    const healthResponse = makeRequest('GET', '/health');
    check(healthResponse, {
        'health status is 200': (r) => r.status === 200,
        'health response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);

    sleep(1);
}

export function testDeceasedList() {
    console.log('Testing deceased list endpoint...');

    const response = makeRequest('GET', `${API_PREFIX}/deceased/deceased-all`);
    check(response, {
        'deceased list status is 200': (r) => r.status === 200,
        'deceased list response time < 500ms': (r) => r.timings.duration < 500,
        'deceased list returns data': (r) => {
            const body = r.json();
            return body.data || body;
        },
    }) || errorRate.add(1);

    sleep(2);
}

export function testDeceasedDetail() {
    console.log('Testing deceased detail endpoint...');

    // Use a test ID (you may need to adjust this)
    const testId = 'TEST-001';
    const response = makeRequest('GET', `${API_PREFIX}/deceased/${testId}`);

    // Accept 200 or 404 (if test ID doesn't exist)
    check(response, {
        'deceased detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
        'deceased detail response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);

    sleep(1);
}

export function testDashboardAnalytics() {
    console.log('Testing dashboard analytics...');

    const response = makeRequest('GET', `${API_PREFIX}/analytics/dashboard/comprehensive`);
    check(response, {
        'analytics status is 200': (r) => r.status === 200,
        'analytics response time < 1000ms': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    sleep(3);
}

export function testBranchOperations() {
    console.log('Testing branch operations...');

    const response = makeRequest('GET', `${API_PREFIX}/tenant/branches`);
    check(response, {
        'branches status is 200': (r) => r.status === 200,
        'branches response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);

    sleep(2);
}

export function testCoffinInventory() {
    console.log('Testing coffin inventory...');

    const response = makeRequest('GET', `${API_PREFIX}/coffins/all-coffins`);
    check(response, {
        'coffins status is 200': (r) => r.status === 200,
        'coffins response time < 400ms': (r) => r.timings.duration < 400,
    }) || errorRate.add(1);

    sleep(2);
}

export function testHearseAvailability() {
    console.log('Testing hearse availability...');

    const response = makeRequest('GET', `${API_PREFIX}/hearse/hearses`);
    check(response, {
        'hearses status is 200': (r) => r.status === 200,
        'hearses response time < 400ms': (r) => r.timings.duration < 400,
    }) || errorRate.add(1);

    sleep(2);
}

// Main test flow
export default function () {
    // Test critical endpoints
    testHealthEndpoints();
    testDeceasedList();
    testDeceasedDetail();
    testDashboardAnalytics();
    testBranchOperations();
    testCoffinInventory();
    testHearseAvailability();

    // Random sleep to simulate real user behavior
    sleep(Math.random() * 3 + 1);
}

// Test setup
export function setup() {
    console.log('Starting load test...');
    console.log(`Target URL: ${BASE_URL}`);

    // You can add authentication here if needed
    // const loginResponse = http.post(`${BASE_URL}/auth/login`, ...);
    // return { token: loginResponse.data.token };

    return {};
}

// Test teardown
export function teardown(data) {
    console.log('Load test completed');
    console.log(`Total requests: ${requestCount.value}`);
    console.log(`Error rate: ${(errorRate.value * 100).toFixed(2)}%`);
    console.log(`Average response time: ${responseTime.value.toFixed(2)}ms`);
}

// Handle summary
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'results.json': JSON.stringify(data),
    };
}