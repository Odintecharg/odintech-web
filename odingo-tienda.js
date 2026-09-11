/* =====================================================
   OdinGO TIENDA - Config + Carrito (100% frontend)
   - Sin backend: el carrito vive en memoria + localStorage
   - Checkout: arma el pedido y lo envía por WhatsApp / Email
   - PARA EDITAR PRECIOS: ODINGO_CATALOG abajo
   - Modelo: módulo (pago único, incluye 6 meses) +
   -   mantenimiento opcional $25.000/mes (mínimo 6 meses)
   ===================================================== */

const ODINGO_CONFIG = {
  // TODO: reemplazar por tu número real, formato internacional sin "+" ni espacios.
  // Ej Argentina: "5493454123456"
  WHATSAPP_NUMBER: "5490000000000",
  EMAIL_VENTAS: "odintecharg@hotmail.com",
  MONEDA: "$ ARS",
};

// PAGO ONLINE con Mercado Pago (links de pago fijos + suscripciones).
// Cómo activarlo: en Mercado Pago → Cobrar → Link de pago, creá uno por
// cada monto de abajo (y Suscripciones para los mensuales), pegá la URL
// entre comillas y subí la página. Mientras estén vacíos, no se muestran
// botones de pago (el carrito sigue por WhatsApp/Email).
const MP_LINKS = {
  modA: "", // Módulo Kiosco/Resto/Hotel ($490.000) → link de pago
  modB: "", // Módulo Gimnasio/Turnero/Talleres/Lavadero ($250.000) → link de pago
  mant: "", // Mantenimiento $25.000/mes → SUSCRIPCIÓN mensual
  inf: "",  // Informes $35.000/mes → SUSCRIPCIÓN mensual
};

// ★★★ EDITA TUS PRECIOS AQUÍ ★★★
// type: "modulo" (pago único, incluye 6 meses de mantenimiento/soporte) |
//       "mantenimiento" (mensual, contratación mínima 6 meses) |
//       "suscripcion" (mensual)
const ODINGO_CATALOG = [
  { id: "comercios", tag: "OdinGO · POS EXPRESS", nombre: "Kiosco / Comercios", desc: "POS con escáner, granel, mayorista, combos, caja y cuenta corriente.", precio: 490000, type: "modulo" },
  { id: "gastronomia", tag: "OdinGO · RESTO-ROTI", nombre: "Restaurant / Rotisería", desc: "Mesas, mostrador, delivery, cocina KDS, mixto restaurant+rotisería.", precio: 490000, type: "modulo" },
  { id: "gimnasios", tag: "OdinGO · GIMNASIO", nombre: "Gimnasios y Academias", desc: "Socios, cuotas, clases, ingresos, congelar, recordatorios con botón de WhatsApp.", precio: 250000, type: "modulo" },
  { id: "peluqueria", tag: "OdinGO · TURNERO", nombre: "Peluquerías y Estética", desc: "Agenda por profesional, cobranza mixta, comisiones, caja.", precio: 250000, type: "modulo" },
  { id: "talleres", tag: "OdinGO · TALLERES", nombre: "Talleres Mecánicos", desc: "Órdenes, control de ingreso imprimible, patentes, repuestos.", precio: 250000, type: "modulo" },
  { id: "hotel", tag: "OdinGO · HOTEL", nombre: "Hotel / Hospedaje", desc: "Reservas, recepción por colores, consumos, checkout, POS mostrador.", precio: 490000, type: "modulo" },
  { id: "lavadero", tag: "OdinGO · LAVADEROS", nombre: "Lavaderos & Servicios", desc: "Agenda, playa kanban en vivo, abonos, operarios y comisiones.", precio: 250000, type: "modulo" },
  { id: "mantenimiento", tag: "OdinGO · MANTENIMIENTO", nombre: "Mantenimiento OdinGO (mensual)", desc: "Actualizaciones, mejoras, mantenimiento y soporte. Contratación mínima: 6 meses.", precio: 25000, type: "mantenimiento" },
  { id: "informes", tag: "OdinCLOUD · INFORMES", nombre: "OdinCLOUD Informes (mensual)", desc: "Si tenés otro sistema, analizamos la integración y ves tus datos desde el celular.", precio: 35000, type: "suscripcion" },
];

