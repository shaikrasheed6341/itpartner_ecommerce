const http = require('http');

async function testContactAPI() {
  try {
    console.log('Testing Contact Form API...');
    
    const testData = {
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '+1 (555) 123-4567',
      service: 'Networking',
      message: 'This is a test message from the contact form API. Please check if you receive this email notification.'
    };

    console.log('Sending test data:', testData);

    const postData = JSON.stringify(testData);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Response status:', res.statusCode);
          console.log('Response body:', result);

          if (res.statusCode === 201 && result.success) {
            console.log('✅ Contact form submitted successfully!');
            console.log('Check your email at: shaikrasheed634@gmail.com');
            console.log('Submission ID:', result.data.id);
          } else {
            console.log('❌ Contact form submission failed');
            console.log('Error:', result.error);
          }
        } catch (error) {
          console.log('❌ Failed to parse response:', error.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API test failed:', error.message);
      console.log('Make sure your backend server is running on port 5000');
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContactAPI();
