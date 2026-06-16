// Minimal zero-dependency static server for the recover-portal.
// Railway runs `npm start` → this serves the public files on $PORT.
// Internal docs (*.md) are never served.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 8102;
const ROOT = __dirname;

// Only these are public. Everything else (HANDOFF.md, TODO.md, server.js, the
// retired QR connect.html…) is hidden. Door-A flow: index.html (private-link
// gate) → workspace.html (claim workspace).
const ALLOW = new Set(['index.html', 'workspace.html']);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let name = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (name === '' || name === '/') name = 'index.html';
    if (name === 'health' || name === 'healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('ok');
    }
    // Private claim host — keep it out of every index.
    if (name === 'robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'X-Robots-Tag': 'noindex, nofollow' });
      return res.end('User-agent: *\nDisallow: /\n');
    }
    // strip any directory traversal; we only ever serve flat whitelisted files
    name = path.basename(name);
    if (!ALLOW.has(name)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    const file = path.join(ROOT, name);
    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not found');
      }
      const ext = path.extname(name);
      res.writeHead(200, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
      });
      res.end(buf);
    });
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad request');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`recover-portal listening on :${PORT}`);
});
