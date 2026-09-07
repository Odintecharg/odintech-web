/* =====================================================================
   Demos OdinGO por sistema (página propia cada uno).
   - Datos base visibles + extras codificados (solo con clave válida).
   - Clave de 30 min (la genera el dueño) o maestra permanente del dueño.
   - Todo en memoria: al recargar vuelve a los datos de ejemplo.
   La página define window.DEMO_SYS antes de cargar este archivo.
   ===================================================================== */
const DS_S = atob("b2Rpbmdv" + "LWtpb3Nj" + "by1kZW1vLTlmMms=");
const DS_MAIL = "odintecharg@hotmail.com";
const DS_WA = "5490000000000"; // TODO: mismo número que odingo-tienda.js
const DS_UNLOCK_MS = 30 * 60 * 1000;
const DS_MASTER_HASH = 2213855217;

const SYS_INFO = {
  gastronomia: { nombre: "OdinGO Resto-Roti — Restaurant / Rotisería", desc: "Mixto: mesas por sector + mostrador + delivery + cocina KDS en tiempo real.", prueba: ["Abrir mesa y sumar items", "Mandar comanda a cocina y avanzar estados", "Cobrar mesa o pedido"], incluye: ["Wizard: restaurant, rotisería o mixto + mesas por sector y capacidad", "Cocina KDS con timers, comandas impresas 58/80mm", "Delivery/takeaway con datos de cliente, clientes, stock y reportes", "Caja con cobro por método, ticket y movimientos"] },
  gimnasios: { nombre: "OdinGO Gimnasio — Socios y clases", desc: "Cuotas, ingresos diarios, clases con cupo y recordatorios por WhatsApp.",     prueba: ["Cobrar cuota y renovar", "Check-in de ingreso (avisa deuda)", "Congelar cuota"],
    incluye: ["Cuotas con fin automático, renovar, congelar (extiende días)", "Clases por día con cupo, reservas y presente/ausente", "Vencidas, por vencer, inactivos y cumpleaños con botón de WhatsApp (manual, sin riesgo)", "Caja obligatoria para cobrar, informes XLSX + backup, roles admin/recepción/profesor"] },
  peluqueria: { nombre: "OdinGO Turnero — Peluquería / Barbería / Estética", desc: "Agenda por profesional con control de choques + cobranza mixta.", prueba: ["Crear turno y avanzar estados", "Cobranza mixta en un ticket", "Ver comisiones"], incluye: ["Agenda por profesional: pendiente → confirmado → en curso → realizado → cobrado", "Multi-servicio por turno, seña, notas, origen (local/WhatsApp/web)", "Cobranza mixta: turnos + mostrador, descuento, propina, múltiples medios, ticket", "Profesionales con color y % comisión, productos, informes y backup"] },
  talleres: { nombre: "OdinGO Talleres — Autos, motos y camionetas", desc: "Órdenes por patente + control de ingreso imprimible en 2 copias.", prueba: ["Crear orden y avanzar estados", "Cobrar orden (pasa a entregada)", "Buscar por patente"], incluye: ["Estados: ingresado → diagnosticado → presupuestado → aprobado → en reparación → listo → entregado", "Control de ingreso: golpes/rayones, checklist recepción, fotos y firmas", "Dueños + vehículos por patente, KM, seguro e historial de gasto", "Repuestos con stock mínimo, cobranza mixta, caja, comisiones e informes"] },
  hotel: { nombre: "OdinGO Hotel — Reservas y recepción", desc: "Recepción por colores + consumos a la habitación + POS mostrador.", prueba: ["Check-in en libre", "Checkout con saldo (noches + consumos − anticipo)", "Liberar limpieza"], incluye: ["Reservas con validación de solapamiento (no doble-reserva)", "Recepción libre · reservada · ocupada · limpieza · mantenimiento", "Consumos cargados a la habitación + POS bar/restaurante", "Caja, productos/stock, paquetes, informes, backup y roles"] },
  lavadero: { nombre: "OdinGO Lavaderos & Servicios", desc: "Agenda con patente + playa kanban en vivo + abonos.", prueba: ["Crear turno con patente", "Avanzar playa hasta entregado", "Cobrar servicio"], incluye: ["Playa en vivo: en cola → lavando → secando → listo → entregado + walk-in", "Cobranza con seña/descuento/abono, extras, pagos múltiples y ticket", "Servicios con precio Auto/Moto/Grande, operarios con % comisión", "Abonos, clientes/vehículos, caja, stock e informes"] },
};

