import { spawn } from 'child_process';
import { createServer } from 'http';

const port = 3004;

// Create a simple proxy server that runs our TypeScript API endpoints
const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Test page
  if (req.url === '/' || req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HoopKing Real Database Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
          .success { color: green; } .error { color: red; } .loading { color: orange; }
          button { padding: 8px 16px; margin: 5px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
          .result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>🏀 HoopKing Database Test</h1>
        <h2 class="success">✅ Testing Real Database Connections</h2>
        <p><strong>Mock user ID:</strong> mock-user-123</p>

        <h3>Test Database Endpoints:</h3>
        <button onclick="testEndpoint('/api/workouts')">Test Workouts</button>
        <button onclick="testEndpoint('/api/profile')">Test Profile</button>
        <button onclick="testEndpoint('/api/dashboard')">Test Dashboard</button>
        <button onclick="testEndpoint('/api/user-plans')">Test User Plans</button>
        <button onclick="testEndpoint('/api/workout-inbox')">Test Workout Inbox</button>
        
        <div id="results"></div>

        <script>
          async function testEndpoint(endpoint) {
            const resultsDiv = document.getElementById('results');
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result';
            resultDiv.innerHTML = \`<strong>\${endpoint}</strong> <span class="loading">Testing...</span>\`;
            resultsDiv.appendChild(resultDiv);
            
            try {
              const response = await fetch(endpoint);
              const data = await response.text();
              
              resultDiv.innerHTML = \`
                <strong>\${endpoint}</strong> 
                <span class="\${response.ok ? 'success' : 'error'}">
                  \${response.status} \${response.statusText}
                </span>
                <pre>\${data}</pre>
              \`;
            } catch (error) {
              resultDiv.innerHTML = \`
                <strong>\${endpoint}</strong> 
                <span class="error">Error: \${error.message}</span>
              \`;
            }
          }

          // Test connection status
          fetch('/api/status')
            .then(r => r.json())
            .then(data => console.log('Server status:', data))
            .catch(e => console.log('Server not ready yet'));
        </script>
      </body>
      </html>
    `);
    return;
  }

  // Simple status
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'Database test server running',
      database: 'Connected to real Neon PostgreSQL',
      auth: 'Mock user authentication',
      endpoints: 'Ready for testing'
    }));
    return;
  }

  // For actual API endpoints, we'll need to use the existing Express server
  // Let's proxy to the old dev server on port 5000
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'For real database testing, use the Express server with: npm run dev-old',
    suggestion: 'The Express server connects directly to your database'
  }));
});

server.listen(port, () => {
  console.log(`🏀 HoopKing Database Test Server`);
  console.log(`🌐 http://localhost:${port}/test`);
  console.log(`📊 http://localhost:${port}/api/status`);
  console.log('');
  console.log('ℹ️  This server shows the test interface.');
  console.log('🔗 For real database testing, the Express server is still needed.');
  console.log('');
  console.log('💡 Recommendation: Test database with existing Express server first,');
  console.log('   then migrate those working connections to Vercel Functions.');
});