const fs = require('fs');

async function test() {
  try {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }) // Need a real user or we can register one
    });
    const loginData = await loginRes.json();
    console.log("Login data:", loginData);

    // If login fails, let's just register
    let token = loginData.token;
    if (!token) {
       const regRes = await fetch('http://localhost:8080/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: 'Test', lastName: 'User', email: 'test999@example.com', password: 'password123' })
       });
       const regData = await regRes.json();
       console.log("Reg data:", regData);
       token = regData.token;
    }

    if (!token) {
        console.error("No token");
        return;
    }

    // 2. Get presigned URL
    const preRes = await fetch('http://localhost:8080/api/v1/upload/presigned-url', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filename: 'test.txt', filetype: 'text/plain' })
    });
    const preData = await preRes.json();
    console.log("Presigned response:", preData);
    
    if (!preData.data?.presignedUrl) {
       console.error("No presigned url returned");
       return;
    }

    // 3. Upload to S3
    console.log("Uploading to:", preData.data.presignedUrl);
    const putRes = await fetch(preData.data.presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Hello world'
    });
    console.log("Upload status:", putRes.status, putRes.statusText);
    
  } catch (err) {
    console.error(err);
  }
}

test();