const SEED = {
  gastronomia: {
    menu: [
      { id: "G1", nombre: "Pizza Muzzarella", precio: 9500, cocina: true },
      { id: "G2", nombre: "Empanadas (doc)", precio: 12000, cocina: true },
      { id: "G3", nombre: "Milanesa + fritas", precio: 8900, cocina: true },
      { id: "G4", nombre: "Lomito completo", precio: 10500, cocina: true },
    ],
    mesas: [
      { id: "M1", nro: "1", sector: "Salón", estado: "Ocupada", mozo: "Luis", items: [{ nombre: "Pizza Muzzarella", qty: 1, precio: 9500 }], total: 9500 },
      { id: "M2", nro: "2", sector: "Salón", estado: "Libre", mozo: "", items: [], total: 0 },
      { id: "M3", nro: "3", sector: "Terraza", estado: "Por cobrar", mozo: "Ana", items: [{ nombre: "Lomito completo", qty: 2, precio: 10500 }], total: 21000 },
    ],
    cocina: [{ id: "K1", origen: "Mesa 1", detalle: "Pizza Muzzarella x1", estado: "Preparando" }],
    pedidos: [],
    caja: 24700,
  },
  gimnasios: {
    socios: [
      { id: "S1", nombre: "Lucía Fernández", plan: "Musculación", estado: "Al día", vence: "10/10/2026" },
      { id: "S2", nombre: "Martín Gómez", plan: "Funcional", estado: "Vencida", vence: "28/08/2026" },
      { id: "S3", nombre: "Camila Ruiz", plan: "Spinning", estado: "Al día", vence: "15/10/2026" },
    ],
    pagos: [{ id: "CU-501", socio: "Lucía Fernández", monto: 15000, fecha: "01/09/2026" }],
    clases: [
      { id: "C1", nombre: "Funcional 18hs", cupo: 20, anotados: 14 },
      { id: "C2", nombre: "Spinning 19hs", cupo: 15, anotados: 15 },
    ],
  },
  peluqueria: {
    profesionales: [{ nombre: "Nadia", comision: 40 }, { nombre: "Leo", comision: 35 }],
    turnos: [
      { id: "T1", cliente: "Valentina Sosa", servicio: "Corte + Brushing", prof: "Nadia", hora: "Hoy 14:00", estado: "Confirmado" },
      { id: "T2", cliente: "Juan Pérez", servicio: "Corte hombre", prof: "Leo", hora: "Hoy 15:30", estado: "Pendiente" },
      { id: "T3", cliente: "María Aguilar", servicio: "Color + Nutrición", prof: "Nadia", hora: "Mañana 10:00", estado: "En curso" },
    ],
    servicios: [{ nombre: "Corte mujer", precio: 8000 }, { nombre: "Corte hombre", precio: 6000 }, { nombre: "Color", precio: 18000 }],
  },
  talleres: {
    ordenes: [
      { id: "OT-101", patente: "ABC123", cliente: "Roberto Sosa", vehiculo: "Gol Trend 2018", trabajo: "Frenos + pastillas", presupuesto: 85000, estado: "En reparación" },
      { id: "OT-102", patente: "XYZ789", cliente: "Mirta Cáceres", vehiculo: "EcoSport 2020", trabajo: "Service 10.000km", presupuesto: 65000, estado: "Presupuestado" },
    ],
  },
  hotel: {
    habitaciones: [
      { id: "H1", nro: "101", estado: "Ocupada", huesped: "Familia Gómez", noches: 2, precio: 25000, consumos: 5600, anticipo: 20000 },
      { id: "H2", nro: "102", estado: "Libre", huesped: "", noches: 0, precio: 25000, consumos: 0, anticipo: 0 },
      { id: "H3", nro: "103", estado: "Reservada", huesped: "Ana Torres", noches: 3, precio: 28000, consumos: 0, anticipo: 15000 },
    ],
  },
  lavadero: {
    turnos: [
      { id: "L1", patente: "ABC123", cliente: "Roberto Sosa", servicio: "Completo Auto", estado: "Lavando", operario: "Juan" },
      { id: "L2", patente: "XYZ789", cliente: "Mirta Cáceres", servicio: "Básico Moto", estado: "En cola", operario: "-" },
    ],
    abonos: [{ id: "A1", cliente: "Taxi La Paz", saldo: 2, total: 4 }],
  },
};

