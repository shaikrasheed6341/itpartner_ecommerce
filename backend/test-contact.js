// Simple test script to verify contact form API
const testContactForm = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message',
        phone: '+1234567890',
        service: 'networking'
      }),
    });

    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the test
testContactForm();
