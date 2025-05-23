const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Default to index.html for root or undefined paths
  let filePath = req.url === '/' || !req.url
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, req.url);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, serve the 404 page or index as fallback
      filePath = path.join(__dirname, '404.html');
      fs.access(filePath, fs.constants.F_OK, (err2) => {
        if (err2) {
          filePath = path.join(__dirname, 'index.html');
        }
        serveFile(filePath, res);
      });
      return;
    }

    // If it's a directory, look for index.html
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Server Error: ${err.code}`);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
});
