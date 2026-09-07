/* =====================================================================
   OdinGO POS Express · DEMO pública (réplica visual del sistema real)
   - Todo vive en memoria (+ sessionStorage solo para la clave de 1h).
   - Sin clave: POS + Caja + Productos + Combos con catálogo reducido.
   - Con clave de 1h (la genera el dueño): catálogo completo, descuento,
     item manual, fiado y ventas del turno.
   ===================================================================== */

// Dueño: el secreto también está en gen_clave_demo.py (tu PC, NO se publica).
// La clave dura 30 minutos y los datos completos viajan codificados:
// sin clave válida, el código fuente no muestra el catálogo completo.
const DK_S = atob("b2Rpbmdv" + "LWtpb3Nj" + "by1kZW1vLTlmMms=");
const DK_MAIL = "odintecharg@hotmail.com";
const UNLOCK_MS = 30 * 60 * 1000; // 30 minutos

// ---------- Catálogo BASE (lo que ve todo el mundo) ----------
const BASE_PRODS = [
  { id: 1, nombre: "Coca Cola 1.5L", codigo: "7790895000115", costo: 900, venta: 1200, stock: 48, um: "un", pes: false, may: { min: 6, precio: 1050 } },
  { id: 2, nombre: "Coca Cola 500ml", codigo: "7790895000221", costo: 500, venta: 750, stock: 60, um: "un", pes: false },
  { id: 3, nombre: "Alfajor Jorgito", codigo: "7790589000111", costo: 250, venta: 400, stock: 120, um: "un", pes: false, may: { min: 12, precio: 330 } },
  { id: 4, nombre: "Yerba Mate 500g", codigo: "7790387000555", costo: 1500, venta: 2100, stock: 60, um: "un", pes: false, may: { min: 6, precio: 1900 } },
  { id: 5, nombre: "Azúcar 1kg", codigo: "7790387000444", costo: 800, venta: 1200, stock: 50, um: "un", pes: false, may: { min: 10, precio: 1050 } },
  { id: 6, nombre: "Leche Entera 1L", codigo: "7790387000888", costo: 950, venta: 1300, stock: 60, um: "un", pes: false },
  { id: 7, nombre: "Pan kg", codigo: "7790387001003", costo: 1200, venta: 1800, stock: 40, um: "kg", pes: true },
  { id: 8, nombre: "Queso Cremoso kg", codigo: "7790387001001", costo: 5500, venta: 7500, stock: 15, um: "kg", pes: true },
  { id: 9, nombre: "Papas Fritas 90g", codigo: "7790317000111", costo: 700, venta: 1000, stock: 50, um: "un", pes: false },
  { id: 10, nombre: "Fernet 750ml", codigo: "7790299000111", costo: 5500, venta: 7200, stock: 12, um: "un", pes: false },
  { id: 11, nombre: "Cigarrillos Marlboro", codigo: "7790387001018", costo: 2500, venta: 3000, stock: 100, um: "un", pes: false },
  { id: 12, nombre: "Lavandina 1L", codigo: "7790387001017", costo: 700, venta: 1000, stock: 45, um: "un", pes: false, may: { min: 12, precio: 880 } },
];
const BASE_COMBOS = [
  { id: 1, nombre: "Combo Desayuno", precio: 2500, items: [{ nombre: "Leche Entera 1L", cant: 1 }, { nombre: "Galletitas x1", cant: 1 }] },
];
// ---------- Catálogo FULL (codificado: solo se lee con clave válida) ----------
const FULL_BLOB = "eyJwcm9kcyI6IFt7ImlkIjogMTMsICJub21icmUiOiAiTWFuYW9zIENvbGEgMkwiLCAiY29kaWdvIjogIjc3OTA3MTUwMDAxMTEiLCAiY29zdG8iOiA2MDAsICJ2ZW50YSI6IDkwMCwgInN0b2NrIjogNTAsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZSwgIm1heSI6IHsibWluIjogNiwgInByZWNpbyI6IDgwMH19LCB7ImlkIjogMTQsICJub21icmUiOiAiQ2VydmV6YSBRdWlsbWVzIDFMIiwgImNvZGlnbyI6ICI3NzkwNDk4MDAwMTExIiwgImNvc3RvIjogMTEwMCwgInZlbnRhIjogMTUwMCwgInN0b2NrIjogNDgsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZSwgIm1heSI6IHsibWluIjogNiwgInByZWNpbyI6IDEzNTB9fSwgeyJpZCI6IDE1LCAibm9tYnJlIjogIkNoaWNsZSBCZWxkZW50IiwgImNvZGlnbyI6ICI3NzkwNTgxMDAwMTExIiwgImNvc3RvIjogMTUwLCAidmVudGEiOiAzMDAsICJzdG9jayI6IDIwMCwgInVtIjogInVuIiwgInBlcyI6IGZhbHNlLCAibWF5IjogeyJtaW4iOiAyMCwgInByZWNpbyI6IDI1MH19LCB7ImlkIjogMTYsICJub21icmUiOiAiR2FsbGV0aXRhcyBEdWxjZXMgNDAwZyIsICJjb2RpZ28iOiAiNzc5MDM4NzAwMTAwNSIsICJjb3N0byI6IDgwMCwgInZlbnRhIjogMTIwMCwgInN0b2NrIjogNTUsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZSwgIm1heSI6IHsibWluIjogOCwgInByZWNpbyI6IDEwNTB9fSwgeyJpZCI6IDE3LCAibm9tYnJlIjogIk1hbsOtIGMvY8Ohc2NhcmEgNTAwZyIsICJjb2RpZ28iOiAiMDAwMjEzMTU0NjQiLCAiY29zdG8iOiA5MDAsICJ2ZW50YSI6IDIwMDAsICJzdG9jayI6IDMwLCAidW0iOiAia2ciLCAicGVzIjogdHJ1ZX0sIHsiaWQiOiAxOCwgIm5vbWJyZSI6ICJKYW3Ds24gQ29jaWRvIGtnIiwgImNvZGlnbyI6ICI3NzkwMzg3MDAxMDAyIiwgImNvc3RvIjogNjAwMCwgInZlbnRhIjogODIwMCwgInN0b2NrIjogMTAsICJ1bSI6ICJrZyIsICJwZXMiOiB0cnVlfSwgeyJpZCI6IDE5LCAibm9tYnJlIjogIkdvbWl0YXMgMTAwZyIsICJjb2RpZ28iOiAiNzc5MDM4NzAwMTAyMiIsICJjb3N0byI6IDM1MCwgInZlbnRhIjogNjAwLCAic3RvY2siOiA5MCwgInVtIjogImtnIiwgInBlcyI6IHRydWV9LCB7ImlkIjogMjAsICJub21icmUiOiAiQ2VydmV6YSBCcmFobWEgNDczbWwiLCAiY29kaWdvIjogIjc3OTA0OTgwMDAyMjIiLCAiY29zdG8iOiA2NTAsICJ2ZW50YSI6IDkwMCwgInN0b2NrIjogNzIsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZX0sIHsiaWQiOiAyMSwgIm5vbWJyZSI6ICJWaW5vIFRpbnRvIDc1MG1sIiwgImNvZGlnbyI6ICI3NzkxMjM0NTY3ODkwIiwgImNvc3RvIjogMTgwMCwgInZlbnRhIjogMjUwMCwgInN0b2NrIjogMjQsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZX0sIHsiaWQiOiAyMiwgIm5vbWJyZSI6ICJDaG9jb2xhdGUgQmxvY2sgMTAwZyIsICJjb2RpZ28iOiAiNzc5MDU4ODAwMDExMSIsICJjb3N0byI6IDgwMCwgInZlbnRhIjogMTEwMCwgInN0b2NrIjogNDAsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZX0sIHsiaWQiOiAyMywgIm5vbWJyZSI6ICJQYWxpdG9zIFNhbGFkb3MgMTAwZyIsICJjb2RpZ28iOiAiNzc5MDMxNzAwMDIyMiIsICJjb3N0byI6IDM1MCwgInZlbnRhIjogNTUwLCAic3RvY2siOiA2MCwgInVtIjogInVuIiwgInBlcyI6IGZhbHNlfSwgeyJpZCI6IDI0LCAibm9tYnJlIjogIkNhZsOpIE1vbGlkbyAyNTBnIiwgImNvZGlnbyI6ICI3NzkwMzg3MDAwNjY2IiwgImNvc3RvIjogMjIwMCwgInZlbnRhIjogMjkwMCwgInN0b2NrIjogMjUsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZX0sIHsiaWQiOiAyNSwgIm5vbWJyZSI6ICJNYW50ZWNhIDIwMGciLCAiY29kaWdvIjogIjc3OTAzODcwMDA5OTkiLCAiY29zdG8iOiAxMjAwLCAidmVudGEiOiAxNzAwLCAic3RvY2siOiAyMCwgInVtIjogInVuIiwgInBlcyI6IGZhbHNlfSwgeyJpZCI6IDI2LCAibm9tYnJlIjogIkZhY3R1cmFzIHg2IiwgImNvZGlnbyI6ICI3NzkwMzg3MDAxMDA0IiwgImNvc3RvIjogMTUwMCwgInZlbnRhIjogMjIwMCwgInN0b2NrIjogMjAsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZX0sIHsiaWQiOiAyNywgIm5vbWJyZSI6ICJEdWxjZSBkZSBMZWNoZSA0MDBnIiwgImNvZGlnbyI6ICI3NzkwMzg3MDAxMDA4IiwgImNvc3RvIjogMTQwMCwgInZlbnRhIjogMTkwMCwgInN0b2NrIjogMzAsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZX0sIHsiaWQiOiAyOCwgIm5vbWJyZSI6ICJIdWV2b3MgeDEyIiwgImNvZGlnbyI6ICI3NzkwMzg3MDAxMDEwIiwgImNvc3RvIjogMTgwMCwgInZlbnRhIjogMjUwMCwgInN0b2NrIjogMzAsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZX0sIHsiaWQiOiAyOSwgIm5vbWJyZSI6ICJQYXBlbCBIaWdpw6luaWNvIHg0IiwgImNvZGlnbyI6ICI3NzkwMzg3MDAxMDEzIiwgImNvc3RvIjogMTQwMCwgInZlbnRhIjogMTkwMCwgInN0b2NrIjogMzUsICJ1bSI6ICJ1biIsICJwZXMiOiBmYWxzZSwgIm1heSI6IHsibWluIjogNiwgInByZWNpbyI6IDE3MDB9fSwgeyJpZCI6IDMwLCAibm9tYnJlIjogIkVuY2VuZGVkb3IiLCAiY29kaWdvIjogIjc3OTAzODcwMDEwMjAiLCAiY29zdG8iOiA0MDAsICJ2ZW50YSI6IDcwMCwgInN0b2NrIjogMTIwLCAidW0iOiAidW4iLCAicGVzIjogZmFsc2V9XSwgImNvbWJvcyI6IFt7ImlkIjogMiwgIm5vbWJyZSI6ICJDb21ibyBGZXJuZXQiLCAicHJlY2lvIjogODUwMCwgIml0ZW1zIjogW3sibm9tYnJlIjogIkZlcm5ldCA3NTBtbCIsICJjYW50IjogMX0sIHsibm9tYnJlIjogIkNvY2EgQ29sYSAxLjVMIiwgImNhbnQiOiAxfV19LCB7ImlkIjogMywgIm5vbWJyZSI6ICJDb21ibyBQaWNhZGEiLCAicHJlY2lvIjogNjkwMCwgIml0ZW1zIjogW3sibm9tYnJlIjogIlF1ZXNvIENyZW1vc28ga2ciLCAiY2FudCI6IDAuNX0sIHsibm9tYnJlIjogIlBhcGFzIEZyaXRhcyA5MGciLCAiY2FudCI6IDJ9XX1dLCAiY2xpZW50ZXMiOiBbeyJpZCI6IDEsICJub21icmUiOiAiS2lvc2NvIFBlcGUgKGZpYWRvKSIsICJkZXVkYSI6IDUyMDAsICJsaW1pdGUiOiAyMDAwMH0sIHsiaWQiOiAyLCAibm9tYnJlIjogIk1hcsOtYSBHw7NtZXoiLCAiZGV1ZGEiOiAwLCAibGltaXRlIjogMTAwMDB9XX0=";
function fullData() {
  const bin = atob(FULL_BLOB);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}
