const fs = require('fs');

const envConfig = `window.__env = {
  API_BASE_URL: '${process.env.API_BASE_URL || 'http://localhost:3000/api/v1'}',
};
`;

fs.writeFileSync('public/env.js', envConfig);
console.log('env.js generated successfully');