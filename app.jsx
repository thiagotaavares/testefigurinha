/* ============================================================
   MUNDIAL 26 — App principal (estado, roteamento, carrinho)
   ============================================================ */
const CART_KEY = "mundial26_cart_v1";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}

function App() {
  const [view, setView] = useState({ name: "home" });
  const [cart, setCart] = useState(loadCart);

  // Persiste o carrinho
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  // Navegação + scroll
  const nav = (v) => {
    setView(v);
    if (v.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(v.scrollTo);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0 });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  const addToCart = (product, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === product.id);
      if (ex) return c.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { id: product.id, qty }];
    });
  };
  const setQty = (id, qty) => {
    if (qty <= 0) { setCart((c) => c.filter((i) => i.id !== id)); return; }
    setCart((c) => c.map((i) => i.id === id ? { ...i, qty } : i));
  };
  const removeItem = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  let page;
  if (view.name === "home") page = <HomeView nav={nav} onAdd={addToCart} />;
  else if (view.name === "product") page = <ProductView id={view.id} nav={nav} onAdd={addToCart} />;
  else if (view.name === "cart") page = <CartView cart={cart} nav={nav} setQty={setQty} removeItem={removeItem} />;
  else if (view.name === "checkout") page = <CheckoutView cart={cart} nav={nav} clearCart={clearCart} />;

  return (
    <React.Fragment>
      <Header nav={nav} cartCount={cartCount} view={view} />
      <main className="app-main">{page}</main>
      <Footer nav={nav} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
