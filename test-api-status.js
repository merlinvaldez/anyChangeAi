// Quick test to check API status
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/status',
  method: 'GET',
};

const req = http.request(options, res => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\n📋 API Status Response:');
      console.log('🗂️  File Limits:');
      console.log(`   Max Size: ${parsed.limits.maxFileSize}`);
      console.log(`   Max Pages: ${parsed.limits.maxPages}`);
      console.log(`   Allowed Types: ${parsed.limits.allowedTypes.join(', ')}`);
      console.log('\n✅ Test completed!');
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', error => {
  console.error('Request error:', error);
});

req.end();
