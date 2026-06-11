/* ============================================================
   MUNDIAL 26 — Dados dos produtos
   Produtos oficiais licenciados Panini (texto informativo).
   Marca da loja é fictícia/original.
   ============================================================ */

window.STORE = {
  name: "MUNDIAL 26",
  tagline: "Banca de Figurinhas",
  freeShippingThreshold: 199.0,
  stickersPerPack: 7,
  // Tabela de frete simplificada (demonstração)
  flatShipping: 21.9,
  whatsapp: "5511999990000",
};

// Cores de destaque por produto (paleta vibrante multicolor)
window.ACCENTS = {
  pink: { base: "#FF2E63", deep: "#C20E45", ink: "#3A0214" },
  blue: { base: "#2D6BFF", deep: "#0E3FC2", ink: "#031040" },
  green: { base: "#00C26E", deep: "#018049", ink: "#013420" },
  gold: { base: "#FFB200", deep: "#D98A00", ink: "#3A2900" },
  orange: { base: "#FF6A1A", deep: "#D14700", ink: "#3A1400" },
  violet: { base: "#8A4DFF", deep: "#5E1FD1", ink: "#1E0640" },
};

window.PRODUCTS = [
  // ---------- PACOTES (sem álbum) ----------
  {
    id: "individual",
    cat: "pacotes",
    name: "Pacote Individual",
    short: "1 pacote",
    packs: 1,
    album: false,
    price: 6.0,
    accent: "violet",
    badge: null,
    image: "img/pacote-individual.png",
    blurb:
      "Aquele pacote pra completar a página que falta. 7 figurinhas oficiais, surpresa garantida.",
  },
  {
    id: "kit-10",
    cat: "pacotes",
    name: "Kit 10 Pacotes",
    short: "10 pacotes",
    packs: 10,
    album: false,
    price: 54.99,
    accent: "pink",
    badge: "Mais vendido",
    image: "img/kit-10.png",
    blurb:
      "O ponto de partida ideal pra quem está montando a coleção. 70 figurinhas pra começar com tudo.",
  },
  {
    id: "kit-50",
    cat: "pacotes",
    name: "Kit 50 Pacotes",
    short: "50 pacotes",
    packs: 50,
    album: false,
    price: 274.5,
    accent: "blue",
    badge: null,
    image: "img/kit-50.png",
    blurb:
      "Pra acelerar de verdade. 350 figurinhas, mais trocas, menos páginas vazias.",
  },
  {
    id: "kit-100",
    cat: "pacotes",
    name: "Kit 100 Pacotes",
    short: "100 pacotes",
    packs: 100,
    album: false,
    price: 549.0,
    accent: "green",
    badge: "Melhor custo",
    image: "img/kit-100.png",
    blurb:
      "O kit dos colecionadores raiz. 700 figurinhas pra encher o álbum e ainda sobrar pra trocar.",
  },

  // ---------- KITS COM ÁLBUM (capa dura) ----------
  {
    id: "album-10",
    cat: "album",
    name: "Álbum + 10 Pacotes",
    short: "Álbum + 10",
    packs: 10,
    album: true,
    price: 74.99,
    accent: "gold",
    badge: "Pra começar",
    image: "img/album-10.png",
    blurb:
      "Álbum oficial capa dura + 10 pacotes. Tudo que você precisa pra dar o pontapé inicial.",
  },
  {
    id: "album-50",
    cat: "album",
    name: "Álbum + 50 Pacotes",
    short: "Álbum + 50",
    packs: 50,
    album: true,
    price: 294.5,
    accent: "orange",
    badge: null,
    image: "img/album-50.png",
    blurb:
      "Álbum capa dura + 50 pacotes. A combinação que enche várias páginas logo de cara.",
  },
  {
    id: "album-100",
    cat: "album",
    name: "Álbum + 100 Pacotes",
    short: "Álbum + 100",
    packs: 100,
    album: true,
    price: 559.0,
    accent: "pink",
    badge: "Coleção completa",
    image: "img/album-100.png",
    blurb:
      "Álbum capa dura + 100 pacotes. O caminho mais curto pra fechar a coleção da Copa.",
  },
];

// Utilidades de formatação
window.fmt = function (v) {
  return "R$ " + v.toFixed(2).replace(".", ",");
};
window.perPack = function (p) {
  if (p.packs <= 1) return null;
  // valor aproximado por pacote (kits com álbum descontam ~R$30 do álbum)
  const albumValue = p.album ? 30 : 0;
  return (p.price - albumValue) / p.packs;
};
