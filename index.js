// ============================================================
//  MUNDIAL 26 — App único (loja + pagamento Pix VeoPag)
//  ------------------------------------------------------------
//  Um só servidor que:
//   1. Serve a loja (arquivos da pasta /public)
//   2. Gera o Pix real na VeoPag
//   3. Recebe o webhook de confirmação
//   4. Responde "já pagou?" para a loja
//
//  Feito para rodar no Render (ou qualquer host de Node.js).
//  As credenciais vêm das variáveis de ambiente (nunca no código).
// ============================================================

import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// ---- CORS: permite que a loja hospedada em outro endereço (ex.: Netlify)
//      chame este backend. Defina ALLOWED_ORIGIN no Render com a URL do
//      seu site Netlify (ex.: https://sualoja.netlify.app). "*" libera geral. ----
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---- Config (variáveis de ambiente, definidas no painel do Render) ----
const VEOPAG_BASE = "https://api.veopag.com";
const CLIENT_ID = process.env.VEOPAG_CLIENT_ID;
const CLIENT_SECRET = process.env.VEOPAG_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("⚠️  Defina VEOPAG_CLIENT_ID e VEOPAG_CLIENT_SECRET nas variáveis de ambiente.");
}

// ============================================================
//  Token JWT com cache (vale 1h; reutilizamos por 55min)
// ============================================================
let cachedToken = null;
let cachedUntil = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < cachedUntil) return cachedToken;

  const resp = await fetch(`${VEOPAG_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!resp.ok) throw new Error(`Falha no login VeoPag (${resp.status})`);
  const data = await resp.json();
  cachedToken = data.token;
  cachedUntil = now + 55 * 60 * 1000;
  return cachedToken;
}

// Pedidos em memória (para protótipo). Em produção, use um banco de dados.
const orders = new Map();

// ============================================================
//  1) Criar cobrança Pix
// ============================================================
app.post("/api/checkout/pix", async (req, res) => {
  try {
    const { amount, orderId, customer } = req.body || {};
    if (!amount || amount <= 0) return res.status(400).json({ error: "Valor inválido." });
    if (!orderId) return res.status(400).json({ error: "orderId é obrigatório." });

    const token = await getToken();
    const origin = `${req.protocol}://${req.get("host")}`;

    const payload = {
      amount: Number(Number(amount).toFixed(2)),
      external_id: String(orderId),
      clientCallbackUrl: `${origin}/webhooks/veopag`,
      payer: {
        name: customer?.name || "Pagamento Digital",
        email: customer?.email || "[email protected]",
        document: (customer?.document || "").replace(/\D/g, ""),
        phone: (customer?.phone || "").replace(/\D/g, ""),
      },
    };

    const resp = await fetch(`${VEOPAG_BASE}/api/payments/deposit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();

    if (!resp.ok) {
      console.error("Erro VeoPag:", resp.status, data);
      return res.status(resp.status).json({ error: data?.message || "Falha ao gerar cobrança Pix." });
    }

    const qr = data.qrCodeResponse || data;
    const transactionId = qr.transactionId || qr.transaction_id;
    const qrcode = qr.qrcode;
    const value = qr.amount ?? payload.amount;

    if (!transactionId || !qrcode) {
      return res.status(502).json({ error: "Resposta inesperada do gateway." });
    }

    orders.set(transactionId, { status: "PENDING", amount: value, externalId: payload.external_id });
    res.json({ transactionId, qrcode, amount: value, status: "PENDING" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno ao gerar cobrança." });
  }
});

// ============================================================
//  2) Webhook da VeoPag
// ============================================================
app.post("/webhooks/veopag", (req, res) => {
  try {
    const b = req.body || {};
    const txId = b.transactionId || b.transaction_id || b.qrCodeResponse?.transactionId || b.data?.transactionId;
    const status = (b.status || b.data?.status || "").toUpperCase();

    if (txId && orders.has(txId)) {
      const order = orders.get(txId);
      if (["COMPLETED", "PAID", "APPROVED"].includes(status)) order.status = "COMPLETED";
      else if (["FAILED", "REFUSED", "CANCELED"].includes(status)) order.status = "FAILED";
      orders.set(txId, order);
      console.log(`Webhook: ${txId} -> ${order.status}`);
    }
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(200);
  }
});

// ============================================================
//  3) Consulta de status (polling da loja)
// ============================================================
app.get("/api/checkout/status/:transactionId", (req, res) => {
  const order = orders.get(req.params.transactionId);
  if (!order) return res.status(404).json({ status: "UNKNOWN" });
  res.json({ status: order.status, amount: order.amount });
});

// ============================================================
//  4) Servir a loja (arquivos estáticos da pasta /public)
//     Precisa vir DEPOIS das rotas de API.
// ============================================================
app.use(express.static(path.join(__dirname, "public")));

// Qualquer outra rota devolve a loja (single-page)
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MUNDIAL 26 rodando na porta ${PORT}`));
