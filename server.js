const http = require('http');
const handler = require('./api/wallpaper');

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Only handle GET requests to /api/wallpaper
  if (req.method === 'GET' && parsedUrl.pathname === '/api/wallpaper') {
    // Create Vercel-compatible request/response objects
    const vercelReq = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: Object.fromEntries(parsedUrl.searchParams),
    };

    const vercelRes = {
      setHeader: (name, value) => {
        res.setHeader(name, value);
      },
      status: (code) => {
        res.statusCode = code;
        return vercelRes;
      },
      send: (data) => {
        res.end(data);
      },
      json: (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      },
    };

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Error handling request:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else if (req.method === 'GET' && parsedUrl.pathname === '/') {
    // Redirect root to the API endpoint
    res.writeHead(302, { Location: '/api/wallpaper' });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}/api/wallpaper`);
  console.log(`📱 Open this URL in your browser to see today's wallpaper!\n`);
});

// Handle errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.log(`   Try: lsof -ti:${PORT} | xargs kill\n`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
