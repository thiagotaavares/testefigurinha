/* ============================================================
   MUNDIAL 26 — Checkout (multi-step)
   ============================================================ */

/* QR placeholder: grade determinística de quadrados (não é QR real) */
function FakeQR() {
  const n = 21;
  const cells = [];
  let seed = 7;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      const on = finder
        ? !((x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) ? false : true)
        : rand() > 0.55;
      if (on) cells.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />);
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
      <rect x="0" y="0" width={n} height={n} fill="#fff" />
      <g fill="#120E1A">{cells}</g>
    </svg>
  );
}

function Field({ label, err, children }) {
  return (
    <div className={`field ${err ? "err" : ""}`}>
      <label>{label}</label>
      {children}
      {err && <div className="msg">{err}</div>}
    </div>
  );
}

/* QR real: desenha o "copia e cola" (EMV) usando a lib qrcodejs */
function RealQR({ text }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.QRCode && text) {
      ref.current.innerHTML = "";
      new window.QRCode(ref.current, {
        text,
        width: 200,
        height: 200,
        colorDark: "#0B0B10",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    }
  }, [text]);
  return <div ref={ref} style={{ width: 200, height: 200 }}></div>;
}

/* ============================================================
   PixPayment — gerencia o pagamento Pix.
   - Modo DEMO (window.VEOPAG.apiBase vazio): QR fictício +
     botão "Já paguei" que simula a confirmação.
   - Modo REAL (apiBase preenchido): cria a cobrança no backend,
     mostra o QR real, faz polling e detecta o pagamento sozinho.
   ============================================================ */
