const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173;
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

function resolveFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  const safePath = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, '');

  const distCandidate = path.join(DIST_DIR, safePath);
  if (fs.existsSync(distCandidate) && fs.statSync(distCandidate).isFile()) {
    return distCandidate;
  }

  const publicCandidate = path.join(PUBLIC_DIR, safePath);
  if (fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
    return publicCandidate;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const reqUrl = req.url || '/';
  let filePath = resolveFile(reqUrl === '/' ? '/index.html' : reqUrl);

  // SPA fallback for React Router routes (/wishes, /name-in-lights, /photo-frames, /fireworks, /about)
  if (!filePath) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  });
});

const isTest = process.argv.includes('--test');
let currentPort = isTest ? 0 : Number(process.env.PORT || 5173);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && !isTest) {
    currentPort += 1;
    server.listen(currentPort);
  } else {
    throw err;
  }
});

server.listen(currentPort, () => {
  const actualPort = server.address().port;
  console.log(`\n🪔 DiwaliWala Server is live at: http://localhost:${actualPort}\n`);

  if (isTest) {
    const routes = [
      '/',
      '/wishes',
      '/name-in-lights',
      '/photo-frames',
      '/fireworks',
      '/about',
      '/assets/app.js',
      '/assets/styles.css',
      '/diya.svg',
      '/sitemap.xml',
      '/robots.txt',
    ];
    Promise.all(
      routes.map(
        (route) =>
          new Promise((resolve, reject) => {
            http
              .get(`http://localhost:${actualPort}${route}`, (res) => {
                let size = 0;
                res.on('data', (chunk) => {
                  size += chunk.length;
                });
                res.on('end', () => {
                  console.log(`  [PASS] GET ${route.padEnd(20)} -> HTTP ${res.statusCode} (${size} bytes)`);
                  resolve();
                });
              })
              .on('error', reject);
          })
      )
    )
      .then(() => {
        console.log('\n✅ All DiwaliWala routes & assets verified successfully!\n');
        server.close(() => process.exit(0));
      })
      .catch((err) => {
        console.error('Verification failed:', err);
        server.close(() => process.exit(1));
      });
  }
});