const MEDIOS = [
  { id: 1, nombre: "Efectivo", tipo: "efectivo", es_efectivo: true },
  { id: 2, nombre: "Tarjeta", tipo: "tarjeta" },
  { id: 3, nombre: "Transferencia / QR", tipo: "transferencia" },
];
// Menús: base siempre visible, resto con 🔒 hasta ingresar la clave
const NAV_BASE = [["pos", "🛒 Ventas (POS)"], ["caja", "💰 Caja Diaria"]];
const NAV_FULL = [["stock", "📦 Productos"], ["combos", "🎁 Combos"], ["reponer", "📥 Reponer Stock"], ["proveedores", "🚛 Proveedores"], ["devoluciones", "🔄 Devoluciones"], ["ctacte", "🧾 Ctas Ctes"], ["etiquetas", "🏷️ Etiquetas"], ["usuarios", "👤 Usuarios"], ["informes", "📊 Informes"]];
const SEED_PROV = [{ id: 1, nombre: "Coca Cola Andina", contacto: "Ventas" }, { id: 2, nombre: "Arcor Distribuidora", contacto: "Pedro" }];
const SEED_USERS = [{ username: "admin", rol: "admin" }, { username: "caja1", rol: "cajero" }];
// Países (Argentina sugerida primero) y provincias para el pedido de clave
const PAISES = ["Argentina", "Uruguay", "Paraguay", "Chile", "Bolivia", "Brasil", "Perú", "Colombia", "Ecuador", "Venezuela", "México", "España", "Estados Unidos", "Otro"];
const PROVS = [["02", "CABA"], ["06", "Buenos Aires"], ["10", "Catamarca"], ["22", "Chaco"], ["26", "Chubut"], ["14", "Córdoba"], ["18", "Corrientes"], ["30", "Entre Ríos"], ["34", "Formosa"], ["38", "Jujuy"], ["42", "La Pampa"], ["46", "La Rioja"], ["50", "Mendoza"], ["54", "Misiones"], ["58", "Neuquén"], ["62", "Río Negro"], ["66", "Salta"], ["70", "San Juan"], ["74", "San Luis"], ["78", "Santa Cruz"], ["82", "Santa Fe"], ["86", "Santiago del Estero"], ["90", "Tucumán"], ["94", "Tierra del Fuego"]];
const CIUDADES_BASE = {
  "02": ["CABA"], "06": ["La Plata", "Mar del Plata", "Bahía Blanca", "Quilmes", "Lanús", "San Isidro", "Tandil", "Olavarría", "Junín", "Pergamino", "Necochea", "Pinamar"],
  "10": ["San Fernando del Valle de Catamarca", "Belén", "Andalgalá"], "22": ["Resistencia", "Barranqueras", "Sáenz Peña", "Villa Ángela"],
  "26": ["Rawson", "Trelew", "Puerto Madryn", "Comodoro Rivadavia", "Esquel"], "14": ["Córdoba", "Villa María", "Río Cuarto", "San Francisco", "Alta Gracia", "Carlos Paz"],
  "18": ["Corrientes", "Goya", "Paso de los Libres", "Curuzú Cuatiá"], "30": ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "La Paz", "Victoria"],
  "34": ["Formosa", "Clorinda", "Pirané"], "38": ["San Salvador de Jujuy", "Palpalá", "San Pedro", "Libertador Gral. San Martín"],
  "42": ["Santa Rosa", "General Pico"], "46": ["La Rioja", "Chilecito"], "50": ["Mendoza", "San Rafael", "Godoy Cruz", "Maipú", "Luján de Cuyo"],
  "54": ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú"], "58": ["Neuquén", "San Martín de los Andes", "Zapala", "Cutral Có"],
  "62": ["Viedma", "Bariloche", "General Roca", "Cipolletti"], "66": ["Salta", "Orán", "Tartagal", "Cafayate"],
  "70": ["San Juan", "Rawson", "Chimbas", "Caucete"], "74": ["San Luis", "Villa Mercedes", "Merlo"],
  "78": ["Río Gallegos", "Caleta Olivia", "El Calafate"], "82": ["Santa Fe", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista", "Santo Tomé"],
  "86": ["Santiago del Estero", "La Banda", "Termas de Río Hondo"], "90": ["San Miguel de Tucumán", "Yerba Buena", "Concepción", "Tafí Viejo"],
  "94": ["Ushuaia", "Río Grande", "Tolhuin"],
};

