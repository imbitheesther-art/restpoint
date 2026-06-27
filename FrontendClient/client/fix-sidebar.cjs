const fs = require('fs');
const src = 'FrontendClient/client/src/components/layout/ModernSidebar.jsx';
const lines = fs.readFileSync(src, 'utf8').split(/\n/);
console.log('Lines:', lines.length);
console.log(lines[0]);
