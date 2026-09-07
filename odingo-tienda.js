/* =====================================================
   OdinGO TIENDA - Config + Carrito (100% frontend)
   - Sin backend: el carrito vive en memoria + localStorage
   - Checkout: arma el pedido y lo envía por WhatsApp / Email
   - PARA EDITAR PRECIOS: ODINGO_PLANS e informes abajo
   ===================================================== */

const ODINGO_CONFIG = {
  // TODO: reemplazar por tu número real, formato internacional sin "+" ni espacios.
  // Ej Argentina: "5493454123456"
  WHATSAPP_NUMBER: "5490000000000",
  EMAIL_VENTAS: "odintecharg@hotmail.com",
  MONEDA: "$ ARS",
};

// ★★★ EDITA TUS PRECIOS AQUÍ ★★★
// Planes por sistema (1 PC / 1 caja). IDs: "mensual" | "perpetua"
const ODINGO_PLANS = {
  mensual: { id: "mensual", nombre: "Mensual", precio: 29900, per: "/mes", detalle: "Actualizaciones, soporte y backups incluidos" },
  perpetua: { id: "perpetua", nombre: "Licencia perpetua", precio: 490000, per: "pago único", detalle: "Instalación + 12 meses de actualizaciones y soporte" },
};

// Sistemas (el precio lo pone el plan elegido). "informes" tiene precio propio.
const ODINGO_CATALOG = [
  { id: "comercios", tag: "OdinGO · POS EXPRESS", nombre: "Kiosco / Comercios", desc: "POS con escáner, granel, mayorista, combos, caja y cuenta corriente." },
  { id: "gastronomia", tag: "OdinGO · RESTO-ROTI", nombre: "Restaurant / Rotisería", desc: "Mesas, mostrador, delivery, cocina KDS, mixto restaurant+rotisería." },
  { id: "gimnasios", tag: "OdinGO · GIMNASIO", nombre: "Gimnasios y Academias", desc: "Socios, cuotas, clases, ingresos, congelar, recordatorios con botón de WhatsApp." },
  { id: "peluqueria", tag: "OdinGO · TURNERO", nombre: "Peluquerías y Estética", desc: "Agenda por profesional, cobranza mixta, comisiones, caja." },
  { id: "talleres", tag: "OdinGO · TALLERES", nombre: "Talleres Mecánicos", desc: "Órdenes, control de ingreso imprimible, patentes, repuestos." },
  { id: "hotel", tag: "OdinGO · HOTEL", nombre: "Hotel / Hospedaje", desc: "Reservas, recepción por colores, consumos, checkout, POS mostrador." },
  { id: "lavadero", tag: "OdinGO · LAVADEROS", nombre: "Lavaderos & Servicios", desc: "Agenda, playa kanban en vivo, abonos, operarios y comisiones." },
  { id: "informes", tag: "OdinGO · INFORMES", nombre: "OdinGO Informes (mensual)", desc: "Tablero web con ventas e indicadores desde tu celular.", precio: 35000, type: "suscripcion" },
];

const OdinGoStore = (() => {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("odingo_cart") || "[]");
    // Migra líneas viejas (sin plan) al plan mensual
    cart.forEach((l) => {
      const p = findProduct(l.id);
      if (p && !p.precio && !l.plan) l.plan = "mensual";
    });
  } catch { cart = []; }

  const $ = (id) => document.getElementById(id);
  const money = (n) => "$ " + Number(n).toLocaleString("es-AR");

  function save() {
    try { localStorage.setItem("odingo_cart", JSON.stringify(cart)); } catch {}
  }

  function findProduct(id) {
    return ODINGO_CATALOG.find((p) => p.id === id);
  }

  function linePrice(l) {
    if (l.plan && ODINGO_PLANS[l.plan]) return ODINGO_PLANS[l.plan].precio;
    const p = findProduct(l.id);
    return p ? p.precio || 0 : 0;
  }

  function lineLabel(l) {
    if (l.plan && ODINGO_PLANS[l.plan]) {
      const pl = ODINGO_PLANS[l.plan];
      return `${pl.nombre} (${money(pl.precio)} ${pl.per})`;
    }
    return "Suscripción mensual";
  }

  // add("comercios", "mensual") | add("comercios", "perpetua") | add("informes")
  function add(id, plan, openDrawer = true) {
    if (typeof plan === "boolean") { openDrawer = plan; plan = undefined; }
    const prod = findProduct(id);
    if (!prod) return;
    if (!prod.precio && !plan) plan = "mensual";
    const key = prod.precio ? "id" : "id+plan";
    const line = cart.find((l) => key === "id" ? (l.id === id && !l.plan) : (l.id === id && l.plan === plan));
    if (line) line.qty += 1;
    else cart.push(plan ? { id, plan, qty: 1 } : { id, qty: 1 });
    save(); render();
    const pl = plan ? ` (${ODINGO_PLANS[plan].nombre})` : "";
    toast(`✅ ${prod.nombre}${pl} agregado al pedido`);
    if (openDrawer) setDrawer(true);
  }

  function remove(id, plan) {
    cart = cart.filter((l) => !(l.id === id && (l.plan || undefined) === (plan || undefined)));
    save(); render();
  }

  function setQty(id, qty, plan) {
    qty = Math.max(0, parseInt(qty || "0", 10));
    if (qty === 0) return remove(id, plan);
    const line = cart.find((l) => l.id === id && (l.plan || undefined) === (plan || undefined));
    if (line) line.qty = qty;
    save(); render();
  }

  function clear() {
    cart = []; save(); render();
  }

  function total() {
    return cart.reduce((acc, l) => acc + linePrice(l) * l.qty, 0);
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
      return `• ${p.nombre} — ${lineLabel(l)}${l.qty > 1 ? ` x${l.qty}` : ""} — ${money(linePrice(l) * l.qty)}`;
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
    cart = cart.filter((l) => findProduct(l.id) && (findProduct(l.id).precio || ODINGO_PLANS[l.plan]));
    const count = cart.reduce((a, l) => a + l.qty, 0);
    const badge = $("cart-count");
    if (badge) badge.textContent = count;
    const box = $("cart-items");
    if (!box) return;
    if (!cart.length) {
      box.innerHTML = `<p class="cart-empty">Tu pedido está vacío.<br>Elegí un plan para empezar.</p>`;
    } else {
      box.innerHTML = cart.map((l) => {
        const p = findProduct(l.id);
        const qtyCtl = l.plan
          ? `<button class="cart-del" onclick="OdinGoStore.remove('${l.id}','${l.plan}')" aria-label="Quitar">✕</button>`
          : `<div class="cart-qty">
              <button onclick="OdinGoStore.setQty('${l.id}', ${l.qty - 1})">−</button>
              <span>${l.qty}</span>
              <button onclick="OdinGoStore.setQty('${l.id}', ${l.qty + 1})">+</button>
            </div>
            <button class="cart-del" onclick="OdinGoStore.remove('${l.id}')" aria-label="Quitar">✕</button>`;
        return `<div class="cart-line">
          <div><strong>${p.nombre}</strong><small>${lineLabel(l)}</small></div>
          ${qtyCtl}
        </div>`;
      }).join("");
    }
    const t = $("cart-total");
    if (t) t.textContent = money(total());
    // Precio de Informes en su botón
    document.querySelectorAll("[data-price-for]").forEach((el) => {
      const p = findProduct(el.getAttribute("data-price-for"));
      if (p && p.precio) el.textContent = `${money(p.precio)}/mes`;
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
