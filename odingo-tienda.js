/* =====================================================
   OdinGO TIENDA - Catálogo + Carrito (100% frontend)
   - Los precios salen de precios.json, publicado desde
     el sistema de control OdinTECH (junto con la promo).
   - Si ese archivo no está, quedan los precios de abajo.
   - Checkout: arma el pedido y lo envía por WhatsApp / Email
   - Modelo: licencia perpetua (1 PC) con 6 meses de soporte
   ===================================================== */

const ODINGO_CONFIG = {
  // WhatsApp de ventas (Argentina, formato internacional sin "+" ni espacios).
  WHATSAPP_NUMBER: "5493437407273",
  EMAIL_VENTAS: "odintecharg@hotmail.com",
  MONEDA: "$ ARS",
};

// Respaldo: se usa solo si precios.json no está disponible.
// El código de cada sistema es el mismo que usa el sistema de control.
const ODINGO_CATALOG = [
  { id: "ODINGO-KIOSKO", tag: "OdinGO · POS EXPRESS", nombre: "POS Express", precio: 250000, soporte: 25000 },
  { id: "ODINGO-RESTO", tag: "OdinGO · RESTO-ROTI", nombre: "Resto-Roti", precio: 350000, soporte: 30000 },
  { id: "ODINGO-GYM", tag: "OdinGO · GIMNASIO", nombre: "Gimnasio", precio: 150000, soporte: 25000 },
  { id: "ODINGO-RUTINAS", tag: "OdinGO · GIMNASIO + RUTINAS", nombre: "Gimnasio + Rutinas", precio: 350000, soporte: 50000 },
  { id: "ODINGO-TURNERO", tag: "OdinGO · TURNERO", nombre: "Turnero", precio: 100000, soporte: 10000 },
  { id: "ODINGO-TALLER", tag: "OdinGO · TALLERES", nombre: "Talleres", precio: 280000, soporte: 20000 },
  { id: "ODINGO-HOTEL", tag: "OdinGO · HOTEL", nombre: "Hotel", precio: 400000, soporte: 35000 },
  { id: "ODINGO-LAVADERO", tag: "OdinGO · LAVADERO", nombre: "Lavadero", precio: 50000, soporte: 5000 },
];

