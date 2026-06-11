/* ============================================================
   MUNDIAL 26 — UI primitives & ícones
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* ---------- Ícones (traço simples, sem ilustrações complexas) ---------- */
const Icon = {
  cart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>
      <path d="M2 2h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6"/>
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>
  ),
  truck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 4h13v11H1z"/><path d="M14 8h4l3 3v4h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>
  ),
  shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  badge: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></svg>
  ),
  bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 2 4 14h7l-2 8 9-12h-7z"/></svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
  ),
  pix: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2.5 16.8 7l-2.1 2.1a3.8 3.8 0 0 0-5.4 0L7.2 7 12 2.5zM2.5 12 7 7.2l2.1 2.1a3.8 3.8 0 0 0 0 5.4L7 16.8 2.5 12zM12 21.5 7.2 17l2.1-2.1a3.8 3.8 0 0 0 5.4 0L16.8 17 12 21.5zM21.5 12 17 16.8l-2.1-2.1a3.8 3.8 0 0 0 0-5.4L17 7.2 21.5 12z"/></svg>
  ),
  card: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  ),
  menu: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>
  ),
  swap: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 4 3 8l4 4"/><path d="M3 8h14a4 4 0 0 1 0 8h-1"/><path d="m17 20 4-4-4-4"/><path d="M21 16H9"/></svg>
  ),
  sparkle: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7z"/></svg>
  ),
};

/* ---------- PackGraphic: representação gráfica do produto ---------- */
function PackGraphic({ product, className = "", style: extraStyle }) {
  const a = window.ACCENTS[product.accent] || window.ACCENTS.pink;
  const isAlbum = product.album;

  // Foto real do produto, quando disponível
  if (product.image) {
    return (
      <div className={`pack pack-photo ${className}`} style={extraStyle}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
    );
  }

  const style = { "--c": a.base, "--cd": a.deep, ...(extraStyle || {}) };
  return (
    <div className={`pack ${isAlbum ? "is-album" : ""} ${className}`} style={style}>
      <div className="pack-top">
        <span className="pack-holo"></span>
      </div>
      <div className="pack-body">
        {isAlbum ? (
          <React.Fragment>
            <div className="album-book">
              <span className="ab-title">ÁLBUM</span>
              <span className="ab-sub">COPA 26</span>
              <span className="ab-tag">CAPA DURA</span>
            </div>
            <div className="pack-num sm">+{product.packs}</div>
            <div className="pack-label">Pacotes</div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="pack-num">{product.packs}</div>
            <div className="pack-label">{product.packs === 1 ? "Pacote" : "Pacotes"}</div>
          </React.Fragment>
        )}
      </div>
      <div className="pack-foot">
        <span className="of">OFICIAL · PANINI<br/>FIGURINHAS COPA 2026</span>
        <span className="pack-stars"><i></i><i></i><i></i></span>
      </div>
    </div>
  );
}

/* ---------- Botão genérico ---------- */
function Btn({ kind = "ink", size, block, children, className = "", ...rest }) {
  const cls = [
    "btn",
    `btn-${kind}`,
    size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ].join(" ");
  return <button className={cls} {...rest}>{children}</button>;
}

/* ---------- Selo de figurinhas por pacote ---------- */
function stickerCount(product) {
  return product.packs * window.STORE.stickersPerPack;
}

Object.assign(window, { Icon, PackGraphic, Btn, stickerCount });
