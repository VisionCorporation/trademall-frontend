const fs = require('fs');

const envConfig = `window.__env = {
  API_BASE_URL: window.location.hostname === 'localhost'
    ? '${process.env.API_BASE_URL || 'https://trademall-backend.onrender.com/api/v1'}'
    : '/api',
};
`;

fs.writeFileSync('public/env.js', envConfig);
console.log('env.js generated successfully');