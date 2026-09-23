# 🌿 Relato de Odores — Concelho da Mealhada

Plataforma cívica e municipal para comunicação e reporte rápido de maus cheiros no concelho da Mealhada, com envio automático de alertas por email para os serviços competentes da autarquia através de **Node.js** e **Nodemailer**.

---

## 1. Visão Geral do Projeto

* **Objetivo:** Permitir aos cidadãos e visitantes reportar ocorrências de odores desagradáveis (industriais, saneamento, pecuária, queimadas, etc.) de forma rápida, intuitiva e sem atrito.
* **Público-alvo:** População do concelho da Mealhada (todas as faixas etárias, com design otimizado para telemóveis).
* **Idioma:** Português de Portugal (`pt-PT`).
* **Filosofia de Preenchimento:** **Todos os campos são 100% opcionais**, garantindo o envio em poucos segundos e sem recolha forçada de dados pessoais (respeito pelo anonimato e RGPD).
* **Campos Simplificados:** Sem seleção de freguesia e sem perguntas complexas; foco imediato na localização, hora e intensidade.

---

## 2. Identidade Visual (Inspirada no Município da Mealhada)

| Elemento | Código HEX | Inspiração / Significado |
|---|---|---|
| **Verde Municipal** | `#1E5A38` | Bandeira do Concelho da Mealhada e Mata Nacional do Buçaco. |
| **Verde Secundário / Hover** | `#2D7A4D` | Estados interativos e botões ativos. |
| **Roxo Bairrada (Destaque)** | `#5D2555` | Cachos de uvas do brasão oficial e tradição vitivinícola da Bairrada. |
| **Fundo Neutro Suave** | `#F3F7F4` | Elevado contraste, conforto visual e acessibilidade para seniores. |
| **Texto de Alto Contraste** | `#1F2937` | Leitura nítida mesmo sob luz solar intensa em ecrãs móveis. |

---

## 3. Campos do Formulário (Todos 100% Opcionais)

1. **Localização Aproximada** *(Opcional)*
   * Campo de texto aberto: *"Rua, lugar, bairro, zona industrial ou ponto de referência"*.
   * Botão de apoio: *"📍 Usar GPS"* para obter coordenadas instantâneas com um toque, caso o cidadão autorize.

2. **Data e Hora da Ocorrência** *(Opcional)*
   * Campo pré-preenchido automaticamente com a hora atual, com possibilidade de ajuste manual caso o odor tenha ocorrido anteriormente.

3. **Nível de Intensidade** *(Opcional)*
   * Escala tátil de 1 a 4 com cores intuitivas:
     * 🟢 **1 — Ligeiro:** Sente-se apenas com a brisa/vento.
     * 🟡 **2 — Moderado:** Desagradável ao ar livre na rua.
     * 🟠 **3 — Intenso:** Obriga a fechar portas e janelas de casa.
     * 🔴 **4 — Insuportável:** Provoca náuseas ou ardor nos olhos/vias respiratórias.

4. **Detalhes Adicionais** *(Opcional)*
   * Caixa de texto livre para qualquer nota útil (ex.: tipo de cheiro percebido, direção do vento, duração estimada).

5. **Contacto para Acompanhamento** *(Opcional)*
   * Nome, email ou telefone caso o munícipe pretenda receber seguimento da ocorrência. Se deixado em branco, o envio é **100% anónimo**.

---

## 4. Envio de Email Direto aos Serviços Municipais

O envio é gerido pelo servidor local em **Node.js** com a biblioteca **Nodemailer**, utilizando a conta oficial da plataforma: **`odores.mealhada@gmail.com`**.

**A Câmara Municipal NÃO tem de autorizar nem ativar nada.** As ocorrências entram diretamente na caixa de entrada oficial dos três departamentos municipais como destinatários principais (`Para:`):

* 🏛️ **Gabinete da Presidência:** `gabpresidencia@cm-mealhada.pt`
* 🏗️ **Divisão de Gestão Urbanística e Transportes:** `dguptonline@cm-mealhada.pt`
* 🌿 **Serviço de Ambiente:** `ambiente@cm-mealhada.pt`

### Configuração de Segurança no ficheiro `.env`
O ficheiro [`.env`](file:///c:/Projects/mld-email/.env) guarda as credenciais seguras de envio:
```env
PORT=3000
GMAIL_USER=odores.mealhada@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```
*(A palavra-passe de aplicação é um código de 16 letras gerado na conta Google em [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).*

---

## 5. Como Executar Localmente

1. Certifique-se de que as dependências estão instaladas:
   ```powershell
   npm install
   ```
2. Inicie o servidor:
   ```powershell
   npm start
   ```
3. Aceda à plataforma no seu navegador:
   👉 **`http://localhost:3000`**

---

## 6. Histórico e Registo de Envios

* **Arquivo no Gmail (Pasta "Enviados"):**
  * Todas as mensagens enviadas ficam automaticamente arquivadas na pasta **Enviados** (*Sent*) da conta `odores.mealhada@gmail.com` em [mail.google.com](https://mail.google.com/).
  * Cada email contém o registo oficial com data e hora exata, a tabela institucional formatada e a confirmação de entrega aos três destinatários.
  * O servidor não cria ficheiros na máquina local, preservando a simplicidade e a privacidade.

---

## 7. Opções de Publicação Online (Alojamento)

Como a plataforma possui um backend em Node.js para o envio seguro por SMTP, pode ser publicada gratuitamente ou a baixo custo em qualquer serviço com suporte para Node.js:
* **Render.com / Railway / Fly.io:** Suportam Node.js diretamente a partir de um repositório GitHub, permitindo configurar as variáveis de ambiente (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) na consola de gestão.
* **VPS Privado (ex: Ubuntu com PM2):**
  ```bash
  npm install -g pm2
  pm2 start server.js --name "mld-odores"
  ```

---

## 8. Privacidade e Proteção de Dados (RGPD)

* Nenhum campo do formulário é de preenchimento obrigatório.
* Caso o munícipe não preencha o contacto, a submissão é **completamente anónima** e não recolhe dados identificativos.
* Os dados destinam-se exclusivamente ao reporte cívico e monitorização da qualidade ambiental junto das autoridades locais competentes.