const OdinGoStore = (() => {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("odingo_cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
  } catch { cart = []; }

  let promo = null;      // { porcentaje, hasta, etiqueta }, publicado desde Control
  let promoWatch = null; // controla el vencimiento con la página abierta

  const $ = (id) => document.getElementById(id);
  const money = (n) => "$ " + Number(n || 0).toLocaleString("es-AR");
  const priceText = (n) => (Number(n) > 0 ? money(n) : "A consultar");

  function save() {
    try { localStorage.setItem("odingo_cart", JSON.stringify(cart)); } catch {}
  }

  function findProduct(id) {
    return ODINGO_CATALOG.find((p) => p.id === id);
  }

  /* La promo rige hasta el 23:59 del día "hasta" (AAAA-MM-DD).
     Pasada esa fecha, la web muestra el precio normal sin tocar nada. */
  function promoVigente() {
    if (!promo) return false;
    const pct = Number(promo.porcentaje) || 0;
    const hasta = String(promo.hasta || "");
    if (pct <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) return false;
    const [y, m, d] = hasta.split("-").map(Number);
    const fin = new Date(y, m - 1, d, 23, 59, 59, 999);
    return new Date() <= fin;
  }

  function fechaFinTexto() {
    const hasta = String((promo && promo.hasta) || "");
    const m = hasta.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : hasta;
  }

  function precioFinal(p) {
    if (!p) return 0;
    const base = Number(p.precio) || 0;
    if (!promoVigente()) return base;
    return Math.round(base * (1 - (Number(promo.porcentaje) || 0) / 100));
  }

  function finalText(p) {
    if (!p || !(Number(p.precio) > 0)) return "A consultar";
    return money(precioFinal(p));
  }

  function promoFrase() {
    return `${promo.porcentaje}% de descuento en todos los OdinGO hasta el ${fechaFinTexto()}`;
  }

  function renderPromo() {
    const activa = promoVigente();
    const etiqueta = (promo && promo.etiqueta) || "Promo de lanzamiento";

    const strip = $("promo-strip");
    if (strip) {
      strip.hidden = !activa;
      const et = strip.querySelector("[data-promo-etiqueta]");
      const tx = strip.querySelector("[data-promo-texto]");
      if (et) et.textContent = etiqueta;
      if (tx) tx.textContent = promoFrase();
    }

    const faq = $("faq-promo");
    if (faq) {
      faq.hidden = !activa;
      const pc = faq.querySelector("[data-promo-porcentaje]");
      const pf = faq.querySelector("[data-promo-fechafin]");
      if (pc) pc.textContent = `${promo.porcentaje}%`;
      if (pf) pf.textContent = fechaFinTexto();
    }

    const cartPromo = $("cart-promo");
    if (cartPromo) {
      cartPromo.hidden = !activa;
      cartPromo.textContent = `${etiqueta}: ${promoFrase()}.`;
    }
  }

  function watchPromo() {
    if (promoWatch) { clearInterval(promoWatch); promoWatch = null; }
    if (!promoVigente()) return;
    promoWatch = setInterval(() => {
      if (promoVigente()) return;
      clearInterval(promoWatch);
      promoWatch = null;
      renderPromo();
      render();
    }, 60000);
  }

  function add(id, openDrawer = true) {
    const prod = findProduct(id);
    if (!prod) return;
    const line = cart.find((l) => l.id === id);
    if (line) line.qty += 1;
    else cart.push({ id, qty: 1 });
    save(); render();
    toast(`${prod.nombre} agregado al pedido`);
    if (openDrawer) setDrawer(true);
  }

  function remove(id) {
    cart = cart.filter((l) => l.id !== id);
    save(); render();
  }

  function setQty(id, qty) {
    qty = Math.max(0, parseInt(qty || "0", 10));
    if (qty === 0) return remove(id);
    const line = cart.find((l) => l.id === id);
    if (line) line.qty = qty;
    save(); render();
  }

  function clear() {
    cart = []; save(); render();
  }

  function total() {
    return cart.reduce((acc, l) => {
      const p = findProduct(l.id);
      return acc + (p ? precioFinal(p) * l.qty : 0);
    }, 0);
  }

  function buyer() {
    return {
      nombre: ($("buyer-nombre")?.value || "").trim(),
      email: ($("buyer-email")?.value || "").trim(),
      tel: ($("buyer-tel")?.value || "").trim(),
      notas: ($("buyer-notas")?.value || "").trim(),
    };
  }

  function orderLines() {
    return cart.map((l) => {
      const p = findProduct(l.id);
      const precio = money(precioFinal(p) * l.qty);
      return `• ${p.nombre} — Licencia perpetua (1 PC), 6 meses de soporte${l.qty > 1 ? ` x${l.qty}` : ""} — ${precio}`;
    });
  }

  function orderText() {
    const b = buyer();
    const promoLinea = promoVigente()
      ? `Promo aplicada: ${encodeURIComponent(promoFrase())}.%0A`
      : "";
    return (
      `PEDIDO OdinGO%0A%0A` +
      orderLines().map((l) => encodeURIComponent(l)).join("%0A") +
      `%0A%0ATOTAL: ${encodeURIComponent(money(total()))}%0A%0A` +
      promoLinea +
      `Pago: efectivo o transferencia.%0A%0A` +
      `--- DATOS DEL COMPRADOR ---%0A` +
      `Nombre: ${encodeURIComponent(b.nombre || "-")}%0A` +
      `Email: ${encodeURIComponent(b.email || "-")}%0A` +
      `Tel: ${encodeURIComponent(b.tel || "-")}%0A` +
      `Notas: ${encodeURIComponent(b.notas || "-")}`
    );
  }

  function orderTextPlain() {
    const b = buyer();
    const promoLinea = promoVigente() ? `Promo aplicada: ${promoFrase()}.\n` : "";
    return (
      `PEDIDO OdinGO\n\n${orderLines().join("\n")}\n\nTOTAL: ${money(total())}\n\n` +
      promoLinea +
      `Pago: efectivo o transferencia.\n\n` +
      `--- DATOS DEL COMPRADOR ---\nNombre: ${b.nombre || "-"}\nEmail: ${b.email || "-"}\nTel: ${b.tel || "-"}\nNotas: ${b.notas || "-"}`
    );
  }

  function checkoutWhatsApp() {
    if (!cart.length) return toast("El pedido está vacío");
    const url = `https://wa.me/${ODINGO_CONFIG.WHATSAPP_NUMBER}?text=${orderText()}`;
    window.open(url, "_blank");
  }

  function checkoutEmail() {
    if (!cart.length) return toast("El pedido está vacío");
    const subject = encodeURIComponent("Pedido de sistemas OdinGO");
    const body = encodeURIComponent(orderTextPlain());
    window.location.href = `mailto:${ODINGO_CONFIG.EMAIL_VENTAS}?subject=${subject}&body=${body}`;
  }

  function setDrawer(open) {
    $("cart-drawer")?.classList.toggle("open", open);
    $("cart-overlay")?.classList.toggle("show", open);
  }

  /* Aplica precios y promo publicados desde el sistema de control.
     - Actualiza cada ficha y oculta los sistemas que no están activos.
     - Descarta del pedido lo que ya no se publica. */
  function applyPrices(sistemas, promocion) {
    promo = promocion || null;
    const byCode = new Map(sistemas.map((s) => [String(s.codigo), s]));

    ODINGO_CATALOG.forEach((p) => {
      const s = byCode.get(p.id);
      if (!s) { p.activo = false; return; }
      p.activo = true;
      p.precio = Number(s.precio) || 0;
      p.soporte = Number(s.soporteMensual) || 0;
    });

    document.querySelectorAll("[data-sistema]").forEach((card) => {
      card.hidden = !byCode.has(card.getAttribute("data-sistema"));
    });

    document.querySelectorAll("[data-demo-sistema]").forEach((link) => {
      link.hidden = !byCode.has(link.getAttribute("data-demo-sistema"));
    });

    document.querySelectorAll("[data-price-for]").forEach((el) => {
      const code = el.getAttribute("data-price-for");
      const p = findProduct(code);
      if (!p) return;
      el.textContent = finalText(p);
      const old = document.querySelector(`[data-old-for="${code}"]`);
      if (old) {
        old.hidden = !promoVigente();
        old.textContent = priceText(p.precio);
      }
      const note = document.querySelector(`[data-promo-note-for="${code}"]`);
      if (note) {
        note.hidden = !promoVigente();
        note.textContent = `${promo.porcentaje}% OFF · ${promo.etiqueta || "Promo de lanzamiento"}`;
      }
    });

    document.querySelectorAll("[data-soporte-for]").forEach((el) => {
      const s = byCode.get(el.getAttribute("data-soporte-for"));
      if (s) el.textContent = money(s.soporteMensual);
    });

    cart = cart.filter((l) => {
      const p = findProduct(l.id);
      return p && p.activo !== false;
    });
    renderPromo();
    watchPromo();
    save(); render();
  }

  function loadPrices() {
    if (!window.fetch) return;
    fetch("precios.json?t=" + Date.now(), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.sistemas) && data.sistemas.length)
          applyPrices(data.sistemas, data.promocion);
      })
      .catch(() => {});
  }

  function render() {
    cart = cart.filter((l) => {
      const p = findProduct(l.id);
      return p && p.activo !== false;
    });

    const count = cart.reduce((a, l) => a + l.qty, 0);
    const badge = $("cart-count");
    if (badge) badge.textContent = count;

    const box = $("cart-items");
    if (box) {
      if (!cart.length) {
        box.innerHTML = `<p class="cart-empty">Tu pedido está vacío.<br>Agregá un sistema para empezar.</p>`;
      } else {
        box.innerHTML = cart.map((l) => {
          const p = findProduct(l.id);
          return `<div class="cart-line">
            <div><strong>${p.nombre}</strong><small>Licencia perpetua (1 PC) · 6 meses de soporte · ${finalText(p)}</small></div>
            <div class="cart-qty">
              <button onclick="OdinGoStore.setQty('${l.id}', ${l.qty - 1})">−</button>
              <span>${l.qty}</span>
              <button onclick="OdinGoStore.setQty('${l.id}', ${l.qty + 1})">+</button>
            </div>
            <button class="cart-del" onclick="OdinGoStore.remove('${l.id}')" aria-label="Quitar">✕</button>
          </div>`;
        }).join("");
      }
    }

    const t = $("cart-total");
    if (t) t.textContent = money(total());

    document.querySelectorAll("[data-price-for]").forEach((el) => {
      const p = findProduct(el.getAttribute("data-price-for"));
      if (p) el.textContent = finalText(p);
    });
    document.querySelectorAll("[data-soporte-for]").forEach((el) => {
      const p = findProduct(el.getAttribute("data-soporte-for"));
      if (p) el.textContent = money(p.soporte);
    });
  }

  function toast(msg) {
    let t = document.getElementById("odingo-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "odingo-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function init() {
    render();
    loadPrices();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { add, remove, setQty, clear, total, render, setDrawer, checkoutWhatsApp, checkoutEmail, toast, applyPrices, promoVigente };
})();