// Extras FULL codificados (se agregan con clave válida)
const FULL_BLOB = {
  gastronomia: "eyJpZHMiOiBbIkc1IiwgIkc2IiwgIk00IiwgIk01IiwgIks5Il0sICJtZW51IjogW3siaWQiOiAiRzUiLCAibm9tYnJlIjogIkVuc2FsYWRhIEPDqXNhciIsICJwcmVjaW8iOiA2NTAwLCAiY29jaW5hIjogZmFsc2V9LCB7ImlkIjogIkc2IiwgIm5vbWJyZSI6ICJGbGFuIGNhc2VybyIsICJwcmVjaW8iOiAzNTAwLCAiY29jaW5hIjogZmFsc2V9XSwgIm1lc2FzIjogW3siaWQiOiAiTTQiLCAibnJvIjogIjQiLCAic2VjdG9yIjogIlRlcnJhemEiLCAiZXN0YWRvIjogIkxpYnJlIiwgIm1vem8iOiAiIiwgIml0ZW1zIjogW10sICJ0b3RhbCI6IDB9LCB7ImlkIjogIk01IiwgIm5ybyI6ICI1IiwgInNlY3RvciI6ICJTYWzDs24iLCAiZXN0YWRvIjogIkxpYnJlIiwgIm1vem8iOiAiIiwgIml0ZW1zIjogW10sICJ0b3RhbCI6IDB9XSwgImNvY2luYSI6IFt7ImlkIjogIks5IiwgIm9yaWdlbiI6ICJEZWxpdmVyeSIsICJkZXRhbGxlIjogIkxvbWl0byB4MSIsICJlc3RhZG8iOiAiUGVuZGllbnRlIn1dfQ==",
  gimnasios: "eyJpZHMiOiBbIlM0IiwgIlM1IiwgIkMzIl0sICJzb2Npb3MiOiBbeyJpZCI6ICJTNCIsICJub21icmUiOiAiRGllZ28gVG9ycmVzIiwgInBsYW4iOiAiTXVzY3VsYWNpw7NuICsgRnVuY2lvbmFsIiwgImVzdGFkbyI6ICJQb3IgdmVuY2VyIiwgInZlbmNlIjogIjA4LzA5LzIwMjYifSwgeyJpZCI6ICJTNSIsICJub21icmUiOiAiU29mw61hIEzDs3BleiIsICJwbGFuIjogIllvZ2EiLCAiZXN0YWRvIjogIkFsIGTDrWEiLCAidmVuY2UiOiAiMjAvMTAvMjAyNiJ9XSwgImNsYXNlcyI6IFt7ImlkIjogIkMzIiwgIm5vbWJyZSI6ICJZb2dhIDIwaHMiLCAiY3VwbyI6IDEyLCAiYW5vdGFkb3MiOiA3fV19",
  peluqueria: "eyJpZHMiOiBbIlQ0IiwgIlQ1IiwgIlAtQ2FtaSJdLCAidHVybm9zIjogW3siaWQiOiAiVDQiLCAiY2xpZW50ZSI6ICJQYW9sYSBEw61heiIsICJzZXJ2aWNpbyI6ICJNYW5pY3Vyw61hIiwgInByb2YiOiAiQ2FtaSIsICJob3JhIjogIk1hw7FhbmEgMTE6MzAiLCAiZXN0YWRvIjogIlBlbmRpZW50ZSJ9LCB7ImlkIjogIlQ1IiwgImNsaWVudGUiOiAiUm9zYSBNw6luZGV6IiwgInNlcnZpY2lvIjogIlBlaW5hZG8gZmllc3RhIiwgInByb2YiOiAiTmFkaWEiLCAiaG9yYSI6ICJNYcOxYW5hIDE3OjAwIiwgImVzdGFkbyI6ICJDb25maXJtYWRvIn1dLCAicHJvZmVzaW9uYWxlcyI6IFt7Im5vbWJyZSI6ICJDYW1pIiwgImNvbWlzaW9uIjogMzB9XX0=",
  talleres: "eyJpZHMiOiBbIk9ULTEwNCIsICJPVC0xMDUiXSwgIm9yZGVuZXMiOiBbeyJpZCI6ICJPVC0xMDQiLCAicGF0ZW50ZSI6ICJHSEk3ODkiLCAiY2xpZW50ZSI6ICJDYXJsb3MgUnVpeiIsICJ2ZWhpY3VsbyI6ICJDb3JvbGxhIDIwMTkiLCAidHJhYmFqbyI6ICJEaXN0cmlidWNpw7NuIiwgInByZXN1cHVlc3RvIjogMTIwMDAwLCAiZXN0YWRvIjogIkRpYWdub3N0aWNhZG8ifSwgeyJpZCI6ICJPVC0xMDUiLCAicGF0ZW50ZSI6ICJKS0wwMTIiLCAiY2xpZW50ZSI6ICJFbGVuYSBQYXoiLCAidmVoaWN1bG8iOiAiT25peCAyMDIyIiwgInRyYWJham8iOiAiQWxpbmVhZG8gKyBiYWxhbmNlbyIsICJwcmVzdXB1ZXN0byI6IDQ1MDAwLCAiZXN0YWRvIjogIkluZ3Jlc2FkbyJ9XX0=",
  hotel: "eyJpZHMiOiBbIkg0IiwgIkg1Il0sICJoYWJpdGFjaW9uZXMiOiBbeyJpZCI6ICJINCIsICJucm8iOiAiMjAxIiwgImVzdGFkbyI6ICJMaW1waWV6YSIsICJodWVzcGVkIjogIiIsICJub2NoZXMiOiAwLCAicHJlY2lvIjogMjIwMDAsICJjb25zdW1vcyI6IDAsICJhbnRpY2lwbyI6IDB9LCB7ImlkIjogIkg1IiwgIm5ybyI6ICIyMDIiLCAiZXN0YWRvIjogIkxpYnJlIiwgImh1ZXNwZWQiOiAiIiwgIm5vY2hlcyI6IDAsICJwcmVjaW8iOiAyMjAwMCwgImNvbnN1bW9zIjogMCwgImFudGljaXBvIjogMH1dfQ==",
  lavadero: "eyJpZHMiOiBbIkwzIiwgIkw0IiwgIkEyIl0sICJ0dXJub3MiOiBbeyJpZCI6ICJMMyIsICJwYXRlbnRlIjogIkRFRjQ1NiIsICJjbGllbnRlIjogIkpvc8OpIEx1bmEiLCAic2VydmljaW8iOiAiRGV0YWlsaW5nIiwgImVzdGFkbyI6ICJMaXN0byIsICJvcGVyYXJpbyI6ICJQZWRybyJ9LCB7ImlkIjogIkw0IiwgInBhdGVudGUiOiAiR0hJMzIxIiwgImNsaWVudGUiOiAiU2FyYSBWaWRhbCIsICJzZXJ2aWNpbyI6ICJDb21wbGV0byBDYW1pb25ldGEiLCAiZXN0YWRvIjogIkVuIGNvbGEiLCAib3BlcmFyaW8iOiAiLSJ9XSwgImFib25vcyI6IFt7ImlkIjogIkEyIiwgImNsaWVudGUiOiAiUmVtaXMgTm9ydGUiLCAic2FsZG8iOiA0LCAidG90YWwiOiA0fV19"
};





