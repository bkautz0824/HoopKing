import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3002;

// Simple mock NextRequest
class MockNextRequest {
  constructor(req) {
    this.method = req.method;
    this.url = `http://localhost:${port}${req.url}`;
    this._body = '';
    this._cookies = new Map();
  }

  async json() {
    return JSON.parse(this._body || '{}');
  }

  cookies = {
    get: (name) => this._cookies.get(name)
  }
}

// Test specific API endpoints
const testEndpoints = {
  '/api/dashboard': './api/dashboard.ts',
  '/api/auth/user': './api/auth/user.ts',
  '/api/workouts': './api/workouts.ts',
  '/api/profile': './api/profile.ts',
  '/api/workout-inbox': './api/workout-inbox.ts',
  '/api/user-plans': './api/user-plans.ts',
  '/api/fitness-plans': './api/fitness-plans.ts'
};

const server = createServer(async (req, res) => {
  try {
    console.log(`${req.method} ${req.url}`);
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Set development mode for mock auth
    process.env.NODE_ENV = 'development';

    // Status endpoint
    if (req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'Mock API server running',
        endpoints: Object.keys(testEndpoints).length,
        auth: 'bypassed'
      }));
      return;
    }

    // Test specific endpoints
    const apiFile = testEndpoints[req.url];
    if (apiFile && req.method === 'GET') {
      try {
        const mockReq = new MockNextRequest(req);
        const moduleUrl = pathToFileURL(join(__dirname, apiFile)).href + '?t=' + Date.now();
        const module = await import(moduleUrl);
        const handler = module.GET;
        
        if (!handler) {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end('{"error": "Method not allowed"}');
          return;
        }

        const response = await handler(mockReq);
        const responseData = await response.text();
        
        res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
        res.end(responseData);
        
      } catch (apiError) {
        console.error('API Error:', apiError);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'API Error', 
          message: apiError.message
        }));
      }
      return;
    }

    // Simple test page
    if (req.url === '/' || req.url === '/test') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
        <head><title>HoopKing API Test</title></head>
        <body style="font-family: Arial; margin: 40px;">
          <h1>🏀 HoopKing API Test Server</h1>
          <h2 style="color: green;">✅ Mock Authentication Bypassed</h2>
          
          <h3>Test Endpoints:</h3>
          <ul>
            <li><a href="/api/status">/api/status</a> - Server status</li>
            <li><a href="/api/dashboard">/api/dashboard</a> - Dashboard data</li>
            <li><a href="/api/auth/user">/api/auth/user</a> - User info</li>
            <li><a href="/api/workouts">/api/workouts</a> - Workouts list</li>
            <li><a href="/api/profile">/api/profile</a> - User profile</li>
            <li><a href="/api/workout-inbox">/api/workout-inbox</a> - Workout inbox</li>
            <li><a href="/api/user-plans">/api/user-plans</a> - User plans</li>
            <li><a href="/api/fitness-plans">/api/fitness-plans</a> - Fitness plans</li>
          </ul>
          
          <p><strong>Status:</strong> All endpoints use mock authentication (user: mock-user-123)</p>
        </body>
        </html>
      `);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end('{"error": "Not found"}');

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error', message: error.message }));
  }
});

server.listen(port, () => {
  console.log(`🏀 HoopKing API Test Server`);
  console.log(`🌐 http://localhost:${port}`);
  console.log(`📊 http://localhost:${port}/test`);
  console.log(`🔗 http://localhost:${port}/api/status`);
  console.log('');
  console.log('✅ Mock authentication enabled (bypasses all auth)');
  console.log(`✅ ${Object.keys(testEndpoints).length} API endpoints ready for testing`);
});