const OdinGoStore = (() => {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("odingo_cart") || "[]");
    // Limpia líneas del modelo anterior (por plan)
    cart.forEach((l) => { delete l.plan; });
  } catch { cart = []; }

  const $ = (id) => document.getElementById(id);
  const money = (n) => "$ " + Number(n).toLocaleString("es-AR");

  function save() {
    try { localStorage.setItem("odingo_cart", JSON.stringify(cart)); } catch {}
  }

  function findProduct(id) {
    return ODINGO_CATALOG.find((p) => p.id === id);
  }

  function lineLabel(l) {
    const p = findProduct(l.id);
    if (!p) return "";
    if (p.type === "modulo") return `Módulo (pago único, incluye 6 meses)`;
    if (p.type === "mantenimiento") return `Mensual · mín. 6 meses ($150.000 el bloque)`;
    return "Suscripción mensual";
  }

  function add(id, openDrawer = true) {
    const prod = findProduct(id);
    if (!prod) return;
    const line = cart.find((l) => l.id === id);
    if (line) line.qty += 1;
    else cart.push({ id, qty: 1 });
    save(); render();
    toast(`✅ ${prod.nombre} agregado al pedido`);
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
      return acc + (p ? p.precio * l.qty : 0);
    }, 0);
  }

  function mpLinkFor(l) {
    if (l.id === "mantenimiento") return MP_LINKS.mant || "";
    if (l.id === "informes") return MP_LINKS.inf || "";
    const p = findProduct(l.id);
    if (!p || p.type !== "modulo") return "";
    return (p.precio >= 490000 ? MP_LINKS.modA : MP_LINKS.modB) || "";
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
      return `• ${p.nombre} — ${lineLabel(l)}${l.qty > 1 ? ` x${l.qty}` : ""} — ${money(p.precio * l.qty)}`;
    });
  }

  function orderText() {
    const b = buyer();
    return (
      `PEDIDO OdinGO%0A%0A` +
      orderLines().map((l) => encodeURIComponent(l)).join("%0A") +
      `%0A%0ATOTAL: ${encodeURIComponent(money(total()))}%0A%0A` +
      `--- DATOS DEL COMPRADOR ---%0A` +
      `Nombre: ${encodeURIComponent(b.nombre || "-")}%0A` +
      `Email: ${encodeURIComponent(b.email || "-")}%0A` +
      `Tel: ${encodeURIComponent(b.tel || "-")}%0A` +
      `Notas: ${encodeURIComponent(b.notas || "-")}`
    );
  }

  function orderTextPlain() {
    const b = buyer();
    return (
      `PEDIDO OdinGO\n\n${orderLines().join("\n")}\n\nTOTAL: ${money(total())}\n\n` +
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
    const subject = encodeURIComponent("Pedido de licencias OdinGO");
    const body = encodeURIComponent(orderTextPlain());
    window.location.href = `mailto:${ODINGO_CONFIG.EMAIL_VENTAS}?subject=${subject}&body=${body}`;
  }

  function setDrawer(open) {
    $("cart-drawer")?.classList.toggle("open", open);
    $("cart-overlay")?.classList.toggle("show", open);
  }

  function render() {
    // Limpia líneas de productos que ya no existen
    cart = cart.filter((l) => findProduct(l.id));
    const count = cart.reduce((a, l) => a + l.qty, 0);
    const badge = $("cart-count");
    if (badge) badge.textContent = count;
    const box = $("cart-items");
    if (!box) return;
    if (!cart.length) {
      box.innerHTML = `<p class="cart-empty">Tu pedido está vacío.<br>Agregá un módulo para empezar.</p>`;
    } else {
      box.innerHTML = cart.map((l) => {
        const p = findProduct(l.id);
        const mp = mpLinkFor(l);
        return `<div class="cart-line">
          <div><strong>${p.nombre}</strong><small>${lineLabel(l)} · ${money(p.precio)}</small></div>
          <div class="cart-qty">
            <button onclick="OdinGoStore.setQty('${l.id}', ${l.qty - 1})">−</button>
            <span>${l.qty}</span>
            <button onclick="OdinGoStore.setQty('${l.id}', ${l.qty + 1})">+</button>
          </div>
          <button class="cart-del" onclick="OdinGoStore.remove('${l.id}')" aria-label="Quitar">✕</button>
          ${mp ? `<a class="mp-pay" href="${mp}" target="_blank" rel="noopener">Pagar online</a>` : ""}
        </div>`;
      }).join("");
    }
    const t = $("cart-total");
    if (t) t.textContent = money(total());
    // Precios en botones de la página
    document.querySelectorAll("[data-price-for]").forEach((el) => {
      const p = findProduct(el.getAttribute("data-price-for"));
      if (p) el.textContent = `${money(p.precio)}${p.type === "modulo" ? "" : "/mes"}`;
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

  document.addEventListener("DOMContentLoaded", render);

  return { add, remove, setQty, clear, total, render, setDrawer, checkoutWhatsApp, checkoutEmail, toast };
})();
