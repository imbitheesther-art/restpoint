const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../controllers/deceasedControl.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `        // Create notification for new deceased registration (non-blocking)
        const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8111';
        axios.post(\`\${notificationServiceUrl}/api/v1/restpoint/notification/notifications\`, {
            deceased_id,
            type: 'new_body',
            message: \`New body registered: \${full_name.trim()} (ID: \${deceased_id})\`
        }, {
            headers: {
                'x-tenant-slug': tenantSlug,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        }).catch(err => {
            console.warn('⚠️ Could not create notification:', err.message);
        });`;

const newCode = `        // Create notification for new deceased registration (non-blocking)
        // Circuit Breaker: trips OPEN after 2 failures, 15s recovery, auto HALF_OPEN probe
        const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8111';
        notificationBreaker.callWithFallback(
          async () => {
            await axios.post(\`\${notificationServiceUrl}/api/v1/restpoint/notification/notifications\`, {
              deceased_id,
              type: 'new_body',
              message: \`New body registered: \${full_name.trim()} (ID: \${deceased_id})\`
            }, {
              headers: { 'x-tenant-slug': tenantSlug, 'Content-Type': 'application/json' },
              timeout: 5000
            });
            console.log(\`[CircuitBreaker] notification sent for deceased: \${deceased_id}\`);
          },
          () => {
            console.log(
              \`[CircuitBreaker][BACKUP] Notification skipped for \${deceased_id} \` +
              \`(name=\${full_name.trim()}, tenant=\${tenantSlug}). \` +
              \`State: \${notificationBreaker.getState()} failures: \${notificationBreaker.getFailureCount()}. Record saved.\`
            );
          }
        );`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Notification call replaced with Circuit Breaker');
} else {
  console.log('FAIL: oldCode not found in file');
  // Debug: show the context
  const idx = content.indexOf('// Create notification');
  if (idx >= 0) {
    console.log('Found at index:', idx);
    console.log('First 200 chars of match region:');
    console.log(JSON.stringify(content.substring(idx, idx + 200)));
  } else {
    console.log('Pattern not found at all');
  }
}
