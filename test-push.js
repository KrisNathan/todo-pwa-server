// Simple test for the push endpoint
const testPushEndpoint = async () => {
  const testData = {
    pubKey: "02a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    data: JSON.stringify({
      payload: JSON.stringify({
        salt: "dGVzdC1zYWx0LTEyMw==", // base64 encoded "test-salt-123"
        iv: "dGVzdC1pdi0xMjM=", // base64 encoded "test-iv-123" (padded to 12 bytes)
        data: "dGVzdC1kYXRhLTEyMw==" // base64 encoded "test-data-123"
      }),
      signature: "3045022100b8c5c9e5a8f7d9e2b1c3a4f6e8d0c2b4a6e8f0d2c4b6a8e0f2d4c6b8a0e2f4d602201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    }),
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch('http://localhost:3000/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testPushEndpoint();
