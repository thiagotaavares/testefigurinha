# 🚀 Colocar a loja MUNDIAL 26 no ar — passo a passo para iniciantes

Este guia te leva do zero até o site funcionando, com Pix real, usando:

1. **GitHub** — guarda os arquivos do site (de graça)
2. **Render** — roda o site na internet (de graça)
3. **Hostinger** — só empresta o seu domínio (ex.: `sualoja.com.br`)

> ⏱️ Leva uns **30–40 minutos** na primeira vez. Vá com calma, um passo de cada vez.
> Você **não precisa instalar nada** no computador — é tudo pelo navegador.

Antes de começar, deixe à mão:
- Suas **credenciais da VeoPag**: `client_id` e `client_secret`
- O **e-mail** que você usa / vai criar nas contas
- O **login da Hostinger** (onde comprou o domínio)

---

## 🟦 PARTE 1 — Subir os arquivos no GitHub

O GitHub é como uma "pasta na nuvem" que o Render vai ler.

### 1.1 Criar uma conta
1. Acesse **https://github.com** e clique em **Sign up**.
2. Crie a conta com seu e-mail e confirme (eles mandam um código por e-mail).

### 1.2 Criar um repositório (a "pasta" do projeto)
1. No canto superior direito, clique no **+** → **New repository**.
2. Em **Repository name**, escreva: `mundial26`
3. Deixe marcado **Public** (pode ser público; suas senhas NÃO ficam aqui).
4. **Não** marque nenhuma opção extra (README, .gitignore...). 
5. Clique em **Create repository**.

### 1.3 Enviar os arquivos
Você vai subir **o conteúdo desta pasta `render/`** (os arquivos de dentro).

1. Na página do repositório recém-criado, clique no link
   **"uploading an existing file"** (fica no meio da tela).
   - Se não aparecer, clique em **Add file** → **Upload files**.
2. **Arraste para a janela** estes itens de dentro da pasta `render/`:
   - o arquivo `index.js`
   - o arquivo `package.json`
   - o arquivo `.gitignore`
   - a **pasta** `public` inteira (com `index.html`, `js/`, `img/` dentro)
   > Dica: selecione tudo de uma vez e arraste junto. O GitHub mantém as pastas.
   > **NÃO** suba a pasta `node_modules` (ela nem existe ainda — tudo certo).
3. Espere o upload terminar (a barrinha completa).
4. Lá embaixo, clique no botão verde **Commit changes**.

✅ Pronto. Seus arquivos estão no GitHub. Deixe essa aba aberta.

---

## 🟩 PARTE 2 — Publicar no Render

O Render vai pegar esses arquivos e transformar num site de verdade.

### 2.1 Criar a conta
1. Acesse **https://render.com** → **Get Started**.
2. Escolha **Sign in with GitHub** (mais fácil — conecta as duas contas).
3. Autorize o Render a acessar seus repositórios quando ele pedir.

### 2.2 Criar o serviço do site
1. No painel do Render, clique em **New +** → **Web Service**.
2. Aparece a lista dos seus repositórios do GitHub. Encontre **`mundial26`**
   e clique em **Connect**.
   - Se não aparecer, clique em **Configure account** e permita o acesso ao repo.
3. Agora preencha a configuração:
   | Campo | O que colocar |
   |---|---|
   | **Name** | `mundial26` (ou o que quiser) |
   | **Region** | deixe a sugerida (ex.: Oregon) |
   | **Branch** | `main` |
   | **Runtime / Language** | **Node** (geralmente detecta sozinho) |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | **Free** |

### 2.3 Colocar suas credenciais VeoPag (a parte secreta)
Ainda na mesma tela, role até **Environment Variables** e clique
**Add Environment Variable**. Adicione **duas**:

| Key (nome) | Value (valor) |
|---|---|
| `VEOPAG_CLIENT_ID` | cole seu client_id |
| `VEOPAG_CLIENT_SECRET` | cole seu client_secret |

> 🔒 É aqui que as senhas ficam — guardadas com segurança no Render, **nunca**
> no GitHub nem no código.

### 2.4 Publicar
1. Clique no botão azul **Create Web Service** (ou **Deploy**).
2. O Render vai instalar e ligar o site. Acompanhe os textos rolando na tela.
   Quando aparecer **"Live"** (verdinho) lá em cima, está no ar! 🎉
3. No topo da página, o Render mostra o endereço do seu site, algo como:
   **`https://mundial26.onrender.com`**
   Clique nele — sua loja deve abrir.

> ⚠️ **No plano grátis**, o site "dorme" se ninguém acessa por uns 15 minutos.
> A primeira visita depois disso demora ~30 segundos pra "acordar". É normal.
> Pra loja de verdade, depois vale subir pro plano pago (US$ 7/mês) — fica
> sempre ligado e rápido.

---

## 🟨 PARTE 3 — Avisar a VeoPag sobre o pagamento (webhook)

