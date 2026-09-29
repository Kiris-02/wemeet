// Automated verification test suite for WEMEET backend & logic
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function post(urlPath, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(BASE_URL + urlPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(BASE_URL + urlPath, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting WEMEET test suite...');

  // Test 1: Health
  const health = await get('/api/health');
  if (health.status === 200 && health.body.app === 'WEMEET') {
    console.log('✅ Test 1 PASSED: Health endpoint is healthy.');
  } else {
    throw new Error('Test 1 FAILED: Health endpoint failed: ' + JSON.stringify(health));
  }

  // Test 2: Districts list
  const dists = await get('/api/districts');
  if (dists.status === 200 && dists.body.districts.includes('District 1')) {
    console.log(`✅ Test 2 PASSED: ${dists.body.districts.length} HCMC districts retrieved.`);
  } else {
    throw new Error('Test 2 FAILED: Districts endpoint failed.');
  }

  // Test 3: Midpoint Calculation
  const members = [
    { name: 'You', district: 'District 1', travelMode: 'motorbike' },
    { name: 'Minh', district: 'District 7', travelMode: 'car' },
    { name: 'An', district: 'Binh Thanh', travelMode: 'car' },
    { name: 'Vy', district: 'District 10', travelMode: 'motorbike' }
  ];
  const midpointRes = await post('/api/midpoint', { members });
  if (midpointRes.status === 200 && midpointRes.body.midpoint.district === 'District 1') {
    console.log('✅ Test 3 PASSED: Centroid accurately computed as District 1.');
  } else {
    throw new Error('Test 3 FAILED: Midpoint calculation unexpected: ' + JSON.stringify(midpointRes));
  }

  // Test 4: Recommendations
  const recs = await post('/api/recommendations', { members });
  if (recs.status === 200 && recs.body.matches.length === 3) {
    const top = recs.body.matches[0];
    console.log(`✅ Test 4 PASSED: Top match is "${top.name}" with ${top.memberTravels.length} member travel times.`);
  } else {
    throw new Error('Test 4 FAILED: Recommendations failed: ' + JSON.stringify(recs));
  }

  // Test 5: Support Chatbot Concierge
  const chat = await post('/api/support/chat', { message: 'Can you help with booking?' });
  if (chat.status === 200 && chat.body.reply.includes('Maison Marou')) {
    console.log('✅ Test 5 PASSED: Support Concierge returned smart contextual booking answer.');
  } else {
    throw new Error('Test 5 FAILED: Support chat failed: ' + JSON.stringify(chat));
  }

  console.log('\n🎉 ALL WEMEET TESTS PASSED WITH ZERO REGRESSIONS!');
}

runTests().catch(err => {
  console.error('❌ Test execution error:', err.message);
  process.exit(1);
});