function fullExtra(sys) {
  const bin = atob(FULL_BLOB[sys] || "");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

const DS = (() => {
  const sys = window.DEMO_SYS;
  const $ = (id) => document.getElementById(id);
  const money = (n) => "$ " + Number(n).toLocaleString("es-AR");
  const esc = (s) => String(s ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const val = (id) => ($(id)?.value || "").trim();

  let DB = JSON.parse(JSON.stringify(SEED[sys]));
  let selMesa = "M1", otQ = "";
  let extraOn = false;
  const extraIds = () => (fullExtra(sys).ids || []);
  let unlockUntil = Number(sessionStorage.getItem("dss_" + sys) || 0);
  let isMaster = localStorage.getItem("kiosco_master") === "1";
  const unlocked = () => isMaster || Date.now() < unlockUntil;

  function djb2(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0; return h; }
  function bucket(d) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${d.getUTCMinutes() < 30 ? "A" : "B"}`;
  }
  function codeFor(d) { return String(djb2(DS_S + bucket(d)) % 1000000).padStart(6, "0"); }
  function checkKey(code) {
    code = String(code || "").trim();
    if (djb2(code) === DS_MASTER_HASH) return "master";
    const now = new Date();
    if (code === codeFor(now)) return "ok";
    if (code === codeFor(new Date(now.getTime() - 1800e3))) return "ok";
    return null;
  }
  function setExtra(on) {
    if (on === extraOn) return;
    extraOn = on;
    if (on) {
      const f = fullExtra(sys);
      if (sys === "gastronomia") { DB.menu.push(...f.menu); DB.mesas.push(...f.mesas); DB.cocina.push(...f.cocina); }
      if (sys === "gimnasios") { DB.socios.push(...f.socios); DB.clases.push(...f.clases); }
      if (sys === "peluqueria") { DB.turnos.push(...f.turnos); DB.profesionales.push(...f.profesionales); }
      if (sys === "talleres") { DB.ordenes.push(...f.ordenes); }
      if (sys === "hotel") { DB.habitaciones.push(...f.habitaciones); }
      if (sys === "lavadero") { DB.turnos.push(...f.turnos); DB.abonos.push(...f.abonos); }
    } else {
      const ids = extraIds();
      if (sys === "gastronomia") { DB.menu = DB.menu.filter((x) => !ids.includes(x.id)); DB.mesas = DB.mesas.filter((x) => !ids.includes(x.id)); DB.cocina = DB.cocina.filter((x) => !ids.includes(x.id)); }
      if (sys === "gimnasios") { DB.socios = DB.socios.filter((x) => !ids.includes(x.id)); DB.clases = DB.clases.filter((x) => !ids.includes(x.id)); }
      if (sys === "peluqueria") { DB.turnos = DB.turnos.filter((x) => !ids.includes(x.id)); DB.profesionales = DB.profesionales.filter((x) => !ids.includes("P-" + x.nombre)); }
      if (sys === "talleres") { DB.ordenes = DB.ordenes.filter((x) => !ids.includes(x.id)); }
      if (sys === "hotel") { DB.habitaciones = DB.habitaciones.filter((x) => !ids.includes(x.id)); }
      if (sys === "lavadero") { DB.turnos = DB.turnos.filter((x) => !ids.includes(x.id)); DB.abonos = DB.abonos.filter((x) => !ids.includes(x.id)); }
    }
  }
  function applyUnlock(mode) {
    if (mode === "master") { isMaster = true; localStorage.setItem("kiosco_master", "1"); sessionStorage.removeItem("dss_" + sys); }
    else { unlockUntil = Date.now() + DS_UNLOCK_MS; sessionStorage.setItem("dss_" + sys, String(unlockUntil)); }
    setExtra(true); render();
    toast(mode === "master" ? "🔓 Demo completa permanente (modo dueño)." : "🔓 Demo completa por 30 minutos.");
  }
  function toast(t) {
    let e = $("ds-toast");
    if (!e) { e = document.createElement("div"); e.id = "ds-toast"; document.body.appendChild(e); }
    e.textContent = t; e.classList.add("show");
    clearTimeout(e._h); e._h = setTimeout(() => e.classList.remove("show"), 2400);
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
      if (unlockUntil || extraOn) { unlockUntil = 0; sessionStorage.removeItem("dss_" + sys); setExtra(false); render(); }
    }
  }
  setInterval(tickLock, 30000);

  function openKey() {
    $("modal").innerHTML = `<div class="dmodal"><div class="dbox">
      <h3>🔑 Clave completa (30 min)</h3>
      <p class="muted">Pedila por mail, te la mandamos y la pegás acá.</p>
      <input id="ds-key" maxlength="12" placeholder="______">
      <div style="display:flex;gap:8px;justify-content:center"><button class="button primary" onclick="DS.useKey()">Desbloquear</button>
      <button class="link-btn" onclick="DS.closeModal()">Cerrar</button></div>
      <p style="margin-top:10px"><a href="mailto:${DS_MAIL}?subject=${encodeURIComponent("Clave demo completa · " + SYS_INFO[sys].nombre)}&body=${encodeURIComponent("Hola, quiero la clave de 30 minutos para la demo de " + SYS_INFO[sys].nombre + ".\n\nNombre:\nNegocio:\nCiudad:")}">✉️ No tengo clave, pedirla por mail</a></p>
    </div></div>`;
    setTimeout(() => $("ds-key")?.focus(), 50);
  }
  function closeModal() { $("modal").innerHTML = ""; }
  function useKey() {
    const mode = checkKey($("ds-key")?.value);
    if (mode) { closeModal(); applyUnlock(mode); }
    else toast("Clave incorrecta o vencida.");
  }

  function kpis() {
    if (sys === "gastronomia") { const d = DB; return [{ k: "Mesas", v: d.mesas.length }, { k: "Ocupadas", v: d.mesas.filter((m) => m.estado !== "Libre").length }, { k: "En cocina", v: d.cocina.length }, { k: "Caja", v: money(d.caja) }]; }
    if (sys === "gimnasios") { const d = DB; return [{ k: "Socios", v: d.socios.length }, { k: "Vencidas", v: d.socios.filter((s) => s.estado === "Vencida").length }, { k: "Cobrado", v: money(d.pagos.reduce((a, p) => a + p.monto, 0)) }, { k: "Clases hoy", v: d.clases.length }]; }
    if (sys === "peluqueria") { const d = DB; return [{ k: "Turnos", v: d.turnos.length }, { k: "Confirmados", v: d.turnos.filter((t) => t.estado === "Confirmado").length }, { k: "Cobrados", v: d.turnos.filter((t) => t.estado === "Cobrado").length }, { k: "Profesionales", v: d.profesionales.length }]; }
    if (sys === "talleres") { const d = DB; return [{ k: "Órdenes", v: d.ordenes.length }, { k: "En reparación", v: d.ordenes.filter((o) => o.estado === "En reparación").length }, { k: "Listas", v: d.ordenes.filter((o) => o.estado === "Listo").length }, { k: "Monto", v: money(d.ordenes.reduce((a, o) => a + o.presupuesto, 0)) }]; }
    if (sys === "hotel") { const d = DB; return [{ k: "Habitaciones", v: d.habitaciones.length }, { k: "Ocupadas", v: d.habitaciones.filter((h) => h.estado === "Ocupada").length }, { k: "Libres", v: d.habitaciones.filter((h) => h.estado === "Libre").length }, { k: "Por cobrar", v: money(d.habitaciones.filter((h) => h.estado === "Ocupada").reduce((a, h) => a + (h.noches * h.precio + h.consumos - h.anticipo), 0)) }]; }
    const d = DB; return [{ k: "Turnos hoy", v: d.turnos.length }, { k: "En playa", v: d.turnos.filter((t) => ["En cola", "Lavando", "Secando"].includes(t.estado)).length }, { k: "Listos", v: d.turnos.filter((t) => t.estado === "Listo").length }, { k: "Abonos", v: d.abonos.length }];
  }

  function body() {
    if (sys === "gastronomia") {
      const d = DB;
      return `<h4>🪑 Mesas — tocá para seleccionar</h4><div class="mesas-grid">${d.mesas.map((m) => `
        <button class="mesa ${m.estado.toLowerCase().replace(" ", "-")}" onclick="DS.selMesa('${m.id}')" style="${selMesa === m.id ? "outline:3px solid #18aaa5;" : ""}">
        <strong>Mesa ${esc(m.nro)} · ${esc(m.sector)}</strong><small>${esc(m.estado)}${m.mozo ? " · " + esc(m.mozo) : ""}${m.total ? " · " + money(m.total) : ""}</small></button>`).join("")}</div>
      ${(() => { const m = d.mesas.find((x) => x.id === selMesa); if (!m || m.estado === "Libre" || !m.items.length) return "";
        return `<div class="demo-row" style="margin-bottom:14px"><div><strong>Mesa ${esc(m.nro)}: ${m.items.map((i) => `${esc(i.nombre)} x${i.qty}`).join(", ")}</strong><small>Total ${money(m.total)}</small></div><button onclick="DS.cobrarMesa('${m.id}')">Cobrar mesa</button></div>`; })()}
      <div class="demo-cols"><div><h4>🍽️ Carta</h4><div class="demo-table">${d.menu.map((g) => `
        <div class="demo-row"><div><strong>${esc(g.nombre)}</strong><small>${money(g.precio)}${g.cocina ? " · va a cocina" : ""}</small></div>
        <button onclick="DS.addMesaItem('${g.id}')">A mesa</button><button class="ghost" onclick="DS.addDelivery('${g.id}')">Delivery</button></div>`).join("")}</div></div>
        <div><h4>👨‍🍳 Cocina KDS</h4><div class="demo-table">${d.cocina.map((k) => `
        <div class="demo-row"><div><strong>${esc(k.origen)}</strong><small>${esc(k.detalle)}</small></div>
        <span class="pill ${k.estado === "Listo" ? "ok" : ""}">${k.estado}</span><button onclick="DS.avanzarKDS('${k.id}')">Avanzar →</button></div>`).join("") || "<p class='muted'>Sin comandas.</p>"}</div>
        <h4 style="margin-top:14px">🧾 Delivery</h4><div class="demo-table">${d.pedidos.map((p) => `
        <div class="demo-row"><div><strong>${p.id}</strong><small>${esc(p.detalle)}</small></div><strong>${money(p.total)}</strong><button onclick="DS.cobrarPedido('${p.id}')">Cobrar</button></div>`).join("") || "<p class='muted'>Sin pedidos.</p>"}</div>
        <p class="muted" style="margin-top:10px">Caja: <strong>${money(d.caja)}</strong></p></div></div>`;
    }
    if (sys === "gimnasios") {
      const d = DB;
      return `<h4>👥 Socios</h4><div class="demo-table">${d.socios.map((s) => `
        <div class="demo-row"><div><strong>${esc(s.nombre)}</strong><small>${esc(s.plan)} · Vence ${esc(s.vence)}</small></div>
        <span class="pill ${s.estado === "Vencida" ? "warn" : s.estado === "Al día" ? "ok" : ""}">${s.estado}</span>
        <button onclick="DS.cobrar('${s.id}')">Cobrar</button><button class="ghost" onclick="DS.checkin('${s.id}')">Ingreso</button><button class="ghost" onclick="DS.congelar('${s.id}')">❄️</button>
        <button class="ghost" onclick="DS.delSocio('${s.id}')">✕</button></div>`).join("")}</div>
        <div class="demo-form"><input id="f-socio-n" placeholder="Nombre y apellido"><input id="f-socio-p" placeholder="Plan"><button onclick="DS.addSocio()">+ Socio</button></div>
        <h4 style="margin-top:18px">🏋️ Clases (cupo)</h4><div class="demo-table">${d.clases.map((c) => `
        <div class="demo-row"><div><strong>${esc(c.nombre)}</strong><small>${c.anotados}/${c.cupo}${c.anotados >= c.cupo ? " · LLENA" : ""}</small></div><button onclick="DS.anotarClase('${c.id}')">Anotar</button></div>`).join("")}</div>
        <h4 style="margin-top:18px">💳 Pagos</h4><div class="demo-table">${d.pagos.map((p) => `<div class="demo-row"><div><strong>${esc(p.socio)}</strong><small>${p.id} · ${p.fecha}</small></div><strong>${money(p.monto)}</strong></div>`).join("")}</div>`;
    }
    if (sys === "peluqueria") {
      const d = DB;
      return `<h4>📅 Agenda (pendiente → confirmado → en curso → realizado → cobrado)</h4><div class="demo-table">${d.turnos.map((t) => `
        <div class="demo-row"><div><strong>${esc(t.hora)} · ${esc(t.cliente)}</strong><small>${esc(t.servicio)} · con ${esc(t.prof)}</small></div>
        <span class="pill ${t.estado === "Cobrado" ? "ok" : ""}">${t.estado}</span>
        <button onclick="DS.toggleTurno('${t.id}')">Avanzar →</button><button class="ghost" onclick="DS.delTurno('${t.id}')">✕</button></div>`).join("")}</div>
        <div class="demo-form"><input id="f-turno-c" placeholder="Cliente"><input id="f-turno-s" placeholder="Servicio"><input id="f-turno-h" placeholder="Día/hora"><button onclick="DS.addTurno()">+ Turno</button></div>
        <h4 style="margin-top:18px">💈 Profesionales</h4><div class="demo-table">${d.profesionales.map((p) => `<div class="demo-row"><div><strong>${esc(p.nombre)}</strong><small>Comisión ${p.comision}%</small></div></div>`).join("")}</div>`;
    }
    if (sys === "talleres") {
      const d = DB;
      const list = d.ordenes.filter((o) => !otQ || (o.patente + o.cliente).toLowerCase().includes(otQ.toLowerCase()));
      return `<h4>🔧 Órdenes (ingresado → ... → entregado)</h4>
        <div class="demo-form" style="margin-bottom:12px"><input placeholder="🔍 Buscar por patente..." value="${esc(otQ)}" oninput="DS.buscarOT(this.value)"><span class="muted">${d.ordenes.length} órdenes</span></div>
        <div class="demo-table">${list.map((o) => `
        <div class="demo-row"><div><strong>${o.id} · ${esc(o.patente)} · ${esc(o.cliente)}</strong><small>${esc(o.vehiculo)} · ${esc(o.trabajo)} · ${money(o.presupuesto)}</small></div>
        <span class="pill ${o.estado === "Listo" ? "ok" : ""}">${o.estado}</span>
        <button onclick="DS.avanzarOT('${o.id}')">Avanzar →</button>${o.estado === "Listo" ? `<button onclick="DS.cobrarOT('${o.id}')">Cobrar</button>` : ""}
        <button class="ghost" onclick="DS.delOT('${o.id}')">✕</button></div>`).join("")}</div>
        <div class="demo-form"><input id="f-ot-c" placeholder="Patente + cliente"><input id="f-ot-t" placeholder="Trabajo"><input id="f-ot-p" type="number" placeholder="Presupuesto"><button onclick="DS.addOT()">+ Orden</button></div>
        <p class="muted" style="margin-top:10px">📋 El sistema real suma control de ingreso imprimible (golpes, checklist, fotos, firmas).</p>`;
    }
    if (sys === "hotel") {
      const d = DB;
      return `<h4>🏨 Recepción (libre · reservada · ocupada · limpieza)</h4><div class="demo-table">${d.habitaciones.map((h) => {
        const saldo = h.noches * h.precio + h.consumos - h.anticipo;
        return `<div class="demo-row"><div><strong>Hab ${esc(h.nro)} · ${esc(h.estado)}</strong><small>${esc(h.huesped || "—")}${h.estado === "Ocupada" ? ` · ${h.noches}n x ${money(h.precio)} + ${money(h.consumos)} − ${money(h.anticipo)} = <strong>${money(saldo)}</strong>` : ""}</small></div>
        <span class="pill ${h.estado === "Libre" ? "ok" : h.estado === "Ocupada" ? "warn" : ""}">${h.estado}</span>
        ${h.estado === "Ocupada" ? `<button onclick="DS.checkoutHab('${h.id}')">Checkout y cobrar</button>` : h.estado === "Limpieza" ? `<button onclick="DS.liberarHab('${h.id}')">Liberar →</button>` : `<button class="ghost" onclick="DS.checkinHab('${h.id}')">Check-in</button>`}</div>`;
      }).join("")}</div>
      <div class="demo-form"><input id="f-hab-h" placeholder="Huésped"><button onclick="DS.checkinLibre()">+ Check-in en libre</button></div>`;
    }
    const d = DB;
    return `<h4>🚿 Playa en vivo (cola → lavando → secando → listo → entregado)</h4><div class="demo-table">${d.turnos.map((t) => `
      <div class="demo-row"><div><strong>${esc(t.patente)} · ${esc(t.cliente)}</strong><small>${esc(t.servicio)} · Op: ${esc(t.operario)}</small></div>
      <span class="pill ${t.estado === "Listo" ? "ok" : ""}">${t.estado}</span>
      <button onclick="DS.avanzarLav('${t.id}')">Avanzar →</button><button onclick="DS.cobrarLav('${t.id}')">Cobrar</button></div>`).join("")}</div>
      <div class="demo-form"><input id="f-lav-p" placeholder="Patente"><input id="f-lav-c" placeholder="Cliente"><input id="f-lav-s" placeholder="Servicio"><button onclick="DS.addLav()">+ Turno</button></div>
      <h4 style="margin-top:18px">🎫 Abonos</h4><div class="demo-table">${d.abonos.map((a) => `<div class="demo-row"><div><strong>${esc(a.cliente)}</strong><small>Saldo ${a.saldo}/${a.total}</small></div></div>`).join("")}</div>`;
  }

  function infoHTML() {
    const s = SYS_INFO[sys];
    return `<div class="sys-info"><strong>${esc(s.nombre)}</strong><p class="muted">${esc(s.desc)}</p>
      <div class="sys-cols"><div><h5>✅ Probá en esta demo</h5><ul>${s.prueba.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div><h5>📦 El sistema completo además incluye</h5><ul>${s.incluye.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div></div>`;
  }
  function render() {
    $("sys-info").innerHTML = infoHTML();
    $("sys-kpis").innerHTML = kpis().map((k) => `<div class="demo-kpi"><small>${k.k}</small><strong>${k.v}</strong></div>`).join("");
    $("sys-body").innerHTML = body();
    tickLock();
  }
  function reset() {
    DB = JSON.parse(JSON.stringify(SEED[sys]));
    extraOn = false;
    if (unlocked()) setExtra(true);
    render(); toast("🔄 Demo reiniciada");
  }
  function buy() {
    const n = SYS_INFO[sys].nombre;
    window.open(`https://wa.me/${DS_WA}?text=${encodeURIComponent(`Hola, me interesa la licencia de ${n} que probé en la demo.`)}`, "_blank");
  }

  const ET = ["Pendiente", "Confirmado", "En curso", "Realizado", "Cobrado"];
  const EO = ["Ingresado", "Diagnosticado", "Presupuestado", "Aprobado", "En reparación", "Listo", "Entregado"];
  const EL = ["En cola", "Lavando", "Secando", "Listo", "Entregado"];

  if (isMaster) setExtra(true);
  document.addEventListener("DOMContentLoaded", render);

  return {
    openKey, closeModal, useKey, reset, buy,
    selMesa: (id) => { selMesa = id; render(); },
    addMesaItem: (gid) => {
      const d = DB, g = d.menu.find((x) => x.id === gid), m = d.mesas.find((x) => x.id === selMesa);
      if (!g || !m) return;
      if (m.estado === "Libre") { m.estado = "Ocupada"; m.mozo = "Demo"; }
      const it = m.items.find((i) => i.nombre === g.nombre);
      if (it) it.qty += 1; else m.items.push({ nombre: g.nombre, qty: 1, precio: g.precio });
      m.total += g.precio;
      if (g.cocina) d.cocina.unshift({ id: "K" + Date.now(), origen: "Mesa " + m.nro, detalle: g.nombre + " x1", estado: "Pendiente" });
      render();
    },
    addDelivery: (gid) => {
      const d = DB, g = d.menu.find((x) => x.id === gid);
      if (!g) return;
      d.pedidos.unshift({ id: "PED-" + Math.floor(30 + Math.random() * 60), detalle: g.nombre + " x1", total: g.precio });
      if (g.cocina) d.cocina.unshift({ id: "K" + Date.now(), origen: "Delivery", detalle: g.nombre + " x1", estado: "Pendiente" });
      render();
    },
    avanzarKDS: (id) => {
      const k = DB.cocina.find((x) => x.id === id);
      if (!k) return;
      if (k.estado === "Pendiente") k.estado = "Preparando";
      else if (k.estado === "Preparando") k.estado = "Listo";
      else DB.cocina = DB.cocina.filter((x) => x.id !== id);
      render();
    },
    cobrarMesa: (id) => {
      const m = DB.mesas.find((x) => x.id === id);
      if (!m || !m.total) return;
      DB.caja += m.total;
      Object.assign(m, { estado: "Libre", mozo: "", items: [], total: 0 });
      render(); toast(`Mesa ${m.nro} cobrada 💰`);
    },
    cobrarPedido: (id) => {
      const i = DB.pedidos.findIndex((p) => p.id === id);
      if (i < 0) return;
      DB.caja += DB.pedidos[i].total;
      DB.pedidos.splice(i, 1);
      render(); toast("Pedido cobrado 💰");
    },
    cobrar: (id) => {
      const s = DB.socios.find((x) => x.id === id);
      if (!s) return;
      s.estado = "Al día";
      DB.pagos.unshift({ id: "CU-" + Math.floor(500 + Math.random() * 500), socio: s.nombre, monto: 15000, fecha: "Hoy (demo)" });
      render(); toast(`Cuota cobrada a ${s.nombre}`);
    },
    checkin: (id) => { const s = DB.socios.find((x) => x.id === id); if (s) toast(s.estado === "Vencida" ? `⚠️ ${s.nombre} debe la cuota` : `✅ Ingreso: ${s.nombre}`); },
    congelar: (id) => { const s = DB.socios.find((x) => x.id === id); if (s) { s.estado = "Congelada"; render(); toast("❄️ Congelada"); } },
    anotarClase: (id) => { const c = DB.clases.find((x) => x.id === id); if (!c) return; if (c.anotados >= c.cupo) return toast("Clase llena"); c.anotados += 1; render(); },
    addSocio: () => {
      const n = val("f-socio-n");
      if (!n) return toast("Falta el nombre");
      DB.socios.push({ id: "S" + Date.now(), nombre: n, plan: val("f-socio-p") || "General", estado: "Al día", vence: "10/11/2026" });
      render();
    },
    delSocio: (id) => { DB.socios = DB.socios.filter((x) => x.id !== id); render(); },
    toggleTurno: (id) => {
      const t = DB.turnos.find((x) => x.id === id);
      if (!t) return;
      t.estado = ET[(ET.indexOf(t.estado) + 1) % ET.length];
      render();
      if (t.estado === "Cobrado") toast("Turno cobrado 💰");
    },
    addTurno: () => {
      const c = val("f-turno-c"), s = val("f-turno-s");
      if (!c || !s) return toast("Falta cliente o servicio");
      DB.turnos.push({ id: "T" + Date.now(), cliente: c, servicio: s, prof: "A asignar", hora: val("f-turno-h") || "A convenir", estado: "Pendiente" });
      render();
    },
    delTurno: (id) => { DB.turnos = DB.turnos.filter((x) => x.id !== id); render(); },
    avanzarOT: (id) => {
      const o = DB.ordenes.find((x) => x.id === id);
      if (!o) return;
      o.estado = EO[Math.min(EO.indexOf(o.estado) + 1, EO.length - 1)];
      render();
    },
    cobrarOT: (id) => {
      const o = DB.ordenes.find((x) => x.id === id);
      if (!o) return;
      o.estado = "Entregado"; render(); toast(`Orden ${o.id} cobrada ${money(o.presupuesto)} ✅`);
    },
    buscarOT: (v) => {
      otQ = v;
      const q = otQ.toLowerCase();
      document.querySelectorAll("#sys-body .demo-table .demo-row").forEach((r) => { r.style.display = !q || r.textContent.toLowerCase().includes(q) ? "" : "none"; });
    },
    addOT: () => {
      const c = val("f-ot-c"), t = val("f-ot-t");
      if (!c || !t) return toast("Falta cliente o trabajo");
      DB.ordenes.push({ id: "OT-" + Math.floor(200 + Math.random() * 300), patente: c.toUpperCase(), cliente: c, vehiculo: "-", trabajo: t, presupuesto: parseInt(val("f-ot-p") || "0", 10), estado: "Ingresado" });
      render();
    },
    delOT: (id) => { DB.ordenes = DB.ordenes.filter((x) => x.id !== id); render(); },
    checkoutHab: (id) => {
      const h = DB.habitaciones.find((x) => x.id === id);
      if (!h) return;
      const saldo = h.noches * h.precio + h.consumos - h.anticipo;
      Object.assign(h, { estado: "Limpieza", huesped: "", noches: 0, consumos: 0, anticipo: 0 });
      render(); toast(`Checkout Hab ${h.nro} · ${money(Math.max(0, saldo))} 🧹`);
    },
    liberarHab: (id) => { const h = DB.habitaciones.find((x) => x.id === id); if (h) { h.estado = "Libre"; render(); } },
    checkinHab: (id) => { const h = DB.habitaciones.find((x) => x.id === id); if (h) { Object.assign(h, { estado: "Ocupada", huesped: "Huésped demo", noches: 2 }); render(); } },
    checkinLibre: () => {
      const h = DB.habitaciones.find((x) => x.estado === "Libre");
      if (!h) return toast("Sin habitaciones libres");
      Object.assign(h, { estado: "Ocupada", huesped: val("f-hab-h") || "Huésped demo", noches: 2 });
      render();
    },
    avanzarLav: (id) => {
      const t = DB.turnos.find((x) => x.id === id);
      if (!t) return;
      t.estado = EL[Math.min(EL.indexOf(t.estado) + 1, EL.length - 1)];
      render();
    },
    cobrarLav: (id) => {
      const i = DB.turnos.findIndex((x) => x.id === id);
      if (i < 0) return;
      DB.turnos.splice(i, 1);
      render(); toast("Servicio cobrado 💰🚗");
    },
    addLav: () => {
      const p = val("f-lav-p");
      if (!p) return toast("Falta la patente");
      DB.turnos.push({ id: "L" + Date.now(), patente: p.toUpperCase(), cliente: val("f-lav-c") || "-", servicio: val("f-lav-s") || "Completo", estado: "En cola", operario: "-" });
      render();
    },
  };
})();
