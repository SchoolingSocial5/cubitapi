const fs = require('fs');

async function test() {
  try {
    // 1. Register a user
    const regRes = await fetch('http://localhost:8080/api/v1/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test', lastName: 'User', email: 'test991@example.com', password: 'password123' })
    });
    
    let token;
    if (regRes.ok) {
        const regData = await regRes.json();
        token = regData.token;
    } else {
        // try login
        const loginRes = await fetch('http://localhost:8080/api/v1/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test991@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        token = loginData.token;
    }

    if (!token) {
        console.error("No token");
        return;
    }

    console.log("Got token!");

    // 2. Get presigned URL
    const preRes = await fetch('http://localhost:8080/api/v1/upload/presigned-url', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filename: 'test.png', filetype: 'image/png' })
    });
    const preData = await preRes.json();
    console.log("Presigned response:", preData);
    
    if (!preData.data?.presignedUrl) {
       console.error("No presigned url returned. Check response structure!");
       return;
    }

    // 3. Upload to S3
    console.log("Uploading to:", preData.data.presignedUrl);
    const putRes = await fetch(preData.data.presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: 'Hello world'
    });
    console.log("Upload status:", putRes.status, putRes.statusText);
    
  } catch (err) {
    console.error("Error during test:", err);
  }
}

test();
