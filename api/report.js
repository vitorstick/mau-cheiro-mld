const nodemailer = require('nodemailer');

// Destinatários Oficiais da Câmara Municipal da Mealhada
const DESTINATARIOS_MUNICIPAIS = [
  'gabpresidencia@cm-mealhada.pt',
  'dguptonline@cm-mealhada.pt',
  'ambiente@cm-mealhada.pt'
];

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

// Vercel Serverless Function Handler
module.exports = async function handler(req, res) {
  // Apenas permitir método POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Utilize POST.'
    });
  }

  try {
    // Tratar o corpo do pedido (pode vir como objeto ou string)
    let dados = req.body;
    if (typeof dados === 'string') {
      try {
        dados = JSON.parse(dados);
      } catch (e) {
        dados = {};
      }
    }
    dados = dados || {};

    const appPassword = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!appPassword || appPassword.includes('xxxx')) {
      return res.status(400).json({
        success: false,
        message: 'A palavra-passe de aplicação do Gmail não está configurada no ambiente.'
      });
    }

    const transporter = criarTransportador();

    // Modo de teste seguro (verifica credenciais e ligação SMTP sem disparar emails aos destinatários)
    if (dados.testOnly) {
      await transporter.verify();
      console.log('✓ Teste da Vercel Function: Conexão e autenticação SMTP verificadas com sucesso!');
      return res.status(200).json({
        success: true,
        testMode: true,
        message: 'Teste da Vercel Function: Conexão e autenticação SMTP verificadas com 100% de sucesso!'
      });
    }

    const htmlContent = gerarTemplateEmail(dados);

    const mailOptions = {
      from: `"Plataforma de Odores — Mealhada" <${process.env.GMAIL_USER || 'odores.mealhada@gmail.com'}>`,
      to: DESTINATARIOS_MUNICIPAIS,
      subject: `[Alerta de Mau Cheiro] ${dados.localizacao ? dados.localizacao : 'Novo relato'} — Concelho da Mealhada`,
      html: htmlContent,
      text: `Alerta de Mau Cheiro — Concelho da Mealhada\n\nLocalização: ${dados.localizacao || 'Não especificada'}\nData/Hora: ${dados.dataHora || 'Momento do envio'}\nIntensidade: ${dados.intensidade || 'Não indicada'}\nObservações: ${dados.detalhes || 'Sem observações'}\nContacto: ${dados.contacto || 'Anónimo'}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email enviado com sucesso via Vercel Function:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Relato enviado com sucesso para a Câmara Municipal da Mealhada!'
    });

  } catch (error) {
    console.error('Erro na Vercel Function ao enviar email:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro no envio do email: ' + (error.message || 'Falha SMTP')
    });
  }
};