const DK = (() => {
  const $ = (id) => document.getElementById(id);
  const red = (n) => Math.round(Number(n || 0) * 100) / 100;
  const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = (s) => String(s ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- Estado en memoria ----------
  let vista = "pos", cajaTab = "turno";
  let productos = JSON.parse(JSON.stringify(BASE_PRODS));
  let combos = JSON.parse(JSON.stringify(BASE_COMBOS));
  let clientes = [];
  let carrito = [], pagos = [], desc = 0, fiadoCli = "";
  let busqueda = "", focoSug = false, filtroProd = "";
  let pagoMedio = "", pagoMonto = "", pagoRef = "";
  let caja = { abierta: false, responsable: "", inicial: 0, ingresos: 0, egresos: 0, ventas: 0, tickets: [] };
  let movimientos = [], ventasHist = [], ultimoTicket = null;
  let proveedores = JSON.parse(JSON.stringify(SEED_PROV));
  let usuarios = JSON.parse(JSON.stringify(SEED_USERS));
  let devoluciones = [], devVenta = "", devItem = "", devCant = "", devMotivo = "";
  let etiqSel = {};
  let unlockUntil = Number(sessionStorage.getItem("kiosco_unlock") || 0);
  let granelSel = null;
  let isMaster = localStorage.getItem("kiosco_master") === "1";
  if (isMaster) {
    try {
      const f0 = fullData();
      productos = JSON.parse(JSON.stringify(BASE_PRODS.concat(f0.prods)));
      combos = JSON.parse(JSON.stringify(BASE_COMBOS.concat(f0.combos)));
      clientes = JSON.parse(JSON.stringify(f0.clientes));
    } catch {}
  }
  const MASTER_HASH = 2213855217; // hash de tu contraseña maestra (no figura en texto plano)

  const unlocked = () => isMaster || Date.now() < unlockUntil;

  // ---------- Clave por slot de 30 min (UTC) ----------
  function djb2(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0; return h; }
  function bucket(d) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${d.getUTCMinutes() < 30 ? "A" : "B"}`;
  }
  function codeFor(d) { return String(djb2(DK_S + bucket(d)) % 1000000).padStart(6, "0"); }
  function checkKey(code) {
    code = String(code || "").trim();
    if (djb2(code) === MASTER_HASH) return "master"; // tu contraseña permanente
    const now = new Date();
    if (code === codeFor(now)) return "ok";
    if (code === codeFor(new Date(now.getTime() - 1800e3))) return "ok"; // gracia 30 min por desfase
    return null;
  }
  function applyUnlock(mode) {
    const f = fullData();
    productos = JSON.parse(JSON.stringify(BASE_PRODS.concat(f.prods)));
    combos = JSON.parse(JSON.stringify(BASE_COMBOS.concat(f.combos)));
    clientes = JSON.parse(JSON.stringify(f.clientes));
    if (mode === "master") {
      isMaster = true;
      localStorage.setItem("kiosco_master", "1");
      sessionStorage.removeItem("kiosco_unlock");
    } else {
      unlockUntil = Date.now() + UNLOCK_MS;
      sessionStorage.setItem("kiosco_unlock", String(unlockUntil));
    }
    render(); tickLock();
    msg(mode === "master" ? "🔓 Demo completa permanente (modo dueño)." : "🔓 Demo completa por 30 minutos. ¡A probar todo!");
  }

  function msg(t, tipo = "ok") {
    const m = $("msg");
    m.innerHTML = t ? `<div class="msg ${tipo === "error" ? "err" : "ok"}">${esc(t)}</div>` : "";
    clearTimeout(m._h);
    if (t) m._h = setTimeout(() => (m.innerHTML = ""), 3500);
  }
  function tickLock() {
    const el = $("lock-state");
    if (!el) return;
    if (isMaster) { el.textContent = "🔓 Completa (dueño)"; return; }
    if (unlocked()) {
      const min = Math.max(1, Math.round((unlockUntil - Date.now()) / 60000));
      el.textContent = `🔓 Completa · quedan ~${min} min`;
    } else {
      el.textContent = "🔒 Demo limitada";
      if (unlockUntil) { // expiró: volver a base
        unlockUntil = 0; sessionStorage.removeItem("kiosco_unlock");
        productos = JSON.parse(JSON.stringify(BASE_PRODS));
        combos = JSON.parse(JSON.stringify(BASE_COMBOS));
        clientes = []; fiadoCli = ""; desc = 0;
        if (NAV_FULL.some(([k]) => k === vista)) vista = "pos";
        render();
      }
    }
  }
  setInterval(tickLock, 30000);

  function theme() {
    const b = document.body;
    if (b.getAttribute("data-theme") === "dark") { b.removeAttribute("data-theme"); localStorage.setItem("kiosco_tema", "claro"); }
    else { b.setAttribute("data-theme", "dark"); localStorage.setItem("kiosco_tema", "oscuro"); }
  }
  if (localStorage.getItem("kiosco_tema") === "oscuro") document.body.setAttribute("data-theme", "dark");

  function go(v) {
    if (NAV_FULL.some(([k]) => k === v) && !unlocked()) { openKey(); return; }
    vista = v; render(); if (v === "pos") setTimeout(() => $("dk-bus")?.focus(), 50);
  }
  function renderNav() {
    const nav = $("mainnav");
    if (!nav) return;
    const btn = ([k, l], lock) => `<button class="navbtn ${vista === k ? "on" : ""}" onclick="DK.go('${k}')">${l}${lock ? " 🔒" : ""}</button>`;
    nav.innerHTML = NAV_BASE.map((b) => btn(b, false)).join("") + NAV_FULL.map((b) => btn(b, !unlocked())).join("") + `<button class="navbtn" onclick="DK.theme()">🌙</button>`;
  }
  function lockBox(titulo, detalle) {
    return `<div class="lockbox"><div class="big">🔒</div><h3>${titulo}</h3>
      <p style="font-size:.9rem;color:var(--muted)">${detalle}</p>
      <p style="font-size:.9rem">Pedí tu <b>clave completa de 30 minutos</b> por mail y probá todo el sistema.</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">
        <button class="minibtn" onclick="DK.openKey()">🔑 Ya tengo clave</button>
        <button class="minibtn" onclick="DK.openKey()">✉️ Pedir clave por mail</button>
      </div></div>`;
  }
  let reqLocs = []; // localidades traídas de la API para el datalist
  function openKey() {
    $("modal").innerHTML = `<div class="modal"><div class="rk-card">
      <div class="rk-head"><h3>Acceso a la demo completa</h3><p>La demo completa de OdinGO POS Express se habilita por 30 minutos con una clave personal.</p></div>
      <div class="rk-sec"><div class="rk-title">YA TENGO UNA CLAVE</div>
        <div class="rk-row"><div class="rk-field"><label>Clave de acceso</label><input id="dk-key" maxlength="12" placeholder="Ingrese su clave"></div></div>
        <div class="rk-actions"><button class="rk-primary" onclick="DK.useKey()">Activar acceso</button><button class="rk-ghost" onclick="DK.closeModal()">Cerrar</button></div>
      </div>
      <div class="rk-sec"><div class="rk-title">SOLICITAR UNA CLAVE</div>
        <div class="rk-row"><div class="rk-field"><label>Nombre <span>*</span></label><input id="rq-nom"></div><div class="rk-field"><label>Apellido <span>*</span></label><input id="rq-ape"></div></div>
        <div class="rk-row"><div class="rk-field"><label>Email <span>*</span></label><input id="rq-mail" type="email"></div><div class="rk-field"><label>Comercio / Negocio</label><input id="rq-com"></div></div>
        <div class="rk-row"><div class="rk-field"><label>Dirección</label><input id="rq-dir"></div><div class="rk-field"><label>País <span>*</span></label><select id="rq-pais" onchange="DK.reqPais()">${PAISES.map((p) => `<option ${p === "Argentina" ? "selected" : ""}>${p}</option>`).join("")}</select></div></div>
        <div id="rq-ar">
          <div class="rk-row"><div class="rk-field"><label>Provincia <span>*</span></label><select id="rq-prov" onchange="DK.reqProv()"><option value="">Seleccionar...</option>${PROVS.map(([id, n]) => `<option value="${id}">${n}</option>`).join("")}</select></div>
          <div class="rk-field"><label>Ciudad / Localidad <span>*</span></label><input id="rq-ciu" list="rq-cius" oninput="DK.reqCiu(this.value)" placeholder="Escriba para buscar"><datalist id="rq-cius"></datalist></div></div>
          <div id="rq-src" class="rk-note" style="text-align:left"></div>
        </div>
        <div id="rq-ext" style="display:none">
          <div class="rk-row"><div class="rk-field"><label>Provincia / Región <span>*</span></label><input id="rq-reg"></div><div class="rk-field"><label>Ciudad <span>*</span></label><input id="rq-cix"></div></div>
        </div>
        <div class="rk-actions"><button class="rk-primary" onclick="DK.reqSend()">Enviar solicitud</button></div>
        <div class="rk-note">Responderemos a su email con la clave de acceso. Los campos marcados con <span style="color:#dc2626">*</span> son obligatorios.</div>
      </div>
    </div></div>`;
    reqLocs = [];
  }
  function closeModal() { $("modal").innerHTML = ""; }
  function useKey() {
    const mode = checkKey($("dk-key")?.value);
    if (mode) { closeModal(); applyUnlock(mode); }
    else msg("Clave incorrecta o vencida. Pedí una nueva por mail.", "error");
  }
  function reqPais() {
    const ar = $("rq-pais")?.value === "Argentina";
    if ($("rq-ar")) $("rq-ar").style.display = ar ? "" : "none";
    if ($("rq-ext")) $("rq-ext").style.display = ar ? "none" : "";
  }
  async function reqProv() {
    const id = $("rq-prov")?.value || "";
    const dl = $("rq-cius"), src = $("rq-src");
    const base = CIUDADES_BASE[id] || [];
    reqLocs = [...base];
    if (dl) dl.innerHTML = base.map((c) => `<option value="${c}">`).join("");
    if (src) src.textContent = base.length ? `${base.length} sugerencias cargadas. Escribí para buscar en todo el país ⏳` : "";
    if (!id) return;
    try {
      const r = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${id}&campos=nombre&max=300`);
      const j = await r.json();
      const api = [...new Set((j.localidades || []).map((l) => l.nombre))].filter((n) => !reqLocs.includes(n));
      reqLocs = [...reqLocs, ...api];
      if (dl) dl.innerHTML = reqLocs.map((c) => `<option value="${c}">`).join("");
      if (src) src.textContent = `${reqLocs.length} localidades disponibles ✅`;
    } catch { if (src) src.textContent = `${base.length} sugerencias (sin conexión para buscar más)`; }
  }
  let reqT = null;
  async function reqCiu(v) {
    const id = $("rq-prov")?.value || "";
    if (!id || v.trim().length < 3) return;
    clearTimeout(reqT);
    reqT = setTimeout(async () => {
      try {
        const r = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${id}&nombre=${encodeURIComponent(v.trim())}&campos=nombre&max=20`);
        const j = await r.json();
        const api = [...new Set((j.localidades || []).map((l) => l.nombre))];
        const all = [...new Set([...api, ...reqLocs])];
        const dl = $("rq-cius");
        if (dl) dl.innerHTML = all.slice(0, 60).map((c) => `<option value="${c}">`).join("");
      } catch {}
    }, 400);
  }
  function reqSend() {
    const g = (id) => ($(id)?.value || "").trim();
    const pais = $("rq-pais")?.value || "Argentina";
    const ar = pais === "Argentina";
    const d = { nom: g("rq-nom"), ape: g("rq-ape"), mail: g("rq-mail"), com: g("rq-com"), dir: g("rq-dir"), pais, prov: ar ? (PROVS.find(([id]) => id === $("rq-prov")?.value)?.[1] || "") : g("rq-reg"), ciu: ar ? g("rq-ciu") : g("rq-cix") };
    if (!d.nom || !d.ape) return msg("Faltan nombre y apellido", "error");
    if (!/.+@.+\..+/.test(d.mail)) return msg("Revisá el email", "error");
    if (!d.prov || !d.ciu) return msg("Faltan provincia y ciudad", "error");
    const body = `PEDIDO DE CLAVE · Demo completa OdinGO Kiosco (30 min)\n\nNombre: ${d.nom}\nApellido: ${d.ape}\nEmail: ${d.mail}\nComercio: ${d.com || "-"}\nDirección: ${d.dir || "-"}\nPaís: ${d.pais}\nProvincia: ${d.prov}\nCiudad: ${d.ciu}`;
    window.location.href = `mailto:${DK_MAIL}?subject=${encodeURIComponent("Pedido de clave demo · OdinGO Kiosco")}&body=${encodeURIComponent(body)}`;
    closeModal();
    msg("Se abrió tu mail con el pedido. ¡Te respondemos con la clave! ✉️");
  }

  // ---------- POS ----------
  const precioU = (p, cant) => (p.may && cant >= p.may.min ? p.may.precio : p.venta);
  function filtrados() {
    const q = busqueda.trim().toLowerCase();
    const base = !q ? [...productos] : productos.filter((p) => p.nombre.toLowerCase().includes(q) || (p.codigo || "").includes(q) || String(p.id) === q);
    const con = [], sin = [];
    base.forEach((p) => ((Number(p.stock || 0) <= 0 && !p.pes) ? sin : con).push(p));
    return [...con, ...sin];
  }
  function pick(p) {
    if (!caja.abierta) return msg("Abrí la CAJA antes de cargar productos", "error");
    if (Number(p.stock || 0) <= 0 && !p.pes) return msg("Sin stock: " + p.nombre, "error");
    if (p.pes) { granelSel = p; modalPeso(); return; }
    addCart(p, 1);
  }
  function addCart(p, cant) {
    if (cant <= 0) return;
    const ex = carrito.find((i) => i.pid === p.id);
    const nc = (ex ? ex.cant : 0) + cant;
    if (!p.pes && nc > Number(p.stock || 0)) return msg(`Stock insuficiente: ${p.nombre} (disp. ${p.stock})`, "error");
    const pu = precioU(p, nc);
    if (ex) Object.assign(ex, { cant: nc, pu, sub: red(nc * pu) });
    else carrito.push({ pid: p.id, nombre: p.nombre, cant, pu: precioU(p, cant), sub: red(cant * precioU(p, cant)), um: p.um, pes: p.pes, may: !!(p.may && cant >= p.may.min) });
    busqueda = ""; render(); setTimeout(() => $("dk-bus")?.focus(), 30);
  }
  function chCant(pid, v) {
    const it = carrito.find((i) => i.pid === pid);
    if (!it) return;
    const c = Number(v);
    if (isNaN(c) || c < 0) return;
    if (c === 0) { carrito = carrito.filter((i) => i.pid !== pid); render(); return; }
    const p = productos.find((x) => x.id === pid);
    if (p && !it.pes && c > Number(p.stock || 0)) return msg("Máximo disponible: " + p.stock, "error");
    const pu = p ? precioU(p, c) : it.pu;
    Object.assign(it, { cant: c, pu, sub: red(c * pu), may: !!(p?.may && c >= p.may.min) });
    render();
  }
  const subtotal = () => red(carrito.reduce((a, i) => a + Number(i.sub || 0), 0));
  const total = () => Math.max(0, red(subtotal() - Number(desc || 0)));
  const totPagos = () => red(pagos.reduce((a, p) => a + Number(p.monto || 0), 0));
  function addPago() {
    pagoMedio = $("dk-pm")?.value || ""; pagoMonto = $("dk-pmo")?.value || ""; pagoRef = "";
    const m = MEDIOS.find((x) => String(x.id) === String(pagoMedio));
    const mo = parseFloat(pagoMonto);
    if (!m || !mo || mo <= 0) return msg("Elegí medio y monto", "error");
    pagos.push({ medio: m.nombre, monto: mo, ef: !!m.es_efectivo });
    pagoMonto = ""; pagoRef = ""; render();
  }
  function cobrar() {
    if (!carrito.length) return msg("Carrito vacío", "error");
    if (fiadoCli) return cobrarFiado();
    if (totPagos() < total()) return msg(`Faltan ${fmt(total() - totPagos())}`, "error");
    const t = total(), pg = totPagos(), vu = red(pg - t);
    const det = carrito.map((c) => `${c.nombre} x${c.cant}`).join(", ");
    carrito.forEach((c) => {
      const p = productos.find((x) => x.id === c.pid);
      if (p && !c.combo) p.stock = red(Number(p.stock) - Number(c.cant));
      if (c.combo) (c.comboItems || []).forEach((ci) => {
        const pp = productos.find((x) => x.id === ci.pid);
        if (pp) pp.stock = red(Number(pp.stock) - Number(ci.cant) * Number(c.cant));
      });
    });
    const ef = red(pagos.filter((p) => p.ef).reduce((a, p) => a + Number(p.monto), 0));
    caja.ingresos = red(caja.ingresos + t); caja.ventas += 1;
    caja.digital = red((caja.digital || 0) + red(pg - ef));
    const id = 1000 + caja.ventas;
    ventasHist.unshift({ id, det, total: t, fecha: new Date().toLocaleString(), medios: pagos.map((p) => p.medio).join("+") || "Efectivo", items: carrito.map((c) => ({ nombre: c.nombre, cant: c.cant, sub: c.sub })) });
    ultimoTicket = { id, fecha: new Date().toLocaleString(), det: [...carrito], total: t, pagado: pg, vuelto: vu > 0 ? vu : 0 };
    carrito = []; pagos = []; desc = 0; pagoMonto = "";
    render(); showTicket();
  }
  function cobrarFiado() {
    const cli = clientes.find((c) => String(c.id) === String(fiadoCli));
    if (!cli) return msg("Elegí el cliente", "error");
    const t = total();
    cli.deuda = red(Number(cli.deuda) + t);
    const id = 1000 + (++caja.ventas);
    ventasHist.unshift({ id, det: carrito.map((c) => `${c.nombre} x${c.cant}`).join(", ") + ` (fiado ${cli.nombre})`, total: t, fecha: new Date().toLocaleString(), medios: "Fiado", items: carrito.map((c) => ({ nombre: c.nombre, cant: c.cant, sub: c.sub })) });
    ultimoTicket = { id, fecha: new Date().toLocaleString(), det: [...carrito], total: t, pagado: 0, vuelto: 0, fiado: cli.nombre };
    carrito = []; fiadoCli = ""; desc = 0;
    render(); showTicket();
  }
  function printTicket() {
    if (!ultimoTicket) return;
    $("ticket-impresion").innerHTML = `<div style="text-align:center"><b>Mi Kiosco Demo</b><br>OdinGO POS Express<br>Ticket #${ultimoTicket.id} · ${ultimoTicket.fecha}<hr>${ultimoTicket.det.map((d) => `${d.cant} x ${esc(d.nombre)} .... ${fmt(d.sub)}`).join("<br>")}<hr><b>TOTAL: ${fmt(ultimoTicket.total)}</b><br>Pagado: ${fmt(ultimoTicket.pagado)} · Vuelto: ${fmt(ultimoTicket.vuelto)}${ultimoTicket.fiado ? `<br>Fiado a: ${esc(ultimoTicket.fiado)}` : ""}<br><br>¡Gracias por su compra!</div>`;
  }
  function showTicket() {
    if (!ultimoTicket) return;
    printTicket();
    const t = ultimoTicket;
    $("modal").innerHTML = `<div class="modal"><div class="box" style="text-align:left;font-family:'Courier New',monospace">
      <div style="text-align:center"><b style="font-size:1.1rem">Mi Kiosco Demo</b><br><span style="font-size:.8rem">OdinGO POS Express</span><br><span style="font-size:.8rem">Ticket #${t.id} · ${t.fecha}</span></div>
      <hr><div style="font-size:.9rem">${t.det.map((d) => `<div style="display:flex;justify-content:space-between"><span>${d.cant} x ${esc(d.nombre)}</span><b>${fmt(d.sub)}</b></div>`).join("")}</div><hr>
      <div style="display:flex;justify-content:space-between;font-size:1.2rem"><span><b>TOTAL</b></span><b>${fmt(t.total)}</b></div>
      <div style="font-size:.85rem">Pagado: ${fmt(t.pagado)} · Vuelto: <b style="color:#16a34a">${fmt(t.vuelto)}</b>${t.fiado ? `<br>Fiado a: <b>${esc(t.fiado)}</b>` : ""}</div>
      <p style="text-align:center;font-size:.85rem">¡Gracias por su compra!</p>
      <div style="display:flex;gap:8px;font-family:system-ui"><button class="bigbtn" style="flex:1" onclick="DK.doPrint()">🖨 Imprimir</button>
      <button class="minibtn" onclick="DK.closeModal()">Cerrar</button></div></div></div>`;
  }
  function doPrint() { printTicket(); document.body.dataset.print = ""; window.print(); }
  function addCombo(id) {
    if (!caja.abierta) return msg("Abrí la CAJA antes", "error");
    const c = combos.find((x) => x.id === id);
    if (!c) return;
    carrito.push({ pid: `combo-${c.id}-${Date.now()}`, nombre: `🎁 ${c.nombre}`, cant: 1, pu: c.precio, sub: c.precio, um: "combo", combo: true, comboItems: (c.items || []).map((i) => ({ pid: (productos.find((p) => p.nombre === i.nombre) || {}).id, cant: i.cant })) });
    render();
  }
  function modalPeso() {
    $("modal").innerHTML = `<div class="modal"><div class="box"><h3>${esc(granelSel.nombre)}</h3>
      <p style="font-size:.85rem;color:var(--muted)">Producto pesable: ingresá el peso en ${granelSel.um}</p>
      <input id="dk-peso" type="number" step="0.001" min="0" placeholder="0.000">
      <div style="display:flex;gap:8px"><button class="bigbtn" onclick="DK.okPeso()">Agregar</button>
      <button class="minibtn" onclick="DK.closeModal()">Cancelar</button></div></div></div>`;
    setTimeout(() => $("dk-peso")?.focus(), 50);
  }
  function okPeso() {
    const k = parseFloat($("dk-peso")?.value);
    if (!k || k <= 0) return msg("Ingresá un peso válido", "error");
    const p = granelSel; granelSel = null; closeModal(); addCart(p, k);
  }
  function addManual() {
    const n = ($("dk-man-n")?.value || "").trim(), pr = parseFloat($("dk-man-p")?.value), ca = parseFloat($("dk-man-c")?.value);
    if (!n || !pr || pr <= 0 || !ca || ca <= 0) return msg("Manual: nombre, precio y cantidad", "error");
    carrito.push({ pid: `man-${Date.now()}`, nombre: n, cant: ca, pu: pr, sub: red(ca * pr), um: "un" });
    render();
  }

  // ---------- Vistas ----------
  function vPOS() {
    if (!caja.abierta) return `<div style="padding:40px;text-align:center"><div style="background:#fef2f2;border:2px solid #fecaca;border-radius:10px;padding:30px;max-width:500px;margin:40px auto">
      <h2 style="color:#991b1b">CAJA cerrada</h2><p>No podés cargar productos hasta abrir la CAJA del turno.</p>
      <button onclick="DK.go('caja')" style="padding:12px 24px;background:#16a34a;color:#fff;border:none;borderRadius:6px;border-radius:6px;font-weight:bold;cursor:pointer">Ir a abrir CAJA</button></div></div>`;
    const fl = filtrados(), sug = fl.slice(0, 6);
    const st = subtotal(), tt = total(), tp = totPagos(), vu = red(tp - tt);
    const ok = carrito.length > 0 && (fiadoCli ? true : tp >= tt);
    return `<div class="pos">
      <div class="panel">
        <div class="searchrow"><input id="dk-bus" placeholder="Escaneá código, ID o nombre... (F2 buscar, Enter agrega)" value="${esc(busqueda)}" oninput="DK.bus(this.value)" onkeydown="DK.keyBus(event)" onfocus="DK.foco(1)" onblur="DK.foco(0)">
        ${busqueda ? `<button class="minibtn" onclick="DK.bus('')">✕</button>` : ""}</div>
        ${focoSug && busqueda.trim() && sug.length ? `<div class="sug">${sug.map((p) => `<div onmousedown="DK.pick(${p.id})"><span><b>${esc(p.nombre)}</b> <span style="color:var(--muted);font-size:.8rem">${esc(p.codigo || "#" + p.id)} · stock ${p.stock}</span></span><b style="color:#16a34a">${fmt(p.venta)}</b></div>`).join("")}</div>` : ""}
        <div class="consult"><span>🔎 Precio:</span><input id="dk-cons" placeholder="Código + Enter" onkeydown="if(event.key==='Enter')DK.cons()" style="padding:4px 8px;width:130px"><button class="minibtn" onclick="DK.cons()">Ver</button><span id="dk-cons-r" style="color:#16a34a;font-weight:bold"></span></div>
        <div class="hintline">${fl.length} productos · Enter agrega · Ctrl+Enter cobra · F2 busca ${unlocked() ? "" : "· 🔒 catálogo parcial"}</div>
        <div class="gridprods">${fl.map((p) => {
          const sin = Number(p.stock || 0) <= 0 && !p.pes;
          return `<button class="prod ${sin ? "nostock" : ""}" onclick="${sin ? "" : `DK.pick(${p.id})`}">
            <div class="pn">${esc(p.nombre)}</div><div class="pd">${esc(p.codigo || "#" + p.id)} · S:${p.stock} ${p.um}</div>
            <div class="pp">${fmt(p.venta)} <span style="font-size:.7rem;color:var(--muted)">/${p.um}</span></div>
            <div class="tags">${p.pes ? `<span class="bdg" style="background:#e0f2fe;color:#0369a1">Pide peso (${p.um})</span>` : ""}${p.may ? `<span class="bdg" style="background:#fef9c3;color:#854d0e">May ${fmt(p.may.precio)}x${p.may.min}</span>` : ""}${sin ? `<span class="bdg" style="background:#fee2e2;color:#991b1b">Sin stock</span>` : ""}</div></button>`;
        }).join("")}
        ${combos.map((c) => `<button class="prod combo" onclick="DK.addCombo(${c.id})"><div class="pn">🎁 ${esc(c.nombre)}</div><div class="pd">${c.items.map((i) => `${i.cant}x ${esc(i.nombre)}`).join(" + ")}</div><div class="pp" style="color:#b45309">${fmt(c.precio)} <span style="font-size:.7rem">/combo</span></div><div class="tags"><span class="bdg" style="background:#fef3c7;color:#92400e">Combo</span></div></button>`).join("")}</div>
      </div>
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Detalle (${carrito.length} · ${red(carrito.reduce((a, i) => a + Number(i.cant || 0), 0))} un.)</h3>
        <div style="display:flex;gap:4px">${unlocked() ? `<button class="minibtn" onclick="DK.tglMan()">＋ Manual</button>` : ""}${carrito.length ? `<button class="minibtn" style="color:#dc2626" onclick="DK.vaciar()">Vaciar 🗑</button>` : ""}</div></div>
        <div id="dk-man" style="display:none;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px;margin-top:6px">
          <b style="font-size:.8rem">Item manual:</b><div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
          <input id="dk-man-n" class="inp" placeholder="Nombre" style="flex:2;min-width:110px"><input id="dk-man-p" class="inp" type="number" placeholder="$" style="width:85px"><input id="dk-man-c" class="inp" type="number" value="1" style="width:65px">
          <button class="minibtn" onclick="DK.addManual()">Agregar</button></div></div>
        <div class="ticket">${carrito.length === 0 ? `<div style="color:var(--placeholder);text-align:center;margin-top:40px">Carrito vacío<br>Escaneá o tocá un producto</div>` :
          `<table class="t"><thead><tr><th>Cant</th><th>Item</th><th>P.Unit</th><th>Subt</th><th></th></tr></thead><tbody>
          ${carrito.map((it) => `<tr><td><div style="display:flex;align-items:center;gap:4px">
            ${!it.pes ? `<button class="qtybtn" onclick="DK.chCant('${it.pid}',${Number(it.cant) - 1})">−</button>` : ""}
            <input type="number" value="${it.cant}" onchange="DK.chCant('${it.pid}',this.value)" style="width:55px;padding:4px;text-align:center">
            ${!it.pes ? `<button class="qtybtn" onclick="DK.chCant('${it.pid}',${Number(it.cant) + 1})">+</button>` : ""}
            <span style="font-size:.7rem;color:var(--muted)">${it.um}</span></div></td>
            <td>${esc(it.nombre)}${it.may ? ` <span class="bdg" style="background:#fef9c3;color:#854d0e">MAY</span>` : ""}</td>
            <td>${fmt(it.pu)}</td><td><b>${fmt(it.sub)}</b></td>
            <td><button onclick="DK.chCant('${it.pid}',0)" style="border:none;background:none;cursor:pointer;color:#dc2626;font-size:1rem">✕</button></td></tr>`).join("")}
          </tbody></table>`}</div>
        <div class="totalbox">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;align-items:center"><span>Subtotal: ${fmt(st)}</span>
          <div>Desc. ($): <input class="inp" type="number" min="0" value="${desc}" ${unlocked() ? `onchange="DK.desc(this.value)"` : "disabled title='🔒 Disponible con clave completa'"} style="width:70px;margin-left:5px;padding:4px"></div></div>
          <h2 style="margin:5px 0">TOTAL: ${fmt(tt)}</h2>
          ${unlocked() ? `<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><label style="font-size:.8rem;font-weight:bold">🧾 Fiado a:</label>
            <select class="inp" onchange="DK.fiado(this.value)" style="flex:1"><option value="">Contado (normal)...</option>${clientes.map((c) => `<option value="${c.id}" ${String(fiadoCli) === String(c.id) ? "selected" : ""}>${esc(c.nombre)} (debe ${fmt(c.deuda)})</option>`).join("")}</select></div>` : ""}
          ${!fiadoCli ? `<div style="background:var(--surface2);border:1px solid var(--border-soft);border-radius:6px;padding:8px;margin-top:8px">
            <b style="font-size:.8rem">Pagos:</b><div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">
            <select class="inp" id="dk-pm" style="flex:1;min-width:140px"><option value="">Medio...</option>${MEDIOS.map((m) => `<option value="${m.id}">${m.nombre}</option>`).join("")}</select>
            <input class="inp" id="dk-pmo" type="number" placeholder="$" style="width:100px"><button class="minibtn" onclick="DK.addPago()">+ Agregar</button></div>
            ${pagos.map((p, i) => `<div style="display:flex;justify-content:space-between;background:var(--surface);border:1px solid var(--border-soft);border-radius:4px;padding:4px 8px;margin-top:4px;font-size:.85rem"><span><b>${esc(p.medio)}</b> ${fmt(p.monto)}</span><button onclick="DK.delPago(${i})" style="border:none;background:none;color:#dc2626;cursor:pointer">✕</button></div>`).join("")}
            <div style="display:flex;gap:5px;margin-top:6px"><button class="minibtn" onclick="DK.exacto()">Efectivo exacto</button><button class="minibtn" onclick="DK.limpiarPagos()">Limpiar</button></div></div>` : ""}
          <h3 style="color:${fiadoCli ? "#3730a3" : vu >= 0 ? "#16a34a" : "#dc2626"};margin:8px 0">${fiadoCli ? "Fiado: " + fmt(tt) : vu >= 0 ? "Vuelto: " + fmt(vu) : "Falta: " + fmt(Math.abs(vu))}</h3>
          <button class="bigbtn" ${ok ? "" : "disabled"} onclick="DK.cobrar()">CONFIRMAR VENTA (Ctrl+Enter)</button>
          ${ultimoTicket ? `<button class="minibtn" style="width:100%;margin-top:6px;padding:8px" onclick="DK.reimp()">🖨 Reimprimir último ticket (#${ultimoTicket.id})</button>` : ""}
        </div>
      </div>
    </div>`;
  }

  function vCaja() {
    const tabs = [["turno", "Turno actual"], ["movs", "Sesiones y movimientos"], ["ventas", "Ventas del turno"]];
    let inner = `<div style="display:flex;gap:6px;margin-bottom:15px">${tabs.map(([t, l]) => `<button class="minibtn" style="${cajaTab === t ? "background:#0f172a;color:#fff;font-weight:bold" : ""}" onclick="DK.ctab('${t}')">${l}${t !== "turno" && !unlocked() ? " 🔒" : ""}</button>`).join("")}</div>`;
    if (cajaTab === "ventas") {
      inner += unlocked() ? `<div class="card"><b>Ventas del turno (${ventasHist.length})</b>
        ${ventasHist.map((v) => `<div style="font-size:.85rem;border-bottom:1px solid var(--bg);padding:6px 0;display:flex;justify-content:space-between"><span>#${v.id} · ${esc(v.det)} <span style="color:var(--muted)">· ${esc(v.medios)}</span></span><b>${fmt(v.total)}</b></div>`).join("") || "<p style='color:var(--muted)'>Sin ventas todavía. Andá al POS 👆</p>"}</div>`
        : lockBox("Ventas del turno 🔒", "El historial de ventas con detalle solo se muestra con la demo completa.");
    } else if (cajaTab === "movs") {
      inner += unlocked() ? `<div class="card"><b>Movimientos del turno (${movimientos.length})</b>
        ${movimientos.map((m) => `<div style="font-size:.85rem;border-bottom:1px solid var(--bg);padding:6px 0;display:flex;justify-content:space-between"><span>${m.tipo === "egreso" ? "🔴" : "🟢"} ${esc(m.desc)}</span><b style="color:${m.tipo === "egreso" ? "#dc2626" : "#16a34a"}">${m.tipo === "egreso" ? "−" : "+"}${fmt(m.monto)}</b></div>`).join("") || "<p style='color:var(--muted)'>Sin movimientos.</p>"}</div>`
        : lockBox("Movimientos 🔒", "Los movimientos e ingresos/egresos se muestran con la demo completa.");
    } else {
      const esp = red(caja.inicial + caja.ingresos - caja.egresos);
      inner += !caja.abierta ? `<div style="display:flex;gap:10px;background:var(--surface);padding:15px;border-radius:8px;margin-bottom:20px;align-items:center;flex-wrap:wrap">
        <b>Apertura de turno:</b><input id="dk-ap-n" class="inp" placeholder="Quién abre (nombre) *"><input id="dk-ap-m" class="inp" type="number" placeholder="Plata inicial ($)">
        <button onclick="DK.abrir()" style="padding:10px 20px;background:#16a34a;color:#fff;border:none;border-radius:4px;font-weight:bold">Abrir CAJA y empezar a vender</button></div>`
        : `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:15px">
          <div class="card" style="border-top:4px solid #16a34a;text-align:left"><b>💵 EFECTIVO (CAJA)</b>
            <div style="font-size:.85rem;margin-top:6px">Inicial: <b>${fmt(caja.inicial)}</b></div>
            <div style="font-size:.85rem">Ventas: <b>${fmt(caja.ingresos)}</b> (${caja.ventas} tickets)</div>
            <div style="font-size:.85rem">Egresos: <b style="color:#dc2626">−${fmt(caja.egresos)}</b></div>
            <div style="margin-top:8px;background:#f0fdf4;padding:8px;border-radius:6px">Esperado: <b style="font-size:1.2rem">${fmt(esp)}</b></div></div>
          <div class="card" style="border-top:4px solid #2563eb;text-align:left"><b>💳 DIGITALES</b>
            <div style="font-size:.8rem;color:var(--muted);margin-top:6px">Tarjeta + Transferencia del turno</div>
            <div style="font-size:.85rem;margin-top:6px">Total digital: <b>${fmt(caja.digital || 0)}</b></div></div>
          <div class="card" style="border-top:4px solid #f59e0b;text-align:left"><b>🧾 RESUMEN</b>
            <div style="font-size:.85rem;margin-top:6px">Tickets: <b>${caja.ventas}</b> · Abrió: <b>${esc(caja.responsable)}</b></div></div></div>
        <div style="display:flex;gap:10px;background:#fefce8;padding:15px;border-radius:8px;margin-bottom:20px;align-items:center;border:1px solid #fde68a;flex-wrap:wrap">
          <b>Cierre: contá la plata física</b><input id="dk-ci-n" class="inp" placeholder="Quién cierra *"><input id="dk-ci-m" class="inp" type="number" placeholder="Monto contado ($)"><button onclick="DK.cerrar(${esp})" style="padding:10px 20px;background:#dc2626;color:#fff;border:none;border-radius:4px;font-weight:bold">Cerrar CAJA</button></div>`;
      inner += unlocked() ? `<h4>Egresos / Ingresos ${caja.abierta ? "" : "(abrí CAJA para usar)"}</h4>
        <div style="display:flex;gap:10px;background:var(--surface);padding:15px;border-radius:8px;flex-wrap:wrap">
        <select id="dk-mv-t" class="inp"><option value="ingreso">Ingreso Manual</option><option value="egreso">Egreso</option></select>
        <input id="dk-mv-m" class="inp" type="number" placeholder="Monto"><input id="dk-mv-d" class="inp" placeholder="Motivo *" style="flex:1;min-width:180px">
        <button onclick="DK.mov()" ${caja.abierta ? "" : "disabled"} style="padding:10px 20px;background:${caja.abierta ? "#2563eb" : "var(--placeholder)"};color:#fff;border:none;border-radius:4px;font-weight:bold">Registrar</button></div>`
        : `<p class="muted" style="margin-top:12px">🔒 Los ingresos/egresos manuales se habilitan con la demo completa.</p>`;
    }
    return `<div class="view"><h3>CAJA Diaria — ${caja.abierta ? "ABIERTA 🟢" : "CERRADA 🔴"}</h3>${inner}</div>`;
  }

  function vStock() {
    const q = filtroProd.toLowerCase();
    const list = productos.filter((p) => !q || p.nombre.toLowerCase().includes(q) || (p.codigo || "").includes(q));
    return `<div class="view"><h3>📦 Productos ${unlocked() ? "" : "🔒 parcial"}</h3>
      <div class="formgrid">
        <input id="dk-p-n" class="inp" placeholder="Nombre *"><input id="dk-p-c" class="inp" placeholder="Código barras">
        <input id="dk-p-cc" class="inp" type="number" placeholder="Precio costo"><input id="dk-p-pv" class="inp" type="number" placeholder="Precio venta *">
        <input id="dk-p-st" class="inp" type="number" placeholder="Stock"><select id="dk-p-um" class="inp"><option value="un">Unidad (un)</option><option value="kg">Kilos (kg)</option><option value="lt">Litros (lt)</option></select>
        <label style="grid-column:span 2;font-size:.85rem"><input type="checkbox" id="dk-p-pes"> Es pesable / granel (pide peso en POS)</label>
        <div style="grid-column:span 2"><button onclick="DK.saveProd()" style="width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:4px;font-weight:bold">Guardar</button></div>
      </div>
      <input class="inp" placeholder="Filtrar productos..." value="${esc(filtroProd)}" oninput="DK.filtro(this.value)" style="width:300px;margin-bottom:10px">
      <table class="list"><thead><tr><th>ID</th><th>Nombre</th><th>Código</th><th>Venta</th><th>Stock</th><th></th></tr></thead><tbody>
      ${list.map((p) => `<tr><td>${p.id}</td><td><b>${esc(p.nombre)}</b> <span style="font-size:.7rem;color:var(--muted)">${p.um}</span></td><td>${esc(p.codigo || "—")}</td>
        <td style="color:#16a34a;font-weight:bold">${fmt(p.venta)}</td>
        <td style="font-weight:bold;color:${Number(p.stock) <= 0 ? "#dc2626" : "#166534"}">${p.stock}</td>
        <td><button class="minibtn" onclick="DK.reponer(${p.id})" title="Sumar stock">📥 +10</button> <button class="delbtn" onclick="DK.delProd(${p.id})">Borrar</button></td></tr>`).join("")}
      </tbody></table>
      ${unlocked() ? "" : `<p style="font-size:.8rem;color:var(--muted);margin-top:8px">🔒 Con la clave completa ves los 30 productos del kiosco real + vencimientos, mayorista e importación Excel.</p>`}</div>`;
  }

  let comboDraft = [{ pid: "", cant: "1" }];
  function vCombos() {
    return `<div class="view" style="max-width:900px"><h3>🎁 Combos (ej: Fernet + Coca a precio fijo, descuenta stock)</h3>
      <div class="card" style="margin-bottom:15px"><b>Nuevo combo</b>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="dk-c-n" class="inp" placeholder="Nombre ej: Fernet + Coca" style="flex:2;min-width:160px"><input id="dk-c-p" class="inp" type="number" placeholder="Precio combo $" style="flex:1;min-width:100px"></div>
        <div id="dk-c-items" style="margin-top:8px">${comboDraft.map((it, idx) => `
          <div style="display:flex;gap:6px;margin-top:6px">
            <select class="inp" data-ci="${idx}" style="flex:1">
              <option value="">Producto...</option>${productos.map((p) => `<option value="${p.id}" ${String(it.pid) === String(p.id) ? "selected" : ""}>${esc(p.nombre)} (S:${p.stock})</option>`).join("")}
            </select>
            <input class="inp" data-cc="${idx}" type="number" min="0" step="0.001" value="${esc(it.cant)}" style="width:80px">
            <button class="minibtn" onclick="DK.comboDelRow(${idx})">✕</button>
          </div>`).join("")}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="minibtn" onclick="DK.comboAddRow()">+ Producto</button>
          <button onclick="DK.saveCombo()" style="flex:1;padding:10px;background:#f59e0b;color:#fff;border:none;border-radius:4px;font-weight:bold;min-width:160px">Guardar combo</button>
        </div></div>
      <div class="card"><b>Listado (${combos.length})</b>
      ${combos.map((c) => `<div style="border:1px solid var(--border-soft);border-radius:6px;padding:8px;margin-top:8px">
        <div style="display:flex;justify-content:space-between"><b>${esc(c.nombre)}</b><b>${fmt(c.precio)}</b></div>
        <div style="font-size:.8rem;color:var(--muted)">${c.items.map((i) => `${i.cant}x ${esc(i.nombre)}`).join(" + ")}</div>
        <div style="margin-top:6px"><button class="minibtn" onclick='DK.addCombo(${c.id});DK.go("pos")'>Al POS 🛒</button></div></div>`).join("")}</div></div>`;
  }
  function comboAddRow() {
    document.querySelectorAll("#dk-c-items select").forEach((s) => { comboDraft[Number(s.dataset.ci)].pid = s.value; });
    document.querySelectorAll("#dk-c-items input").forEach((i) => { comboDraft[Number(i.dataset.cc)].cant = i.value; });
    comboDraft.push({ pid: "", cant: "1" }); render();
  }
  function comboDelRow(idx) {
    document.querySelectorAll("#dk-c-items select").forEach((s) => { comboDraft[Number(s.dataset.ci)].pid = s.value; });
    document.querySelectorAll("#dk-c-items input").forEach((i) => { comboDraft[Number(i.dataset.cc)].cant = i.value; });
    comboDraft = comboDraft.filter((_, i) => i !== idx);
    if (!comboDraft.length) comboDraft = [{ pid: "", cant: "1" }];
    render();
  }

  // ---------- Vistas FULL (con clave) ----------
  function vReponer() {
    return `<div class="view" style="max-width:800px"><h3>📥 Reponer Stock</h3>
      <div class="card" style="margin-bottom:15px"><b>Ingreso de mercadería</b>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <select id="dk-r-p" class="inp" style="flex:2;min-width:160px">${productos.map((p) => `<option value="${p.id}">${esc(p.nombre)} (S:${p.stock})</option>`).join("")}</select>
        <input id="dk-r-c" class="inp" type="number" placeholder="Cantidad" style="width:110px">
        <input id="dk-r-o" class="inp" type="number" placeholder="Costo unit." style="width:110px"></div>
      <div style="margin-top:8px"><button onclick="DK.reponerFull()" style="padding:10px 20px;background:#16a34a;color:#fff;border:none;border-radius:4px;font-weight:bold">Ingresar stock</button></div>
      <p style="font-size:.8rem;color:var(--muted)">En el sistema real: remito por proveedor, costo promedio y actualización de precio de venta.</p></div></div>`;
  }
  function vProveedores() {
    return `<div class="view" style="max-width:800px"><h3>🚛 Proveedores</h3>
      <div class="card" style="margin-bottom:15px"><div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="dk-pr-n" class="inp" placeholder="Nombre *" style="flex:2;min-width:160px"><input id="dk-pr-c" class="inp" placeholder="Contacto" style="flex:1;min-width:120px">
        <button class="minibtn" onclick="DK.addProv()">Guardar</button></div></div>
      <div class="card">${proveedores.map((p) => `<div style="font-size:.9rem;border-bottom:1px solid var(--bg);padding:6px 0;display:flex;justify-content:space-between"><span><b>${esc(p.nombre)}</b> <span style="color:var(--muted)">· ${esc(p.contacto || "—")}</span></span></div>`).join("")}</div></div>`;
  }
  function vDevol() {
    const v = ventasHist.find((x) => String(x.id) === String(devVenta));
    return `<div class="view" style="max-width:800px"><h3>🔄 Devoluciones</h3>
      <div class="card" style="margin-bottom:15px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <select class="inp" onchange="DK.devSelV(this.value)" style="flex:1;min-width:160px"><option value="">Venta...</option>${ventasHist.map((x) => `<option value="${x.id}" ${String(devVenta) === String(x.id) ? "selected" : ""}>#${x.id} · ${fmt(x.total)}</option>`).join("")}</select>
        <select class="inp" onchange="DK.devSelI(this.value)" style="flex:1;min-width:160px"><option value="">Item...</option>${(v?.items || []).map((i) => `<option ${devItem === i.nombre ? "selected" : ""}>${esc(i.nombre)}</option>`).join("")}</select>
        <input class="inp" type="number" placeholder="Cant" value="${esc(devCant)}" onchange="DK.devC(this.value)" style="width:90px">
        <input class="inp" placeholder="Motivo" value="${esc(devMotivo)}" onchange="DK.devM(this.value)" style="flex:1;min-width:140px"></div>
      <div style="margin-top:8px"><button onclick="DK.devOk()" style="padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:4px;font-weight:bold">Procesar devolución</button></div></div>
      <div class="card"><b>Procesadas (${devoluciones.length})</b>${devoluciones.map((d) => `<div style="font-size:.85rem;border-bottom:1px solid var(--bg);padding:6px 0"><b>#${d.venta}</b> ${esc(d.item)} x${d.cant} · ${fmt(d.monto)} · ${esc(d.motivo)}</div>`).join("") || "<p style='color:var(--muted)'>Sin devoluciones.</p>"}</div></div>`;
  }
  function vCtaCte() {
    return `<div class="view" style="max-width:800px"><h3>🧾 Cuentas Corrientes</h3>
      <div class="card" style="margin-bottom:15px"><div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="dk-cc-n" class="inp" placeholder="Nombre cliente *" style="flex:2;min-width:160px"><input id="dk-cc-l" class="inp" type="number" placeholder="Límite $" style="width:120px">
        <button class="minibtn" onclick="DK.addCli()">Crear cuenta</button></div></div>
      ${clientes.map((c) => `<div class="card" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div><b>${esc(c.nombre)}</b><div style="font-size:.8rem;color:var(--muted)">Debe: <b style="color:${Number(c.deuda) > 0 ? "#dc2626" : "#16a34a"}">${fmt(c.deuda)}</b>${c.limite ? ` / Lím ${fmt(c.limite)}` : ""}</div></div>
        <div style="display:flex;gap:6px"><input id="dk-cob-${c.id}" class="inp" type="number" placeholder="$ cobra" style="width:110px"><button class="minibtn" onclick="DK.cobrarCli(${c.id})">Cobrar</button></div></div></div>`).join("") || "<p style='color:var(--muted)'>Sin cuentas.</p>"}</div>`;
  }
  function vEtiq() {
    const sel = productos.filter((p) => etiqSel[p.id]);
    return `<div class="view"><h3>🏷️ Etiquetas de precio</h3>
      <p style="font-size:.85rem;color:var(--muted)">Tildá productos y previsualizá las etiquetas para la góndola.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">${productos.slice(0, 30).map((p) => `<label style="font-size:.8rem;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px 10px;cursor:pointer"><input type="checkbox" ${etiqSel[p.id] ? "checked" : ""} onchange="DK.etiq(${p.id},this.checked)"> ${esc(p.nombre)}</label>`).join("")}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:700px">${sel.map((p) => `<div style="border:1px dashed #999;padding:10px;text-align:center;background:#fff;color:#000;border-radius:6px"><div style="font-size:11px">${esc(p.nombre)}</div><div style="font-size:26px;font-weight:bold">${fmt(p.venta)}</div><div style="font-size:11px">Cód: ${esc(p.codigo || p.id)}</div></div>`).join("") || "<p style='color:var(--muted)'>Nada tildado.</p>"}</div>
      ${sel.length ? `<div style="margin-top:10px"><button class="minibtn" onclick="window.print()">🖨 Imprimir etiquetas</button></div>` : ""}</div>`;
  }
  function vUsuarios() {
    return `<div class="view" style="max-width:700px"><h3>👤 Usuarios y roles</h3>
      <div class="card" style="margin-bottom:15px"><div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="dk-u-n" class="inp" placeholder="Usuario *" style="flex:1;min-width:140px">
        <select id="dk-u-r" class="inp"><option value="cajero">cajero</option><option value="admin">admin</option></select>
        <button class="minibtn" onclick="DK.addUser()">Crear</button></div>
      <p style="font-size:.8rem;color:var(--muted)">En el sistema real cada rol tiene permisos (vender, descuento, caja, config...) y clave propia.</p></div>
      <div class="card">${usuarios.map((u) => `<div style="font-size:.9rem;border-bottom:1px solid var(--bg);padding:6px 0"><b>${esc(u.username)}</b> <span class="bdg" style="background:#e0e7ff;color:#3730a3">${esc(u.rol)}</span></div>`).join("")}</div></div>`;
  }
  function vInformes() {
    const tot = red(ventasHist.reduce((a, v) => a + Number(v.total || 0), 0));
    const rank = {};
    ventasHist.forEach((v) => (v.items || []).forEach((i) => { rank[i.nombre] = (rank[i.nombre] || 0) + Number(i.cant || 0); }));
    const top = Object.entries(rank).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return `<div class="view"><h3>📊 Informes del turno</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;max-width:800px">
        <div class="card"><small>Recaudado</small><div style="font-size:1.4rem;font-weight:bold;color:#16a34a">${fmt(tot)}</div></div>
        <div class="card"><small>Tickets</small><div style="font-size:1.4rem;font-weight:bold">${ventasHist.length}</div></div>
        <div class="card"><small>Ticket promedio</small><div style="font-size:1.4rem;font-weight:bold">${ventasHist.length ? fmt(red(tot / ventasHist.length)) : "—"}</div></div></div>
      <div class="card" style="max-width:800px"><b>🏆 Más vendidos</b>${top.map(([n, c]) => `<div style="font-size:.85rem;display:flex;justify-content:space-between;border-bottom:1px solid var(--bg);padding:4px 0"><span>${esc(n)}</span><b>x${c}</b></div>`).join("") || "<p style='color:var(--muted)'>Todavía sin ventas en esta demo.</p>"}
      <p style="font-size:.8rem;color:var(--muted);margin-top:8px">En el sistema real: por medio de pago, por día, rotación, Excel y backup de la base.</p></div></div>`;
  }

  function render() {
    renderNav();
    const app = $("app");
    app.innerHTML = vista === "pos" ? vPOS() : vista === "caja" ? vCaja() : vista === "stock" ? vStock() : vista === "combos" ? vCombos() : vista === "reponer" ? vReponer() : vista === "proveedores" ? vProveedores() : vista === "devoluciones" ? vDevol() : vista === "ctacte" ? vCtaCte() : vista === "etiquetas" ? vEtiq() : vista === "usuarios" ? vUsuarios() : vInformes();
    tickLock();
  }

  // atajos como el real
  document.addEventListener("keydown", (e) => {
    if (vista !== "pos" || !caja.abierta) return;
    if (e.key === "F2") { e.preventDefault(); $("dk-bus")?.focus(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); cobrar(); }
  });

  return {
    go, theme, openKey, closeModal, useKey, reqPais, reqProv, reqCiu, reqSend,
    bus: (v) => { busqueda = v; const s = filtrados().slice(0, 6); render(); const b = $("dk-bus"); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } },
    foco: (f) => { focoSug = !!f; },
    keyBus: (e) => {
      if (e.key === "Enter" && busqueda.trim()) {
        e.preventDefault();
        const q = busqueda.trim(), fl = filtrados();
        const ex = productos.find((p) => p.codigo === q || String(p.id) === q);
        if (ex) pick(ex); else if (fl.length) pick(fl[0]);
      }
      if (e.key === "Escape") { busqueda = ""; render(); }
    },
    pick: (id) => pick(productos.find((p) => p.id === id)),
    cons: () => {
      const q = ($("dk-cons")?.value || "").trim();
      const p = productos.find((x) => x.codigo === q || String(x.id) === q);
      $("dk-cons-r").textContent = p ? `${p.nombre}: ${fmt(p.venta)} (S:${p.stock})` : "No encontrado";
    },
    chCant, addCombo, okPeso, addManual,
    tglMan: () => { const d = $("dk-man"); if (d) d.style.display = d.style.display === "none" ? "block" : "none"; },
    vaciar: () => { carrito = []; pagos = []; desc = 0; fiadoCli = ""; render(); },
    desc: (v) => { desc = Number(v || 0); render(); },
    fiado: (v) => { fiadoCli = v; pagos = []; render(); },
    addPago, delPago: (i) => { pagos = pagos.filter((_, x) => x !== i); render(); },
    exacto: () => { pagoMedio = "1"; pagoMonto = String(Math.max(0, total() - totPagos())); const m = $("dk-pm"), o = $("dk-pmo"); if (m) m.value = "1"; if (o) o.value = pagoMonto; },
    limpiarPagos: () => { pagos = []; render(); },
    cobrar, reimp: () => showTicket(), doPrint, comboAddRow, comboDelRow,
    abrir: () => {
      const n = ($("dk-ap-n")?.value || "").trim(), m = parseFloat($("dk-ap-m")?.value);
      if (!n || !(m >= 0)) return msg("Poné quién abre y la plata inicial", "error");
      caja = { ...caja, abierta: true, responsable: n, inicial: m }; go("pos"); msg(`CAJA abierta por ${n}. Ya podés vender.`);
    },
    cerrar: (esp) => {
      const n = ($("dk-ci-n")?.value || "").trim(), m = parseFloat($("dk-ci-m")?.value);
      if (!n || !(m >= 0)) return msg("Poné quién cierra y lo contado", "error");
      if (!confirm(`¿Cerrar CAJA contando ${fmt(m)} (${n})?`)) return;
      const dif = red(m - esp);
      caja.abierta = false;
      msg(`CAJA cerrada. Esperado ${fmt(esp)} / Contado ${fmt(m)} / Dif ${fmt(dif)}`, dif === 0 ? "ok" : "error");
      render();
    },
    mov: () => {
      const t = $("dk-mv-t")?.value, m = parseFloat($("dk-mv-m")?.value), d = ($("dk-mv-d")?.value || "").trim();
      if (!m || m <= 0 || !d) return msg("Monto y motivo obligatorios", "error");
      movimientos.unshift({ tipo: t, monto: m, desc: d });
      if (t === "egreso") caja.egresos = red(caja.egresos + m); else caja.ingresos = red(caja.ingresos + m);
      render(); msg("Movimiento registrado");
    },
    ctab: (t) => { cajaTab = t; render(); },
    filtro: (v) => { filtroProd = v; render(); const i = document.querySelector('.view input[placeholder="Filtrar productos..."]'); },
    saveProd: () => {
      const n = ($("dk-p-n")?.value || "").trim(), pv = parseFloat($("dk-p-pv")?.value);
      if (!n || !(pv > 0)) return msg("Nombre y precio de venta obligatorios", "error");
      const um = $("dk-p-um")?.value || "un";
      productos.push({ id: Math.max(...productos.map((p) => p.id)) + 1, nombre: n, codigo: ($("dk-p-c")?.value || "").trim() || null, costo: parseFloat($("dk-p-cc")?.value) || 0, venta: pv, stock: parseFloat($("dk-p-st")?.value) || 0, um, pes: $("dk-p-pes")?.checked || um !== "un" });
      render(); msg("Producto creado");
    },
    reponer: (id) => { const p = productos.find((x) => x.id === id); if (p) p.stock = red(Number(p.stock) + 10); render(); },
    reponerFull: () => {
      const p = productos.find((x) => String(x.id) === String($("dk-r-p")?.value));
      const c = parseFloat($("dk-r-c")?.value);
      if (!p || !(c > 0)) return msg("Elegí producto y cantidad", "error");
      p.stock = red(Number(p.stock) + c);
      render(); msg(`Stock actualizado: ${p.nombre} = ${p.stock}`);
    },
    addProv: () => {
      const n = ($("dk-pr-n")?.value || "").trim();
      if (!n) return msg("Nombre obligatorio", "error");
      proveedores.push({ id: Math.max(...proveedores.map((p) => p.id)) + 1, nombre: n, contacto: ($("dk-pr-c")?.value || "").trim() });
      render(); msg("Proveedor guardado");
    },
    devSelV: (v) => { devVenta = v; const vv = ventasHist.find((x) => String(x.id) === String(v)); devItem = vv?.items?.[0]?.nombre || ""; render(); },
    devSelI: (v) => { devItem = v; },
    devC: (v) => { devCant = v; },
    devM: (v) => { devMotivo = v; },
    devOk: () => {
      const vv = ventasHist.find((x) => String(x.id) === String(devVenta));
      const c = parseFloat(devCant);
      if (!vv || !devItem || !(c > 0)) return msg("Elegí venta, item y cantidad", "error");
      const p = productos.find((x) => x.nombre === devItem);
      const monto = red(c * (p ? p.venta : 0));
      if (p) p.stock = red(Number(p.stock) + c);
      caja.egresos = red(caja.egresos + monto);
      devoluciones.unshift({ venta: vv.id, item: devItem, cant: c, monto, motivo: devMotivo || "—" });
      devVenta = ""; devItem = ""; devCant = ""; devMotivo = "";
      render(); msg("Devolución procesada ↩️");
    },
    addCli: () => {
      const n = ($("dk-cc-n")?.value || "").trim();
      if (!n) return msg("Nombre obligatorio", "error");
      clientes.push({ id: Math.max(0, ...clientes.map((c) => c.id)) + 1, nombre: n, deuda: 0, limite: parseFloat($("dk-cc-l")?.value) || 0 });
      render(); msg("Cuenta creada");
    },
    cobrarCli: (id) => {
      const c = clientes.find((x) => x.id === id);
      const m = parseFloat($("dk-cob-" + id)?.value);
      if (!c || !(m > 0)) return msg("Monto inválido", "error");
      c.deuda = red(Math.max(0, Number(c.deuda) - m));
      caja.ingresos = red(caja.ingresos + m);
      movimientos.unshift({ tipo: "ingreso", monto: m, desc: "Cobro cta cte " + c.nombre });
      render(); msg(`Cobrado ${fmt(m)} a ${c.nombre}`);
    },
    etiq: (id, on) => { if (on) etiqSel[id] = 1; else delete etiqSel[id]; render(); },
    addUser: () => {
      const n = ($("dk-u-n")?.value || "").trim();
      if (!n) return msg("Usuario obligatorio", "error");
      usuarios.push({ username: n, rol: $("dk-u-r")?.value || "cajero" });
      render(); msg("Usuario creado");
    },
    delProd: (id) => { if (confirm("¿Borrar producto?")) { productos = productos.filter((x) => x.id !== id); render(); } },
    saveCombo: () => {
      const n = ($("dk-c-n")?.value || "").trim(), pr = parseFloat($("dk-c-p")?.value);
      document.querySelectorAll("#dk-c-items select").forEach((s) => { comboDraft[Number(s.dataset.ci)].pid = s.value; });
      document.querySelectorAll("#dk-c-items input").forEach((i) => { comboDraft[Number(i.dataset.cc)].cant = i.value; });
      const items = comboDraft.filter((r) => r.pid && parseFloat(r.cant) > 0).map((r) => {
        const p = productos.find((x) => String(x.id) === String(r.pid));
        return { nombre: p ? p.nombre : "", cant: parseFloat(r.cant) };
      }).filter((i) => i.nombre);
      if (!n || !(pr > 0) || !items.length) return msg("Nombre, precio y al menos 1 producto", "error");
      combos.push({ id: Math.max(...combos.map((c) => c.id)) + 1, nombre: n, precio: pr, items });
      comboDraft = [{ pid: "", cant: "1" }];
      render(); msg("Combo creado 🎁");
    },
  };
})();
DK.go("pos");
if (window.innerWidth < 700) {
  var d = document.createElement("div");
  d.className = "pchint";
  d.textContent = "💻 Tip: esta demo se disfruta mucho más desde una PC. En el celular podés recorrerla igual.";
  document.getElementById("root")?.prepend(d);
}
setInterval(() => { if (document.getElementById("lock-state")) DK && null; }, 60000);
