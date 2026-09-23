require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Destinatários Oficiais da Câmara Municipal da Mealhada
const DESTINATARIOS_MUNICIPAIS = [
  'gabpresidencia@cm-mealhada.pt',
  'dguptonline@cm-mealhada.pt',
  'ambiente@cm-mealhada.pt'
];

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Configurar o transporte Nodemailer com Gmail
function criarTransportador() {
  const user = process.env.GMAIL_USER || 'odores.mealhada@gmail.com';
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });
}

// Gerar HTML formatado para o email institucional
function gerarTemplateEmail(dados) {
  const localizacao = dados.localizacao || 'Não especificada';
  const dataHora = dados.dataHora ? dados.dataHora.replace('T', ' às ') : 'Momento do envio';
  const intensidade = dados.intensidade || 'Não classificada';
  const detalhes = dados.detalhes || 'Sem observações adicionais registadas.';
  const contacto = dados.contacto ? dados.contacto : 'Não fornecido (Relato 100% Anónimo)';
  const dataEnvio = new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f4; margin: 0; padding: 20px; color: #1f2937; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #d9e3dc; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .header { background: linear-gradient(135deg, #16462B 0%, #1E5A38 100%); color: #ffffff; padding: 24px; text-align: left; }
      .badge { display: inline-block; background: rgba(255,255,255,0.18); color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
      .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
      .header p { margin: 4px 0 0; font-size: 13px; color: #c8e6d3; }
      .content { padding: 24px; }
      .intro-box { background: #ebf5ef; border-left: 4px solid #1E5A38; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #16462B; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; vertical-align: top; }
      th { background-color: #f8faf8; color: #4b5563; font-weight: 600; width: 38%; }
      td { color: #111827; }
      .badge-intensity { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; }
      .footer { background: #f8faf8; padding: 16px 24px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; }
      .stripe { height: 4px; background: linear-gradient(90deg, #1E5A38 0%, #5D2555 50%, #1E5A38 100%); }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="stripe"></div>
      <div class="header">
        <div class="badge">Concelho da Mealhada</div>
        <h1>Alerta de Mau Cheiro — Novo Relato Cívico</h1>
        <p>Recebido através da Plataforma de Monitorização Ambiental de Odores</p>
      </div>
      <div class="content">
        <div class="intro-box">
          Foi registada uma nova ocorrência de odor desagradável reportada por um munícipe. Seguem os dados recolhidos:
        </div>
        <table>
          <tr>
            <th>📍 Localização</th>
            <td><strong>${localizacao}</strong></td>
          </tr>
          <tr>
            <th>🕒 Data e Hora</th>
            <td>${dataHora}</td>
          </tr>
          <tr>
            <th>⚠️ Intensidade</th>
            <td>${intensidade}</td>
          </tr>
          <tr>
            <th>📝 Observações / Detalhes</th>
            <td>${detalhes}</td>
          </tr>
          <tr>
            <th>👤 Contacto do Munícipe</th>
            <td>${contacto}</td>
          </tr>
          <tr>
            <th>📅 Data de Receção</th>
            <td>${dataEnvio}</td>
          </tr>
        </table>
      </div>
      <div class="footer">
        <p>Email enviado automaticamente pela <strong>Plataforma Cívica de Odores da Mealhada</strong> através de <em>odores.mealhada@gmail.com</em>.</p>
        <p>Destinatários: Gabinete da Presidência, Gestão Urbanística e Serviço de Ambiente.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  // Rota de Envio de Email: POST /api/report
  if (req.method === 'POST' && req.url === '/api/report') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
      // Proteção contra payload excessivo (> 1MB)
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const dados = JSON.parse(body || '{}');

        const appPassword = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
        if (!appPassword || appPassword === 'xxxxxxxxxxxxxxxx' || appPassword.includes('xxxx')) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({
            success: false,
            message: 'A palavra-passe de aplicação do Gmail ainda não foi configurada no ficheiro .env. Por favor adicione a sua chave de 16 letras.'
          }));
          return;
        }

        const transporter = criarTransportador();
        const htmlContent = gerarTemplateEmail(dados);

        const mailOptions = {
          from: `"Plataforma de Odores — Mealhada" <${process.env.GMAIL_USER || 'odores.mealhada@gmail.com'}>`,
          to: DESTINATARIOS_MUNICIPAIS,
          subject: `[Alerta de Mau Cheiro] ${dados.localizacao ? dados.localizacao : 'Novo relato'} — Concelho da Mealhada`,
          html: htmlContent,
          text: `Alerta de Mau Cheiro — Concelho da Mealhada\n\nLocalização: ${dados.localizacao || 'Não especificada'}\nData/Hora: ${dados.dataHora || 'Momento do envio'}\nIntensidade: ${dados.intensidade || 'Não indicada'}\nObservações: ${dados.detalhes || 'Sem observações'}\nContacto: ${dados.contacto || 'Anónimo'}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✓ Email enviado com sucesso via Nodemailer para a Câmara:', info.messageId);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({
          success: true,
          message: 'Relato enviado com sucesso para a Câmara Municipal da Mealhada!'
        }));

      } catch (error) {
        console.error('Erro ao enviar email via Nodemailer:', error);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({
          success: false,
          message: 'Erro no envio do email: ' + (error.message || 'Falha de ligação SMTP')
        }));
      }
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

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🌿 Plataforma de Relato de Odores — Concelho da Mealhada`);
  console.log(`🚀 Servidor Node.js com Nodemailer a correr em:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`✉️  Conta de Envio: ${process.env.GMAIL_USER || 'odores.mealhada@gmail.com'}`);
  console.log(`🎯 Destinatários:`);
  DESTINATARIOS_MUNICIPAIS.forEach(email => console.log(`   - ${email}`));
  console.log(`========================================================\n`);
});
