require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const reportHandler = require('./api/report');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.webmanifest': 'application/manifest+json; charset=UTF-8'
};

// Servidor HTTP local (compatível tanto com npm start local como com a Vercel)
const server = http.createServer((req, res) => {
  // Rota de Envio de Email: POST /api/report (chama o mesmo handler da Vercel)
  if (req.method === 'POST' && req.url === '/api/report') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', async () => {
      try {
        req.body = JSON.parse(body || '{}');
      } catch (e) {
        req.body = {};
      }

      // Adicionar auxiliares status() e json() para compatibilidade com o handler da Vercel
      res.status = function(code) {
        this.statusCode = code;
        return this;
      };
      res.json = function(data) {
        this.setHeader('Content-Type', 'application/json; charset=UTF-8');
        this.end(JSON.stringify(data));
      };

      await reportHandler(req, res);
    });

    return;
  }

  // Servir Ficheiros Estáticos (HTML, CSS, JS, etc.)
  let safePath = path.normalize(req.url.split('?')[0]);
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Segurança de diretoria
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Proibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Ficheiro Não Encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isCacheable = ext !== '.html';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isCacheable ? 'public, max-age=86400' : 'no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🌿 Plataforma de Relato de Odores — Concelho da Mealhada`);
  console.log(`🚀 Servidor Node.js local a correr em:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`✉️  Conta de Envio: ${process.env.GMAIL_USER || 'odores.mealhada@gmail.com'}`);
  console.log(`⚡ Compatível tanto localmente como na Vercel (api/report.js)`);
  console.log(`========================================================\n`);
});
