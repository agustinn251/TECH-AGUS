// Capa de datos: convierte filas de Excel/CSV/JSON/SharePoint en proyectos del mapa.
(() => {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const K = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Nombres de columna aceptados (sin tildes ni mayúsculas). "title" es la columna Título de SharePoint.
  const SIN = {
    id: ['id', 'codigo'], sigla: ['sigla'], nombre: ['nombre', 'proyecto', 'obra', 'title', 'titulo'],
    mercado: ['mercado', 'tipo', 'categoria'], pais: ['pais'], cliente: ['cliente'], ubicacion: ['ubicacion', 'lugar'],
    lat: ['latitud', 'lat'], lng: ['longitud', 'lng', 'lon'], coordenadas: ['coordenadas'], inversion: ['inversionusd', 'inversion', 'monto'],
    inversion_nota: ['inversionnota', 'notainversion'], estado: ['estado', 'estadoobra'], estado_csv: ['estadolistado', 'estadocsv', 'estadogestion'],
    prioridad: ['prioridad'], inicio: ['inicio', 'fechainicio', 'anioinicio'], fin: ['fin', 'fechafin', 'aniofin'], avance: ['avancepct', 'avance'],
    descripcion: ['descripcion', 'resumen'], colaboradores: ['colaboradores'], hitos: ['hitos'], datos: ['datos', 'datosclave'],
    fuentes: ['fuentes', 'fuente'], fotos: ['fotos', 'imagenes'], ruta: ['ruta', 'trazado'], sin_suma: ['sinsuma']
  };
  // Varios valores en una celda: uno por línea (Alt+Enter en Excel) o separados por ";" si no hay saltos de línea.
  const lista = v => Array.isArray(v) ? v : (t => (t.includes('\n') ? t.split(/\r?\n/) : t.split(';')).map(x => x.trim()).filter(Boolean))(String(v ?? ''));
  const unir = a => { const t = a.join('\n'); return a.length === 1 && t.includes(';') ? t + '\n' : t; };
  const partir = t => { const i = String(t).indexOf('|'); return i < 0 ? [String(t).trim(), ''] : [t.slice(0, i).trim(), t.slice(i + 1).trim()]; };
  const num = v => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    let t = String(v ?? '').trim().replace(/[^\d.,-]/g, ''); if (!t) return null;
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); else t = t.replace(',', '.');
    const n = parseFloat(t); return Number.isFinite(n) ? n : null;
  };
  const cap = s => s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;
  const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+]+/g, '-').replace(/^-|-$/g, '');

  function normalizar(fila) {
    const m = {}; Object.keys(fila).forEach(k => m[K(k)] = fila[k]);
    const g = c => { for (const s of SIN[c]) if (m[s] !== undefined && m[s] !== null && m[s] !== '') return m[s]; return undefined; };
    const nombre = String(g('nombre') ?? '').trim(); if (!nombre) return { omitida: 'fila sin nombre' };
    let lat = num(g('lat')), lng = num(g('lng')); const co = g('coordenadas');
    if ((lat == null || lng == null) && Array.isArray(co)) { lat = num(co[0]); lng = num(co[1]); }
    if (lat == null || lng == null || Math.abs(lat) > 90 || Math.abs(lng) > 180) return { omitida: `${nombre}: faltan o son inválidas la latitud y la longitud` };
    let av0 = num(g('avance')); if (av0 != null && av0 > 0 && av0 < 1) av0 = Math.round(av0 * 1000) / 10;
    let est = String(g('estado') ?? '').trim(), ec = String(g('estado_csv') ?? '').trim();
    // Si la planilla no trae Estado, se calcula con tu función obtenerEstadoPorAvance (data/obras.js).
    if (!est && av0 != null && typeof obtenerEstadoPorAvance === 'function') est = obtenerEstadoPorAvance(av0);
    if (!ec) ec = ['activo', 'operativo', 'parcial', 'finalizado'].includes(K(est)) ? cap(K(est)) : /final|termin/i.test(est) ? 'Finalizado' : /operativ/i.test(est) ? 'Operativo' : /parcial/i.test(est) ? 'Parcial' : 'Activo';
    else ec = cap(ec);
    if (!est) est = ec;
    const mercado = String(g('mercado') ?? 'Sin clasificar').trim(), sigla = String(g('sigla') ?? '—').trim();
    const ruta = (Array.isArray(g('ruta')) ? g('ruta') : lista(g('ruta')).map(p => p.split(',').map(num))).filter(p => p.length === 2 && p.every(x => x != null));
    let av = num(g('avance')); if (av != null && av > 0 && av < 1) av = Math.round(av * 1000) / 10;
    const inv = num(g('inversion')), desc = String(g('descripcion') ?? '').trim();
    const hitos = lista(g('hitos')).map(h => typeof h === 'object' ? h : (([f, t]) => ({ fecha: t ? f : '', texto: t || f }))(partir(h)));
    const datos = lista(g('datos')).map(d => typeof d === 'object' ? d : (([v, e]) => ({ valor: v, etiqueta: e }))(partir(d)));
    const fuentes = lista(g('fuentes')).map(x => { if (typeof x === 'object') return x; const [a, b] = partir(x); return b ? { texto: a, url: b } : { texto: a.replace(/^https?:\/\/(www\.)?/, '').split('/')[0], url: a }; });
    return { obra: {
      id: String(g('id') ?? (sigla !== '—' ? slug(sigla) : slug(nombre))), sigla, nombre, pais: String(g('pais') ?? '—').trim(), cliente: String(g('cliente') ?? '—').trim(),
      mercado, tipo: mercado, inicio: String(g('inicio') ?? '—'), fin: String(g('fin') ?? '—'), estado_csv: ec, prioridad: cap(String(g('prioridad') ?? 'Sin definir').trim()) || 'Sin definir',
      ubicacion: String(g('ubicacion') ?? '').trim(), coordenadas: [lat, lng], ...(ruta.length > 1 ? { ruta } : {}),
      inversion_usd: inv, inversion_nota: String(g('inversion_nota') ?? (inv ? 'Monto informado en la planilla.' : 'Sin dato de inversión verificado.')),
      avance_pct: av, estado: est, descripcion: desc, datos, colaboradores: lista(g('colaboradores')), hitos, fotos: lista(g('fotos')), fuentes,
      ...(desc ? {} : { basica: true }), ...(/^(si|sí|1|true|x|yes)$/i.test(String(g('sin_suma') ?? '').trim()) ? { sin_suma: true } : {})
    } };
  }
  function normalizarTodo(filas) {
    const obras = [], omitidas = [], ids = new Set();
    filas.forEach(f => { const r = normalizar(f); if (r.obra) { let id = r.obra.id, n = 2; while (ids.has(id)) id = r.obra.id + '-' + n++; ids.add(id); obras.push({ ...r.obra, id }); } else omitidas.push(r.omitida); });
    return { obras, omitidas };
  }
  const aFilas = o => ({ ID: o.id, Nombre: o.nombre, Tipo: o.tipo, Pais: o.pais, Ubicacion: o.ubicacion,
    Latitud: o.coordenadas[0], Longitud: o.coordenadas[1], InversionUSD: o.inversion_usd ?? '', InversionNota: o.inversion_nota ?? '', Estado: o.estado,
    AvancePct: o.avance_pct ?? '', Descripcion: o.descripcion, Colaboradores: unir(o.colaboradores), Hitos: unir(o.hitos.map(h => `${h.fecha}|${h.texto}`)),
    Datos: unir(o.datos.map(d => `${d.valor}|${d.etiqueta}`)), Fuentes: unir(o.fuentes.map(x => `${x.texto}|${x.url}`)), Fotos: unir(o.fotos), Ruta: (o.ruta || []).map(p => p.join(',')).join('; ') });

  // ---- lectura de archivos ----
  const cargarScript = src => new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); });
  const sheetjs = async () => { if (!root.XLSX) await cargarScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'); return root.XLSX; };
  function textoDe(buf) { try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { return new TextDecoder('windows-1252').decode(buf); } }
  function parseCSV(t) {
    t = t.replace(/^\uFEFF/, ''); const cab = t.split(/\r?\n/, 1)[0], d = [';', ',', '\t'].sort((a, b) => cab.split(b).length - cab.split(a).length)[0];
    const filas = []; let fila = [], campo = '', q = false;
    for (let i = 0; i < t.length; i++) { const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c; }
      else if (c === '"') q = true; else if (c === d) { fila.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; fila.push(campo); campo = ''; if (fila.some(x => x !== '')) filas.push(fila); fila = []; }
      else campo += c; }
    if (campo !== '' || fila.length) { fila.push(campo); if (fila.some(x => x !== '')) filas.push(fila); }
    const [h, ...r] = filas; return r.map(f => Object.fromEntries(h.map((k, i) => [k.trim(), (f[i] ?? '').trim()])));
  }
  async function desdeBuffer(buf, nombre) {
    const ext = String(nombre).split('?')[0].split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') { const X = await sheetjs(), wb = X.read(buf, { type: 'array' }); const hoja = wb.Sheets['Proyectos'] || wb.Sheets[wb.SheetNames[0]]; return X.utils.sheet_to_json(hoja, { defval: '' }); }
    const t = textoDe(buf);
    if (ext === 'json') { const j = JSON.parse(t); return Array.isArray(j) ? j : j.obras || j.value || []; }
    return parseCSV(t);
  }
  const leerArchivo = async f => desdeBuffer(await f.arrayBuffer(), f.name);
  async function leerUrl(url) { const r = await fetch(url, { credentials: 'include' }); if (!r.ok) throw new Error(`La URL respondió ${r.status}`); return desdeBuffer(await r.arrayBuffer(), url); }
  async function leerSharePoint(c) {
    if (location.protocol === 'file:') throw new Error('SharePoint necesita abrir el mapa desde https o http://localhost, no como archivo.');
    if (!c || !c.tenantId || !c.clientId) throw new Error('Faltan tenantId y clientId en js/config.js.');
    await cargarScript('https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js');
    const app = new msal.PublicClientApplication({ auth: { clientId: c.clientId, authority: 'https://login.microsoftonline.com/' + c.tenantId, redirectUri: location.origin + location.pathname }, cache: { cacheLocation: 'localStorage' } });
    await app.initialize(); const req = { scopes: ['Sites.Read.All'], account: app.getAllAccounts()[0] };
    const tok = (await app.acquireTokenSilent(req).catch(() => app.acquireTokenPopup(req))).accessToken;
    const gq = async u => { const r = await fetch(u, { headers: { Authorization: 'Bearer ' + tok } }); if (!r.ok) throw new Error(`Graph respondió ${r.status} en ${u.split('?')[0]}`); return r.json(); };
    const sitio = await gq(`https://graph.microsoft.com/v1.0/sites/${c.host}:${c.sitio}`);
    let u = `https://graph.microsoft.com/v1.0/sites/${sitio.id}/lists/${encodeURIComponent(c.lista)}/items?expand=fields&$top=500`, filas = [];
    while (u) { const j = await gq(u); filas.push(...j.value.map(i => i.fields)); u = j['@odata.nextLink']; }
    return filas;
  }
  // ---- guardado local del último archivo importado ----
  const CLAVE = 'megaobras_datos';
  const leerGuardado = () => { try { return JSON.parse(localStorage.getItem(CLAVE)); } catch { return null; } };
  const guardar = (nombre, filas) => localStorage.setItem(CLAVE, JSON.stringify({ nombre, fecha: new Date().toISOString(), filas }));
  const restablecer = () => { try { localStorage.removeItem(CLAVE); } catch {} };
  // ---- carga inicial ----
  const PALETA = ['#ff6a2b', '#b794f6', '#5aa9ff', '#22d3c5', '#f472b6', '#facc15', '#7bd389', '#ff4d6d', '#9ca3af'];
  async function cargar() {
    const cfg = typeof FUENTE !== 'undefined' ? FUENTE : { modo: 'local' }; let filas = null, origen = 'data/obras.js (local)';
    root.ERROR_FUENTE = null;
    try {
      if (cfg.modo === 'url' && cfg.url) { filas = await leerUrl(cfg.url); origen = 'URL configurada'; }
      else if (cfg.modo === 'sharepoint') { filas = await leerSharePoint(cfg.sharepoint); origen = 'SharePoint · lista ' + cfg.sharepoint.lista; }
    } catch (e) { root.ERROR_FUENTE = e.message; filas = null; }
    if (!filas) { const g = leerGuardado(); if (g) { filas = g.filas; origen = 'Importado: ' + g.nombre; } }
    let omitidas = [];
    if (filas) { const r = normalizarTodo(filas); omitidas = r.omitidas;
      if (r.obras.length) OBRAS.splice(0, OBRAS.length, ...r.obras); else { root.ERROR_FUENTE = root.ERROR_FUENTE || 'No encontré proyectos válidos en los datos.'; origen = 'data/obras.js (local)'; } }
    let i = 0; OBRAS.forEach(o => { if (!COLORES[o.mercado]) COLORES[o.mercado] = PALETA[i++ % PALETA.length]; });
    root.ORIGEN_DATOS = { origen, n: OBRAS.length, omitidas };
  }
  // ---- descargas ----
  const bajar = (blob, nombre) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  async function descargarXLSX() { const X = await sheetjs(), wb = X.utils.book_new(); X.utils.book_append_sheet(wb, X.utils.json_to_sheet(OBRAS.map(aFilas)), 'Proyectos'); X.writeFile(wb, 'Proyectos.xlsx'); }
  function descargarCSV() { const f = OBRAS.map(aFilas), cab = Object.keys(f[0]), c = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    bajar(new Blob(['\uFEFF' + [cab.map(c).join(';'), ...f.map(r => cab.map(k => c(r[k])).join(';'))].join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'Proyectos.csv'); }

  root.DATOS = { normalizar, normalizarTodo, aFilas, parseCSV, leerArchivo, guardar, restablecer, leerGuardado, descargarXLSX, descargarCSV };
  root.cargarObras = cargar;
})();