function PixPayment({ orderId, amount, customer, onPaid }) {
  const cfg = window.VEOPAG || {};
  const API = (cfg.apiBase || "").replace(/\/+$/, "");
  // demo = nada é cobrado. Real (live:true) usa o backend.
  const demo = !cfg.live;
  // backend:'php' (Hostinger) usa caminhos .php; senão, clean paths (Cloudflare/Node).
  const isPhp = cfg.backend === "php";
  const pixUrl = isPhp ? `${API}/api/pix.php` : `${API}/api/checkout/pix`;
  const statusUrl = (id) => isPhp ? `${API}/api/status.php?id=${encodeURIComponent(id)}` : `${API}/api/checkout/status/${id}`;
  const [state, setState] = useState(demo ? "demo" : "loading"); // loading|pending|paid|error|demo
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const demoCode = `00020126MND26${orderId}5204000053039865802BR6009SAOPAULO6304ABCD`;
  const pixCode = demo ? demoCode : (data && data.qrcode) || "";

  const createCharge = async () => {
    setState("loading");
    setErr("");
    try {
      const r = await fetch(pixUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderId, customer }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Falha ao gerar o Pix.");
      setData(j);
      setState("pending");
    } catch (e) {
      setErr(e.message || "Não foi possível conectar ao servidor de pagamento.");
      setState("error");
    }
  };

  // cria a cobrança ao montar (só no modo real)
  useEffect(() => {
    if (!demo) createCharge();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line
  }, []);

  // polling do status
  useEffect(() => {
    if (state !== "pending" || !data) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(statusUrl(data.transactionId));
        const j = await r.json();
        if (j.status === "COMPLETED") {
          clearInterval(pollRef.current);
          setState("paid");
          onPaid();
        } else if (j.status === "FAILED") {
          clearInterval(pollRef.current);
          setErr("O pagamento não foi concluído. Gere um novo Pix.");
          setState("error");
        }
      } catch (e) { /* tenta de novo no próximo ciclo */ }
    }, 4000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line
  }, [state, data]);

  const copy = () => {
    try { navigator.clipboard.writeText(pixCode); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ----- estados de carregamento / erro (modo real) -----
  if (state === "loading") {
    return (
      <div className="pix-box">
        <div className="pix-spinner" aria-label="Gerando Pix"></div>
        <p style={{color:"var(--ink-soft)",fontSize:".95rem",marginTop:14}}>Gerando seu Pix…</p>
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="pix-box">
        <p style={{color:"var(--red)",fontWeight:800,marginBottom:6}}>Ops, não rolou.</p>
        <p style={{color:"var(--muted)",fontSize:".88rem",marginBottom:16,maxWidth:380,marginLeft:"auto",marginRight:"auto"}}>{err}</p>
        <Btn kind="ink" onClick={createCharge}>Tentar novamente</Btn>
      </div>
    );
  }

  // ----- QR pronto (demo ou real) -----
  return (
    <div className="pix-box">
      <div className="qr">{demo ? <FakeQR /> : <RealQR text={pixCode} />}</div>
      <p style={{color:"var(--ink-soft)",fontSize:".92rem"}}>Escaneie o QR Code ou copie o código abaixo no app do seu banco.</p>
      <div className="pix-code">
        <input readOnly value={pixCode} />
        <Btn kind="ink" onClick={copy}>{copied ? "Copiado!" : "Copiar"}</Btn>
      </div>
      {demo ? (
        <React.Fragment>
          <div className="pix-demo-tag">Modo demonstração — nenhum valor é cobrado</div>
          <Btn kind="pink" size="lg" block style={{marginTop:14}} onClick={onPaid}>
            <Icon.check width="18" height="18" /> Já paguei o Pix
          </Btn>
        </React.Fragment>
      ) : (
        <div className="pix-waiting">
          <span className="pix-spinner sm"></span>
          Aguardando confirmação do pagamento…
        </div>
      )}
      <p style={{color:"var(--muted)",fontSize:".82rem",marginTop:12}}>
        {demo ? "Em produção, o pedido é confirmado automaticamente quando o Pix cai." : "Assim que o Pix for compensado, esta tela avança sozinha."}
      </p>
    </div>
  );
}

function CheckoutView({ cart, nav, clearCart }) {
  const items = cart.map((ci) => ({ ...PRODUCTS.find((p) => p.id === ci.id), qty: ci.qty }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const freeShip = subtotal >= STORE.freeShippingThreshold;
  const shipping = freeShip ? 0 : STORE.flatShipping;
  const total = subtotal + shipping;

  const [step, setStep] = useState(0); // 0 dados, 1 entrega, 2 pagamento, 3 sucesso
  const [pay, setPay] = useState("pix");
  const [form, setForm] = useState({
    email: "", nome: "", cpf: "", tel: "",
    cep: "", rua: "", num: "", compl: "", bairro: "", cidade: "", uf: "",
    cardNum: "", cardName: "", cardVal: "", cardCvv: "",
  });
  const [errs, setErrs] = useState({});
  const [pixCopied, setPixCopied] = useState(false);
  const [orderId] = useState(() => "MND-" + Math.floor(100000 + Math.random() * 899999));
  const [snapshot, setSnapshot] = useState(null); // retrato do pedido no momento do pagamento

  if (items.length === 0 && step < 3) {
    return (
      <div className="checkout wrap">
        <div className="empty">
          <div className="em-mark">🛒</div>
          <h2 className="display" style={{fontSize:"2rem",marginBottom:10}}>Carrinho vazio</h2>
          <Btn kind="pink" size="lg" onClick={() => nav({ name: "home" })}>Voltar à loja</Btn>
        </div>
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const maskCpf = (v) => v.replace(/\D/g,"").slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
  const maskTel = (v) => { v=v.replace(/\D/g,"").slice(0,11); return v.replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2"); };
  const maskCep = (v) => { v=v.replace(/\D/g,"").slice(0,8); return v.length>5? v.slice(0,5)+"-"+v.slice(5):v; };
  const maskCard = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1 ");
  const maskVal = (v) => { v=v.replace(/\D/g,"").slice(0,4); return v.length>2? v.slice(0,2)+"/"+v.slice(2):v; };

  const validateStep0 = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido";
    if (form.nome.trim().length < 3) e.nome = "Informe seu nome completo";
    if (form.cpf.replace(/\D/g,"").length !== 11) e.cpf = "CPF incompleto";
    if (form.tel.replace(/\D/g,"").length < 10) e.tel = "Telefone incompleto";
    setErrs(e); return Object.keys(e).length === 0;
  };
  const validateStep1 = () => {
    const e = {};
    if (form.cep.replace(/\D/g,"").length !== 8) e.cep = "CEP incompleto";
    if (!form.rua.trim()) e.rua = "Informe a rua";
    if (!form.num.trim()) e.num = "Nº";
    if (!form.bairro.trim()) e.bairro = "Informe o bairro";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade";
    if (!form.uf.trim()) e.uf = "UF";
    setErrs(e); return Object.keys(e).length === 0;
  };
  const validatePay = () => {
    if (pay === "pix") return true;
    const e = {};
    if (form.cardNum.replace(/\D/g,"").length < 16) e.cardNum = "Número do cartão incompleto";
    if (form.cardName.trim().length < 3) e.cardName = "Nome impresso no cartão";
    if (form.cardVal.length < 5) e.cardVal = "Validade";
    if (form.cardCvv.length < 3) e.cardCvv = "CVV";
    setErrs(e); return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setErrs({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const finish = () => {
    if (!validatePay()) return;
    // tira um "retrato" do pedido ANTES de limpar o carrinho,
    // senão a tela de sucesso recalcularia com o carrinho vazio.
    setSnapshot({
      count: items.reduce((s, i) => s + i.qty, 0),
      total,
      cidade: form.cidade,
      uf: form.uf,
      email: form.email,
      pay,
    });
    setStep(3);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const steps = ["Dados", "Entrega", "Pagamento"];

  /* ---------- SUCESSO ---------- */
  if (step === 3) {
    const snap = snapshot || { count: 0, total: 0, cidade: form.cidade, uf: form.uf, email: form.email, pay };
    return (
      <div className="checkout wrap">
        <div className="success">
          <div className="check"><Icon.check /></div>
          <h2>Pedido confirmado!</h2>
          <p style={{color:"var(--ink-soft)",fontSize:"1.05rem"}}>
            {snap.pay === "pix"
              ? "Pagamento Pix confirmado! Suas figurinhas já estão sendo separadas."
              : "Pagamento aprovado! Suas figurinhas já estão sendo separadas."}
          </p>
          <div className="order-tag">Pedido {orderId}</div>
          <div className="mini-summary">
            <div className="sum-row"><span>Itens</span><span>{snap.count} produto(s)</span></div>
            <div className="sum-row"><span>Entrega</span><span>{snap.cidade}/{snap.uf} · 3 a 6 dias úteis</span></div>
            <div className="sum-row"><span>Pagamento</span><span>{snap.pay === "pix" ? "Pix" : "Cartão de crédito"}</span></div>
            <div className="sum-row total" style={{fontSize:"1.1rem"}}><span>Total</span><span>{fmt(snap.total)}</span></div>
          </div>
          <p style={{color:"var(--muted)",fontSize:".9rem",marginBottom:24}}>
            Enviamos a confirmação para <b>{snap.email}</b>. Acompanhe o rastreio por e-mail.
          </p>
          <Btn kind="ink" size="lg" onClick={() => nav({ name: "home" })}>Voltar à loja</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout wrap">
      <h1 className="display" style={{fontSize:"2.4rem",textAlign:"center",marginBottom:24}}>Finalizar compra</h1>

      <div className="stepper">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`st ${step === i ? "active" : ""} ${step > i ? "done" : ""}`}>
              <span className="bub">{step > i ? <Icon.check width="15" height="15" /> : i + 1}</span>
              <span className="lb">{s}</span>
            </div>
            {i < steps.length - 1 && <span className="bar"></span>}
          </React.Fragment>
        ))}
      </div>

      <div className="co-grid">
        <div>
          {/* STEP 0 — DADOS */}
          {step === 0 && (
            <div className="co-card">
              <h3>Seus dados</h3>
              <p className="hint">Para emissão da nota fiscal e contato sobre o pedido.</p>
              <Field label="E-mail" err={errs.email}>
                <input type="email" placeholder="voce@email.com" value={form.email} onChange={(e)=>set("email",e.target.value)} />
              </Field>
              <Field label="Nome completo" err={errs.nome}>
                <input placeholder="Seu nome" value={form.nome} onChange={(e)=>set("nome",e.target.value)} />
              </Field>
              <div className="row-2">
                <Field label="CPF" err={errs.cpf}>
                  <input placeholder="000.000.000-00" value={form.cpf} onChange={(e)=>set("cpf",maskCpf(e.target.value))} />
                </Field>
                <Field label="Celular / WhatsApp" err={errs.tel}>
                  <input placeholder="(11) 90000-0000" value={form.tel} onChange={(e)=>set("tel",maskTel(e.target.value))} />
                </Field>
              </div>
              <Btn kind="pink" size="lg" block onClick={next} style={{marginTop:10}}>
                Continuar para entrega <Icon.arrow width="18" height="18" />
              </Btn>
            </div>
          )}

          {/* STEP 1 — ENTREGA */}
          {step === 1 && (
            <div className="co-card">
              <h3>Endereço de entrega</h3>
              <p className="hint">Enviamos para todo o Brasil com rastreio.</p>
              <div className="row-2">
                <Field label="CEP" err={errs.cep}>
                  <input placeholder="00000-000" value={form.cep} onChange={(e)=>set("cep",maskCep(e.target.value))} />
                </Field>
                <div></div>
              </div>
              <Field label="Rua / Avenida" err={errs.rua}>
                <input placeholder="Rua das Figurinhas" value={form.rua} onChange={(e)=>set("rua",e.target.value)} />
              </Field>
              <div className="row-3">
                <Field label="Número" err={errs.num}>
                  <input placeholder="123" value={form.num} onChange={(e)=>set("num",e.target.value)} />
                </Field>
                <Field label="Complemento">
                  <input placeholder="Apto 26" value={form.compl} onChange={(e)=>set("compl",e.target.value)} />
                </Field>
                <Field label="Bairro" err={errs.bairro}>
                  <input placeholder="Centro" value={form.bairro} onChange={(e)=>set("bairro",e.target.value)} />
                </Field>
              </div>
              <div className="row-2">
                <Field label="Cidade" err={errs.cidade}>
                  <input placeholder="São Paulo" value={form.cidade} onChange={(e)=>set("cidade",e.target.value)} />
                </Field>
                <Field label="UF" err={errs.uf}>
                  <input placeholder="SP" maxLength="2" value={form.uf} onChange={(e)=>set("uf",e.target.value.toUpperCase().replace(/[^A-Z]/g,""))} />
                </Field>
              </div>
              <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
                <Btn kind="ghost" onClick={()=>setStep(0)}>Voltar</Btn>
                <Btn kind="pink" size="lg" onClick={next} style={{flex:1,minWidth:200}}>
                  Ir para pagamento <Icon.arrow width="18" height="18" />
                </Btn>
              </div>
            </div>
          )}

          {/* STEP 2 — PAGAMENTO */}
          {step === 2 && (
            <div className="co-card">
              <h3>Pagamento</h3>
              <p className="hint">Escolha a forma de pagamento.</p>
              <div className="pay-tabs">
                <button className={`pay-tab ${pay==="pix"?"active":""}`} onClick={()=>{setPay("pix");setErrs({});}}>
                  <span className="pic" style={{background:"var(--green)"}}><Icon.pix width="16" height="16" /></span>
                  <b>Pix</b>
                  <small>Aprovação na hora · 5% mais rápido</small>
                </button>
                <button className={`pay-tab ${pay==="card"?"active":""}`} onClick={()=>{setPay("card");setErrs({});}}>
                  <span className="pic" style={{background:"var(--blue)"}}><Icon.card width="18" height="18" /></span>
                  <b>Cartão</b>
                  <small>Em até 12x sem juros</small>
                </button>
              </div>

              {pay === "pix" ? (
                <PixPayment
                  orderId={orderId}
                  amount={total}
                  customer={{
                    name: form.nome,
                    email: form.email,
                    document: form.cpf.replace(/\D/g, ""),
                    phone: form.tel.replace(/\D/g, ""),
                  }}
                  onPaid={finish}
                />
              ) : (
                <div>
                  <div className="card-visual">
                    <div className="chip"></div>
                    <div className="cnum">{form.cardNum || "•••• •••• •••• ••••"}</div>
                    <div className="crow">
                      <span><small>Titular</small>{form.cardName || "NOME NO CARTÃO"}</span>
                      <span><small>Validade</small>{form.cardVal || "MM/AA"}</span>
                    </div>
                  </div>
                  <Field label="Número do cartão" err={errs.cardNum}>
                    <input placeholder="0000 0000 0000 0000" value={form.cardNum} onChange={(e)=>set("cardNum",maskCard(e.target.value))} />
                  </Field>
                  <Field label="Nome impresso no cartão" err={errs.cardName}>
                    <input placeholder="Como está no cartão" value={form.cardName} onChange={(e)=>set("cardName",e.target.value.toUpperCase())} />
                  </Field>
                  <div className="row-3">
                    <Field label="Validade" err={errs.cardVal}>
                      <input placeholder="MM/AA" value={form.cardVal} onChange={(e)=>set("cardVal",maskVal(e.target.value))} />
                    </Field>
                    <Field label="CVV" err={errs.cardCvv}>
                      <input placeholder="123" value={form.cardCvv} onChange={(e)=>set("cardCvv",e.target.value.replace(/\D/g,"").slice(0,4))} />
                    </Field>
                    <Field label="Parcelas">
                      <select>
                        {[1,2,3,4,6,10,12].map((n)=>(
                          <option key={n} value={n}>{n}x de {fmt(total/n)}{n===1?" à vista":" sem juros"}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              <div style={{display:"flex",gap:12,marginTop:18,flexWrap:"wrap"}}>
                <Btn kind="ghost" onClick={()=>setStep(1)}>Voltar</Btn>
                {pay === "card" && (
                  <Btn kind="pink" size="lg" onClick={finish} style={{flex:1,minWidth:200}}>
                    Pagar {fmt(total)} <Icon.lock width="16" height="16" />
                  </Btn>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RESUMO LATERAL */}
        <aside className="summary">
          <h3>Seu pedido</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
            {items.map((it)=>(
              <div key={it.id} style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:48,height:56,flexShrink:0}}><PackGraphic product={it} style={{borderRadius:8}} /></div>
                <div style={{flex:1,fontSize:".88rem"}}>
                  <div style={{fontWeight:700}}>{it.name}</div>
                  <div style={{color:"var(--muted)"}}>Qtd: {it.qty}</div>
                </div>
                <div style={{fontWeight:700,fontSize:".9rem"}}>{fmt(it.price*it.qty)}</div>
              </div>
            ))}
          </div>
          <div className="sum-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="sum-row"><span>Frete {freeShip && "(grátis)"}</span><span>{shipping===0?<b style={{color:"var(--green-deep)"}}>Grátis</b>:fmt(shipping)}</span></div>
          <div className="sum-row total"><span>Total</span><span>{fmt(total)}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginTop:16,color:"var(--muted)",fontSize:".82rem"}}>
            <Icon.shield width="15" height="15" /> Ambiente seguro e criptografado
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { CheckoutView });
