const http = require('http');

function testChat(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ message });
    const req = http.request(
      'http://localhost:5000/api/ai-chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve(JSON.parse(body));
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1: Greeting "hi" ---');
  const t1 = await testChat('hi');
  console.log(t1);

  console.log('\n--- TEST 2: Courtesy "how are you" ---');
  const t2 = await testChat('how are you');
  console.log(t2);

  console.log('\n--- TEST 3: Movies query "what movies are showing" ---');
  const t3 = await testChat('what movies are showing');
  console.log(t3);

  console.log('\n--- TEST 4: Refund query "refund policy" ---');
  const t4 = await testChat('can I get a refund for my ticket?');
  console.log(t4);

  console.log('\n--- TEST 5: Offers query "promo code" ---');
  const t5 = await testChat('do you have any discount promo codes?');
  console.log(t5);
}

runTests().catch(console.error);
