/* ============================================================
   MUNDIAL 26 — Página de produto + Carrinho
   ============================================================ */

/* ---------- PRODUCT DETAIL ---------- */
function ProductView({ id, nav, onAdd }) {
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [cep, setCep] = useState("");
  const [shipResult, setShipResult] = useState(null);
  const [added, setAdded] = useState(false);
  const pp = perPack(product);
  const installment = (product.price / 12);

  const related = PRODUCTS.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 3);
  if (related.length < 3) {
    PRODUCTS.forEach((p) => { if (p.id !== product.id && related.length < 3 && !related.includes(p)) related.push(p); });
  }

  const calcShip = () => {
    if (cep.replace(/\D/g, "").length < 8) { setShipResult({ err: true }); return; }
    const total = product.price * qty;
    setShipResult({ free: total >= STORE.freeShippingThreshold, value: STORE.flatShipping });
  };

  const doAdd = () => {
    onAdd(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const features = [
    "Figurinhas oficiais da Copa 2026",
    "7 figurinhas por pacote",
    product.album ? "Álbum oficial capa dura incluso" : "Embalagem lacrada de fábrica",
    "Licenciado Panini",
    "Envio expresso em até 48h",
    "Nota fiscal inclusa",
  ];

  return (
    <div className="pd wrap">
      <div className="breadcrumb">
        <a onClick={() => nav({ name: "home" })} style={{cursor:"pointer"}}>Início</a>
        <span className="sep">/</span>
        <a onClick={() => nav({ name: "home", scrollTo: product.cat })} style={{cursor:"pointer"}}>
          {product.cat === "album" ? "Kits com Álbum" : "Pacotes"}
        </a>
        <span className="sep">/</span>
        <span style={{color:"var(--ink)"}}>{product.name}</span>
      </div>

      <div className="pd-grid">
        <div className="pd-gallery">
          <PackGraphic product={product} className="pd-hero-pack" />
          <div className="pd-thumbs">
            {["FOTO FRENTE","FOTO VERSO","FIGURINHAS","UNBOXING"].map((t, i) => (
              <div className="pd-thumb" key={i}>
                <div className="ph"><small>{t}</small></div>
              </div>
            ))}
          </div>
        </div>

        <div className="pd-info">
          {product.badge && <span className="card-badge" style={{position:"static",display:"inline-block",marginBottom:14}}>{product.badge}</span>}
          <h1>{product.name}</h1>
          <div className="pd-rating">
            <span className="stars">
              {[0,1,2,3,4].map((i) => <Icon.star key={i} />)}
            </span>
            4,9 · 1.284 avaliações
          </div>
          <p className="pd-blurb">{product.blurb}</p>

          <div className="pd-price-row">
            <span className="pd-price">{fmt(product.price)}</span>
            {pp && <span className="pd-per">≈ {fmt(pp)} por pacote</span>}
          </div>
          <div className="pd-installments">ou 12x de {fmt(installment)} sem juros no cartão</div>

          <ul className="pd-features">
            {features.map((f, i) => (
              <li key={i}><Icon.check /> {f}</li>
            ))}
          </ul>

          <div className="pd-buy">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Mais">+</button>
            </div>
            <Btn kind="pink" size="lg" onClick={doAdd}>
              {added ? <React.Fragment><Icon.check width="18" height="18"/> Adicionado!</React.Fragment>
                     : <React.Fragment><Icon.cart width="18" height="18"/> Adicionar — {fmt(product.price * qty)}</React.Fragment>}
            </Btn>
          </div>

          <div className="cep-box">
            <Icon.truck width="22" height="22" style={{color:"var(--blue)",flexShrink:0}} />
            <input
              placeholder="Digite seu CEP"
              value={cep}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g,"").slice(0,8);
                if (v.length > 5) v = v.slice(0,5) + "-" + v.slice(5);
                setCep(v);
              }}
            />
            <Btn kind="ink" size="sm" onClick={calcShip}>Calcular</Btn>
            {shipResult && (
              <div style={{flexBasis:"100%",fontSize:".88rem",marginTop:4}}>
                {shipResult.err ? (
                  <span style={{color:"var(--pink)"}}>CEP inválido — confira os números.</span>
                ) : shipResult.free ? (
                  <span className="ship-free" style={{color:"var(--green-deep)",fontWeight:800}}>🎉 Frete grátis para o seu CEP!</span>
                ) : (
                  <span style={{color:"var(--ink-soft)"}}>Frete expresso: <b>{fmt(shipResult.value)}</b> · 3 a 6 dias úteis. Falta {fmt(STORE.freeShippingThreshold - product.price*qty)} pra frete grátis.</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Relacionados */}
      <div style={{marginTop:70}}>
        <div className="sec-head">
          <div>
            <div className="sec-eyebrow">Leve também</div>
            <h2 style={{fontSize:"2rem"}}>Você também vai querer</h2>
          </div>
        </div>
        <div className="prod-grid cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={(pr) => { nav({ name: "product", id: pr.id }); }} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- CART ---------- */
function CartView({ cart, nav, setQty, removeItem }) {
  const items = cart.map((ci) => ({ ...PRODUCTS.find((p) => p.id === ci.id), qty: ci.qty }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const freeShip = subtotal >= STORE.freeShippingThreshold && subtotal > 0;
  const shipping = subtotal === 0 ? 0 : (freeShip ? 0 : STORE.flatShipping);
  const total = subtotal + shipping;
  const remaining = Math.max(0, STORE.freeShippingThreshold - subtotal);
  const pct = Math.min(100, (subtotal / STORE.freeShippingThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="cart-page wrap">
        <div className="empty">
          <div className="em-mark">🛒</div>
          <h2 className="display" style={{fontSize:"2rem",marginBottom:10}}>Seu carrinho está vazio</h2>
          <p style={{color:"var(--muted)",marginBottom:26}}>Que tal começar a coleção da Copa 2026?</p>
          <Btn kind="pink" size="lg" onClick={() => nav({ name: "home", scrollTo: "pacotes" })}>
            Ver pacotes <Icon.arrow width="18" height="18" />
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page wrap">
      <h1 className="display" style={{fontSize:"2.6rem",marginBottom:26}}>Seu carrinho</h1>
      <div className="cart-grid">
        <div className="cart-items">
          {items.map((it) => (
            <div className="cart-item" key={it.id}>
              <div onClick={() => nav({ name: "product", id: it.id })} style={{cursor:"pointer"}}>
                <PackGraphic product={it} />
              </div>
              <div>
                <div className="ci-name">{it.name}</div>
                <div className="ci-meta">{it.packs === 1 ? "1 pacote" : it.packs + " pacotes"}{it.album ? " · álbum capa dura" : ""}</div>
                <div className="ci-meta">{fmt(it.price)} cada</div>
              </div>
              <div className="ci-right">
                <div className="ci-price">{fmt(it.price * it.qty)}</div>
                <div className="qty sm">
                  <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="Menos">−</button>
                  <span>{it.qty}</span>
                  <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="Mais">+</button>
                </div>
                <a className="ci-remove" onClick={() => removeItem(it.id)}>Remover</a>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Resumo</h3>
          <div className="ship-bar">
            {freeShip ? (
              <div className="ship-free"><Icon.truck width="16" height="16" style={{verticalAlign:"-3px",marginRight:6}} />Você ganhou frete grátis! 🎉</div>
            ) : (
              <div>Falta <b>{fmt(remaining)}</b> para o frete grátis</div>
            )}
            <div className="track"><div className="fill" style={{width:pct+"%"}}></div></div>
          </div>
          <div className="sum-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="sum-row">
            <span>Frete</span>
            <span>{shipping === 0 ? <b style={{color:"var(--green-deep)"}}>Grátis</b> : fmt(shipping)}</span>
          </div>
          <div className="sum-row total"><span>Total</span><span>{fmt(total)}</span></div>
          <Btn kind="pink" size="lg" block style={{marginTop:18}} onClick={() => nav({ name: "checkout" })}>
            Finalizar compra <Icon.arrow width="18" height="18" />
          </Btn>
          <Btn kind="ghost" block style={{marginTop:10}} onClick={() => nav({ name: "home", scrollTo: "pacotes" })}>
            Continuar comprando
          </Btn>
          <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginTop:16,color:"var(--muted)",fontSize:".82rem"}}>
            <Icon.lock width="14" height="14" /> Pagamento 100% seguro
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { ProductView, CartView });
