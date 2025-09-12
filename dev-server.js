import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3002;

// Mock NextRequest for our API functions
class MockNextRequest {
  constructor(req) {
    this.method = req.method;
    this.url = `http://localhost:${port}${req.url}`;
    this._body = '';
    this._cookies = new Map();
    
    // Collect body data
    req.on('data', chunk => {
      this._body += chunk.toString();
    });
  }

  async json() {
    return JSON.parse(this._body || '{}');
  }

  cookies = {
    get: (name) => this._cookies.get(name)
  }
}

// API endpoint mapping
const apiRoutes = {
  'GET:/api/dashboard': './api/dashboard.ts',
  'GET:/api/auth/user': './api/auth/user.ts',
  'GET:/api/workouts': './api/workouts.ts',
  'GET:/api/workouts/[id]': './api/workouts/[id].ts',
  'GET:/api/profile': './api/profile.ts',
  'POST:/api/ai/generate-workout': './api/ai/generate-workout.ts',
  'POST:/api/ai/workout-insights': './api/ai/workout-insights.ts',
  'POST:/api/sessions': './api/sessions.ts',
  'PATCH:/api/sessions/[id]': './api/sessions/[id].ts',
  'GET:/api/workout-inbox': './api/workout-inbox.ts',
  'POST:/api/workout-inbox/[id]/categorize': './api/workout-inbox/[id]/categorize.ts',
  'POST:/api/workout-inbox/[id]/ignore': './api/workout-inbox/[id]/ignore.ts',
  'GET:/api/user-plans': './api/user-plans.ts',
  'POST:/api/user-plans/start': './api/user-plans/start.ts',
  'GET:/api/fitness-plans': './api/fitness-plans.ts'
};

// Helper to match dynamic routes
function matchRoute(method, path) {
  const key = `${method}:${path}`;
  
  // Try exact match first
  if (apiRoutes[key]) {
    return apiRoutes[key];
  }
  
  // Try dynamic route matching
  for (const [routeKey, filePath] of Object.entries(apiRoutes)) {
    const [routeMethod, routePath] = routeKey.split(':');
    if (routeMethod !== method) continue;
    
    // Replace [id] with regex pattern
    const pattern = routePath.replace(/\[id\]/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    
    if (regex.test(path)) {
      return filePath;
    }
  }
  
  return null;
}

const server = createServer(async (req, res) => {
  try {
    console.log(`${req.method} ${req.url}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Set environment to development for mock auth
    process.env.NODE_ENV = 'development';

    // API status endpoint
    if (req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'API server running with mock auth',
        endpoints: Object.keys(apiRoutes).length,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Try to match API route
    const apiFile = matchRoute(req.method, req.url);
    
    if (apiFile) {
      try {
        // Create mock request
        const mockReq = new MockNextRequest(req);
        
        // Wait for body to be collected
        await new Promise(resolve => {
          if (req.method === 'GET') {
            resolve();
          } else {
            req.on('end', resolve);
          }
        });
        
        // Import the API function
        const moduleUrl = pathToFileURL(join(__dirname, apiFile)).href;
        const module = await import(moduleUrl + '?t=' + Date.now()); // Cache busting
        
        // Get the appropriate handler (GET, POST, etc.)
        const handler = module[req.method];
        
        if (!handler) {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
          return;
        }

        // Call the handler
        const response = await handler(mockReq);
        
        // Extract response data
        const responseData = await response.text();
        
        // Send response
        res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
        res.end(responseData);
        
      } catch (apiError) {
        console.error('API Error:', apiError);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'API Error', 
          message: apiError.message,
          stack: apiError.stack 
        }));
      }
      return;
    }

    // Serve frontend (basic static files)
    if (req.url === '/' || req.url === '/test') {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>HoopKing API Test Server</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 1000px; margin: 20px auto; padding: 20px; }
            .success { color: green; } .error { color: red; } .loading { color: orange; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; }
            button { padding: 8px 16px; margin: 5px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
            .endpoint { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            .method { font-weight: bold; color: #333; }
          </style>
        </head>
        <body>
          <h1>🏀 HoopKing API Test Server</h1>
          <h2 class="success">✅ Mock Authentication Enabled</h2>
          <p><strong>Local API testing without Vercel CLI!</strong></p>
          
          <div id="status" class="loading">Loading API status...</div>
          
          <h3>Available Endpoints:</h3>
          <div id="endpoints"></div>

          <script>
            async function loadStatus() {
              try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('status').innerHTML = 
                  \`<div class="success">✅ \${data.status} - \${data.endpoints} endpoints available</div>\`;
              } catch (e) {
                document.getElementById('status').innerHTML = 
                  \`<div class="error">❌ Failed to load API status</div>\`;
              }
            }

            async function testEndpoint(method, endpoint) {
              const resultDiv = document.getElementById('result-' + endpoint.replace(/[^a-zA-Z0-9]/g, ''));
              resultDiv.innerHTML = '<div class="loading">Testing...</div>';
              
              try {
                const options = { method };
                if (method === 'POST' || method === 'PATCH') {
                  options.headers = { 'Content-Type': 'application/json' };
                  options.body = JSON.stringify({ test: 'data' });
                }
                
                const res = await fetch(endpoint, options);
                const data = await res.text();
                
                resultDiv.innerHTML = \`
                  <div class="\${res.ok ? 'success' : 'error'}">
                    Status: \${res.status} \${res.statusText}
                    <pre>\${data}</pre>
                  </div>
                \`;
              } catch (e) {
                resultDiv.innerHTML = \`<div class="error">Error: \${e.message}</div>\`;
              }
            }

            // Create endpoint testing UI
            const endpoints = [
              ['GET', '/api/dashboard'],
              ['GET', '/api/auth/user'],
              ['GET', '/api/workouts'],
              ['GET', '/api/profile'],
              ['GET', '/api/workout-inbox'],
              ['GET', '/api/user-plans'],
              ['GET', '/api/fitness-plans']
            ];

            let html = '';
            endpoints.forEach(([method, endpoint]) => {
              const id = endpoint.replace(/[^a-zA-Z0-9]/g, '');
              html += \`
                <div class="endpoint">
                  <span class="method">\${method}</span> \${endpoint}
                  <button onclick="testEndpoint('\${method}', '\${endpoint}')">Test</button>
                  <div id="result-\${id}"></div>
                </div>
              \`;
            });
            document.getElementById('endpoints').innerHTML = html;

            loadStatus();
          </script>
        </body>
        </html>
      \`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
  }
});

server.listen(port, () => {
  console.log(\`🏀 HoopKing API Test Server (No Auth)\`);
  console.log(\`🌐 http://localhost:\${port}\`);
  console.log(\`📊 http://localhost:\${port}/test\`);
  console.log(\`🔗 http://localhost:\${port}/api/status\`);
  console.log('');
  console.log('✅ Mock authentication enabled');
  console.log('✅ All API endpoints ready for testing');
  console.log(\`✅ \${Object.keys(apiRoutes).length} endpoints available\`);
});