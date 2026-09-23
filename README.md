# 🌿 Relato de Odores — Município da Mealhada

Guia de implementação e instruções para o desenvolvimento da plataforma web de comunicação e reporte de maus cheiros no concelho da Mealhada.

---

## 1. Visão Geral do Projeto

* **Objetivo:** Permitir aos cidadãos e visitantes reportar rapidamente ocorrências de odores desagradáveis (industriais, saneamento, pecuária, queimadas, etc.) de forma simples e acessível.
* **Público-alvo:** População do concelho da Mealhada (todas as idades, com forte foco em utilização móvel no momento da ocorrência).
* **Idioma:** Português de Portugal (pt-PT).
* **Filosofia de Preenchimento:** **Todos os campos são 100% opcionais**, garantindo o reporte em poucos segundos e sem recolha obrigatória de dados pessoais (respeito pelo anonimato e RGPD).
* **Exclusão:** Não inclui seleção de Freguesia.

---

## 2. Identidade Visual (Inspirada no Município da Mealhada)

| Elemento | Código HEX | Inspiração / Significado |
|---|---|---|
| **Verde Principal** | `#1E5A38` | Bandeira municipal e a Mata Nacional do Buçaco (natureza, solenidade e vigor). |
| **Verde Secundário / Hover** | `#2D7A4D` | Destaques interativos, botões e estados ativos. |
| **Roxo Bairrada (Destaque)** | `#5D2555` | Os cachos de uvas do brasão e a tradição vitivinícola da Bairrada. |
| **Fundo Suave** | `#F8FAF8` | Tom limpo, neutro e de baixo cansaço visual. |
| **Texto de Alto Contraste** | `#1F2937` | Máxima legibilidade para seniores e ecrãs sob luz solar direta. |

---

## 3. Campos do Formulário (Todos Opcionais)

1. **Localização Aproximada** *(Opcional)*
   * Campo de texto: *"Rua, lugar, bairro, zona industrial ou ponto de referência"*.
   * Botão de apoio: *"📍 Usar GPS"* para obter coordenadas instantâneas caso o utilizador pretenda.

2. **Data e Hora da Ocorrência** *(Opcional)*
   * Campo de data/hora preenchido automaticamente com o momento atual, com possibilidade de ajuste manual caso tenha ocorrido antes.

3. **Intensidade do Cheiro** *(Opcional)*
   * Escala simples de botões visuais:
     * 🟢 *1 - Ligeiro (sente-se apenas com o vento)*
     * 🟡 *2 - Moderado (incomoda na rua)*
     * 🟠 *3 - Intenso (obriga a fechar janelas)*
     * 🔴 *4 - Insuportável (provoca náuseas/ardor)*

4. **Detalhes Adicionais** *(Opcional)*
   * Caixa de texto livre para observações (ex.: tipo de cheiro sentido, direção do vento, duração estimada, sintomas físicos).

5. **Contacto para Acompanhamento** *(Opcional)*
   * Nome, email ou telefone caso o utilizador pretenda ser contactado. Se deixar em branco, o relato é 100% anónimo.

---

## 4. Como Ativar o Envio de Email (FormSubmit.co)

A plataforma utiliza **multi-envio simultâneo em paralelo** via JavaScript (`Promise.allSettled`). Cada departamento recebe o relato diretamente como **Destinatário Principal (Para:)**:

* 🏛️ **Presidência:** `gabpresidencia@cm-mealhada.pt` *(Para:)*
* 🏗️ **Urbanismo e Transportes:** `dguptonline@cm-mealhada.pt` *(Para:)*
* 🌿 **Ambiente:** `ambiente@cm-mealhada.pt` *(Para:)*

Os endereços estão configurados no ficheiro [`app.js`](file:///c:/Projects/mld-email/app.js) na lista `RECIPIENT_EMAILS`.

### Ativação Única Inicial:
1. No primeiro envio de teste efetuado a partir do formulário, o **FormSubmit.co** gera um email de validação para cada uma das três caixas de correio.
2. Cada serviço carrega uma única vez no botão **"Activate Form"** do respetivo email para validar o endereço.
3. A partir desse momento, qualquer relato submetido pelos munícipes é entregue a todos os três serviços municipais como destinatários diretos.

---

## 5. Como Testar Localmente (Node.js)

O projeto inclui um servidor local leve em Node.js (`server.js`) sem qualquer dependência externa:

```powershell
# Iniciar o servidor local:
npm start
# (ou node server.js)
```

De seguida, o website fica acessível em: **`http://localhost:3000`**

---

## 6. Como Publicar Gratuitamente na Internet

Este projeto é 100% estático (HTML, CSS e JS puros), pelo que pode ser alojado sem qualquer custo em:
* **Vercel / Netlify:** Basta arrastar a pasta `mld-email` ou ligar ao GitHub.
* **Cloudflare Pages:** Rápido, com proteção DDoS e tráfego ilimitado gratuito.
* **GitHub Pages:** Gratuito diretamente a partir de um repositório GitHub.

---

## 7. Privacidade e Proteção de Dados (RGPD)

* Todos os campos do formulário são **facultativos**.
* Se o cidadão não preencher o campo de contacto, a submissão é **totalmente anónima**.
* O formulário inclui proteção silenciosa anti-spam (*honeypot*) sem colocar captchas intrusivos para os utilizadores.
