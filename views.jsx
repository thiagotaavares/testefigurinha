/* ============================================================
   MUNDIAL 26 — Header, Home, Produto, Carrinho
   ============================================================ */
const { fmt, perPack, PRODUCTS, STORE, ACCENTS } = window;

/* ---------- Marquee ---------- */
function Marquee() {
  const items = [
    "Frete grátis acima de R$199",
    "Produtos oficiais licenciados Panini",
    "Envio para todo o Brasil",
    "Pague no Pix e ganhe agilidade",
  ];
  const loop = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {loop.map((t, i) => (
          <span key={i}><i className="dot"></i>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Header ---------- */
function Header({ nav, cartCount, view }) {
  const [open, setOpen] = useState(false);
  const go = (v) => { setOpen(false); nav(v); };
  return (
    <React.Fragment>
      <Marquee />
      <header className="header">
        <div className="wrap header-row">
          <a className="logo" onClick={() => go({ name: "home" })} style={{cursor:"pointer"}}>
            <span className="logo-mark"></span>
            <span className="logo-txt">
              <b>MUNDIAL 26</b>
              <small>Banca de Figurinhas</small>
            </span>
          </a>
          <nav className="nav">
            <a onClick={() => go({ name: "home", scrollTo: "pacotes" })}>Pacotes</a>
            <a onClick={() => go({ name: "home", scrollTo: "album" })}>Kits com Álbum</a>
            <a onClick={() => go({ name: "home", scrollTo: "como" })}>Como funciona</a>
          </nav>
          <div className="header-actions">
            <Btn kind="ink" className="cart-btn" onClick={() => go({ name: "cart" })} aria-label="Carrinho">
              <Icon.cart width="18" height="18" />
              <span className="cart-label">Carrinho</span>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Btn>
            <button className="menu-toggle" onClick={() => setOpen(true)} aria-label="Menu">
              <Icon.menu />
            </button>
          </div>
        </div>
      </header>
      <div className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-bg" onClick={() => setOpen(false)}></div>
        <div className="drawer-panel">
          <button className="drawer-close" onClick={() => setOpen(false)}>×</button>
          <a onClick={() => go({ name: "home", scrollTo: "pacotes" })}>Pacotes</a>
          <a onClick={() => go({ name: "home", scrollTo: "album" })}>Kits com Álbum</a>
          <a onClick={() => go({ name: "home", scrollTo: "como" })}>Como funciona</a>
          <a onClick={() => go({ name: "cart" })}>Carrinho ({cartCount})</a>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------- Hero ---------- */
function Hero({ nav }) {
  const heroPacks = [PRODUCTS[1], PRODUCTS[6], PRODUCTS[0]];
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="flag-dots">
              <i style={{background:"#3B8DFF"}}></i>
              <i style={{background:"#fff"}}></i>
              <i style={{background:"#19C37D"}}></i>
            </span>
            EUA · México · Canadá — 2026
          </span>
          <h1>
            <span className="grad">Colecione</span><br/>
            a Copa<br/>
            <span className="out">do Mundo</span>
          </h1>
          <p className="hero-sub">
            Pacotes e álbuns oficiais licenciados Panini, com envio para todo o Brasil. Comece a coleção antes de todo mundo.
          </p>
          <div className="hero-cta">
            <Btn kind="pink" size="lg" onClick={() => nav({ name: "home", scrollTo: "pacotes" })}>
              Ver pacotes <Icon.arrow width="18" height="18" />
            </Btn>
            <Btn kind="gold" size="lg" onClick={() => nav({ name: "home", scrollTo: "album" })}>
              Kits com álbum
            </Btn>
          </div>
          <div className="hero-stats">
            <div className="st"><b>670+</b><small>figurinhas na coleção</small></div>
            <div className="st"><b>100%</b><small>oficial Panini</small></div>
            <div className="st"><b>48h</b><small>envio expresso</small></div>
          </div>
        </div>
        <div className="hero-art">
          <div className="float-pack fp1"><PackGraphic product={heroPacks[0]} className="" /></div>
          <div className="float-pack fp2"><PackGraphic product={heroPacks[1]} /></div>
          <div className="float-pack fp3"><PackGraphic product={heroPacks[2]} /></div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust strip ---------- */
function TrustStrip() {
  const cells = [
    { ic: "badge", c: "var(--gold)", t: "Oficial Panini", s: "Produtos 100% licenciados e autênticos" },
    { ic: "truck", c: "var(--blue)", t: "Frete grátis", s: "Em pedidos acima de R$199" },
    { ic: "bolt", c: "var(--pink)", t: "Envio expresso", s: "Despacho em até 48h úteis" },
    { ic: "shield", c: "var(--green)", t: "Compra segura", s: "Pagamento via Pix ou cartão" },
  ];
  return (
    <section className="trust">
      <div className="wrap" style={{padding:"34px 24px"}}>
        <div className="trust-row">
          {cells.map((c, i) => {
            const I = Icon[c.ic];
            return (
              <div className="trust-cell" key={i}>
                <span className="ic" style={{background:c.c}}><I /></span>
                <span><b>{c.t}</b><small>{c.s}</small></span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Product card ---------- */
function ProductCard({ product, onOpen, onAdd }) {
  const [flash, setFlash] = useState(false);
  const pp = perPack(product);
  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(product, 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
  };
  return (
    <article className="card" onClick={() => onOpen(product)}>
      {flash && <div className="added-flash"><Icon.check width="20" height="20" /> Adicionado!</div>}
      {product.badge && <span className="card-badge">{product.badge}</span>}
      <div className="card-media">
        <PackGraphic product={product} />
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        {product.album && (
          <div className="card-meta">
            <span className="tag">Álbum capa dura</span>
          </div>
        )}
        <div className="card-price">
          <span className="now">{fmt(product.price)}</span>
          {pp && <span className="per">≈ {fmt(pp)}/pacote</span>}
        </div>
        <div className="card-foot">
          <Btn kind="pink" className="card-add" onClick={handleAdd}>
            <Icon.cart width="16" height="16" /> Adicionar
          </Btn>
        </div>
      </div>
    </article>
  );
}

/* ---------- Product section ---------- */
function ProductSection({ id, eyebrow, title, desc, items, alt, onOpen, onAdd }) {
  return (
    <section className={`section ${alt ? "alt" : ""}`} id={id}>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-eyebrow">{eyebrow}</div>
            <h2>{title}</h2>
          </div>
          <p>{desc}</p>
        </div>
        <div className={`prod-grid ${items.length === 3 ? "cols-3" : ""}`}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
function HowItWorks() {
  const steps = [
    { ic: "cart", c: "var(--pink)", t: "Escolha seu kit", p: "Do pacote avulso ao kit de 100 — ou já leve com álbum capa dura." },
    { ic: "truck", c: "var(--blue)", t: "Receba em casa", p: "Envio expresso para todo o Brasil, despacho em até 48h úteis." },
    { ic: "swap", c: "var(--green)", t: "Cole, troque, complete", p: "Monte sua coleção, troque as repetidas e feche o álbum da Copa." },
  ];
  return (
    <section className="section" id="como">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-eyebrow">Simples assim</div>
            <h2>Como funciona</h2>
          </div>
          <p>Três passos pra você sair colecionando a maior Copa de todos os tempos.</p>
        </div>
        <div className="steps">
          {steps.map((s, i) => {
            const I = Icon[s.ic];
            return (
              <div className="step" key={i}>
                <span className="step-n">{i + 1}</span>
                <span className="ic" style={{background:s.c}}><I width="22" height="22" /></span>
                <h4>{s.t}</h4>
                <p>{s.p}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer({ nav }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="logo" onClick={() => nav({ name: "home" })} style={{cursor:"pointer"}}>
              <span className="logo-mark"></span>
              <span className="logo-txt"><b style={{color:"#fff"}}>MUNDIAL 26</b></span>
            </a>
            <p>A sua banca de figurinhas da Copa do Mundo 2026. Produtos oficiais licenciados Panini, do pacote avulso ao álbum capa dura.</p>
          </div>
          <div>
            <h5>Loja</h5>
            <ul>
              <li><a onClick={() => nav({ name: "home", scrollTo: "pacotes" })}>Pacotes</a></li>
              <li><a onClick={() => nav({ name: "home", scrollTo: "album" })}>Kits com álbum</a></li>
              <li><a onClick={() => nav({ name: "cart" })}>Carrinho</a></li>
            </ul>
          </div>
          <div>
            <h5>Ajuda</h5>
            <ul>
              <li><a>Prazos de entrega</a></li>
              <li><a>Trocas e devoluções</a></li>
              <li><a>Rastrear pedido</a></li>
              <li><a>Fale conosco</a></li>
            </ul>
          </div>
          <div>
            <h5>Pagamento</h5>
            <ul>
              <li><a>Pix</a></li>
              <li><a>Cartão de crédito</a></li>
              <li><a>Em até 12x</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <small>
            © 2026 MUNDIAL 26 · Banca de Figurinhas — loja independente.<br/>
            Produtos oficiais licenciados Panini. Não temos vínculo com a FIFA. CNPJ 00.000.000/0001-00.
          </small>
          <div className="pay-badges">
            <span>PIX</span><span>VISA</span><span>MASTER</span><span>ELO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- HOME VIEW ---------- */
function HomeView({ nav, onAdd }) {
  const pacotes = PRODUCTS.filter((p) => p.cat === "pacotes");
  const album = PRODUCTS.filter((p) => p.cat === "album");
  const open = (p) => nav({ name: "product", id: p.id });
  return (
    <React.Fragment>
      <Hero nav={nav} />
      <TrustStrip />
      <ProductSection
        id="pacotes"
        eyebrow="Comece sua coleção"
        title="Pacotes de Figurinhas"
        desc="Do pacote avulso ao kit de 100 pacotes. Cada pacote traz 7 figurinhas oficiais da Copa 2026."
        items={pacotes}
        onOpen={open}
        onAdd={onAdd}
      />
      <ProductSection
        id="album"
        eyebrow="Pacote + álbum"
        title="Kits com Álbum"
        desc="Já leve o álbum oficial capa dura junto com seus pacotes. O combo perfeito pra começar com tudo."
        items={album}
        alt
        onOpen={open}
        onAdd={onAdd}
      />
      <HowItWorks />
    </React.Fragment>
  );
}

Object.assign(window, { Header, Hero, TrustStrip, ProductCard, ProductSection, HowItWorks, Footer, HomeView });