Pra loja saber quando o Pix foi pago, a VeoPag precisa "avisar" o seu site.

1. Entre no painel da **VeoPag** → **Configurações → Webhooks**
   (ou onde tiver o campo de URL de notificação/callback).
2. Cole o endereço do seu site + `/webhooks/veopag`. Exemplo:
   ```
   https://mundial26.onrender.com/webhooks/veopag
   ```
3. Salve.

> Mais pra frente, quando o domínio próprio estiver ligado (Parte 4), você troca
> por `https://sualoja.com.br/webhooks/veopag`.

---

## 🟧 PARTE 4 — Ligar seu domínio da Hostinger

Agora vamos fazer `sualoja.com.br` abrir o site que está no Render.

### 4.1 Adicionar o domínio no Render
1. No Render, abra seu serviço **mundial26** → menu **Settings**.
2. Role até **Custom Domains** → **Add Custom Domain**.
3. Digite seu domínio. Recomendo adicionar **os dois**:
   - `sualoja.com.br`
   - `www.sualoja.com.br`
4. O Render vai mostrar uns **registros de DNS** pra você copiar
   (uns valores tipo `CNAME` / `A`). Deixe essa tela aberta — você vai usar agora.

### 4.2 Apontar o domínio na Hostinger
1. Entre no **hPanel da Hostinger** → **Domínios** → clique no seu domínio →
   **DNS / Nameservers** (ou **Zona DNS**).
2. Você vai **criar/editar registros** com os valores que o Render mostrou:
   - Normalmente um registro **CNAME** para `www` apontando para o endereço
     `...onrender.com` que o Render indicou.
   - E, para o domínio "raiz" (sem www), o Render te dá um endereço ou um
     registro **A** com um número de IP — copie exatamente o que ele mandar.
3. Salve cada registro.

> 🧭 Cada painel é um pouco diferente. A regra de ouro: **copie exatamente**
> o que o Render manda na tela "Custom Domains". Ele te diz o tipo (A ou CNAME),
> o nome e o valor de cada registro.

### 4.3 Esperar e confirmar
- O DNS pode levar de **alguns minutos até algumas horas** pra "propagar".
- Quando ficar pronto, no Render os domínios aparecem com um ✅ verde
  e o **cadeado HTTPS** é ativado automaticamente (de graça).
- Teste abrindo `https://sualoja.com.br`.

### 4.4 Atualizar o webhook
Volte na VeoPag (Parte 3) e troque a URL do webhook para o domínio próprio:
```
https://sualoja.com.br/webhooks/veopag
```

---

## ✅ PARTE 5 — Testar o pagamento de verdade

1. Abra seu site e faça um pedido.
2. Escolha **Pix** — deve aparecer o **QR Code real**.
3. Pague um valor pequeno (ex.: **R$ 1,00**). 
   > A VeoPag é ambiente real (não tem "modo teste"), então é dinheiro de verdade.
4. Em alguns segundos a tela vira **"Pedido confirmado"** sozinha. 🎉

### Teste rápido (sem gastar)
Abra no navegador:
```
https://SEU-SITE/api/checkout/status/teste
```
Se responder `{"status":"UNKNOWN"}`, o servidor está vivo e funcionando. ✅

---

## 🆘 Se algo der errado

| Problema | O que fazer |
|---|---|
| Render não acha o repositório | Settings da conta Render → permita acesso ao repo `mundial26`. |
| Build falhou no Render | Veja a aba **Logs** no Render. Confira se **Start Command** é `npm start`. |
| Loja abre, mas o QR não aparece | As variáveis `VEOPAG_CLIENT_ID/SECRET` faltaram ou estão erradas (Render → Environment). |
| "Falha no login VeoPag" | Credenciais erradas ou conta VeoPag não liberada. |
| Paguei e a tela não avançou | Webhook não cadastrado na VeoPag, ou URL errada. Confira a Parte 3. |
| Domínio não abre | DNS ainda propagando (espere) ou registros diferentes do que o Render pediu. |

---

## 🔁 Como atualizar o site depois

Quando eu te entregar uma versão nova:
1. No GitHub, entre no repositório → **Add file → Upload files** e suba os
   arquivos novos por cima (Commit changes).
2. O Render **detecta sozinho** e republica em 1–2 minutos. Pronto.

---

## 📌 Observações importantes

- **Cartão de crédito**: a VeoPag processa **só Pix**. A aba de cartão na loja é
  visual/simulada. Pra cartão real, dá pra integrar outro provedor depois.
- **Pedidos**: nesta versão, os pedidos ficam na memória do servidor (somem se
  ele reinicia). Funciona pro pagamento, mas pra controle de vendas o ideal é
  ligar um banco de dados depois — me chame quando quiser esse passo.

Qualquer dúvida em qualquer etapa, me manda um print que eu te ajudo. 🙌
