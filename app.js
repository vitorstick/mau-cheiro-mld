/**
 * Relato de Odores — Concelho da Mealhada
 * Lógica do Formulário e Envio Direto via Servidor Node.js (Nodemailer)
 * Os emails são enviados a partir de odores.mealhada@gmail.com
 * diretamente para os serviços da Câmara Municipal da Mealhada.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('smellReportForm');
  const formCard = document.getElementById('formCard');
  const successCard = document.getElementById('successCard');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnReset = document.getElementById('btnReset');
  const formError = document.getElementById('formError');

  // Elementos Interativos
  const dataHoraInput = document.getElementById('dataHora');
  const btnGps = document.getElementById('btnGps');
  const localizacaoInput = document.getElementById('localizacao');
  const gpsStatus = document.getElementById('gpsStatus');

  const intensidadeInput = document.getElementById('intensidadeInput');
  const intensityBtns = document.querySelectorAll('.intensity-btn');

  // 1. Inicializar Data e Hora com o momento atual
  preencherDataHoraAtual();

  function preencherDataHoraAtual() {
    const agora = new Date();
    // Ajustar para fuso horário local no formato YYYY-MM-DDTHH:mm
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');

    dataHoraInput.value = `${ano}-${mes}-${dia}T${horas}:${minutos}`;
  }

  // 2. Seleção da Intensidade (Escala 1 a 4 com suporte para desmarcar)
  intensityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const valor = btn.getAttribute('data-value');
      const jaAtivo = btn.classList.contains('active');

      // Limpar todos
      intensityBtns.forEach(b => b.classList.remove('active'));

      if (jaAtivo) {
        // Desmarcar se clicou no mesmo
        intensidadeInput.value = '';
      } else {
        btn.classList.add('active');
        intensidadeInput.value = valor;
      }
    });
  });

  // 4. Detetor Opcional de Localização por GPS
  if (btnGps && navigator.geolocation) {
    btnGps.addEventListener('click', () => {
      gpsStatus.style.display = 'block';
      gpsStatus.className = 'gps-status loading';
      gpsStatus.textContent = 'A obter coordenadas GPS...';
      btnGps.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          const lat = posicao.coords.latitude.toFixed(5);
          const lng = posicao.coords.longitude.toFixed(5);
          const precisao = Math.round(posicao.coords.accuracy);

          const coordenadasTexto = `Coordenadas GPS: ${lat}, ${lng} (precisão ~${precisao}m)`;
          
          if (localizacaoInput.value.trim() === '') {
            localizacaoInput.value = coordenadasTexto;
          } else {
            localizacaoInput.value += ` [${coordenadasTexto}]`;
          }

          gpsStatus.className = 'gps-status success';
          gpsStatus.textContent = '✓ Coordenadas obtidas com sucesso!';
          btnGps.disabled = false;
        },
        (erro) => {
          gpsStatus.className = 'gps-status error';
          if (erro.code === erro.PERMISSION_DENIED) {
            gpsStatus.textContent = 'Permissão de localização recusada pelo utilizador.';
          } else {
            gpsStatus.textContent = 'Não foi possível obter a localização exata.';
          }
          btnGps.disabled = false;
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  } else if (btnGps) {
    btnGps.style.display = 'none';
  }

  // 5. Submissão do Formulário via Servidor Node.js (Nodemailer)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.style.display = 'none';
    formError.textContent = '';

    // Indicação de carregamento
    const btnTextoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>⏳</span><span>A enviar relato para a autarquia...</span>';

    try {
      const payload = {
        localizacao: localizacaoInput.value.trim(),
        dataHora: dataHoraInput.value,
        intensidade: intensidadeInput.value,
        detalhes: document.getElementById('detalhes')?.value.trim() || '',
        contacto: document.getElementById('contacto')?.value.trim() || ''
      };

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resultado = await response.json();

      if (response.ok && resultado.success) {
        // Sucesso: alternar para o cartão de agradecimento
        formCard.style.display = 'none';
        successCard.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(resultado.message || 'Ocorreu um problema ao enviar o relato.');
      }
    } catch (err) {
      console.error('Erro no envio:', err);
      formError.style.display = 'block';
      formError.textContent = err.message || 'Não foi possível submeter o relato. Verifique a ligação ao servidor.';
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = btnTextoOriginal;
    }
  });

  // 5. Botão para Enviar Outro Relato
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      form.reset();
      intensidadeInput.value = '';
      intensityBtns.forEach(b => b.classList.remove('active'));
      gpsStatus.style.display = 'none';
      preencherDataHoraAtual();

      successCard.style.display = 'none';
      formCard.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
