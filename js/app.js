const $ = id => document.getElementById(id);
const movil = innerWidth <= 820;
// Zoom mínimo tal que el mundo siempre cubra la ventana (evita ver el gris de los bordes).
const minZoomPara = (w, h) => Math.max(2, Math.ceil(Math.log2(Math.max(256, Math.max(w, h)) / 256)));
const map = L.map('map', {
  zoomControl: false,
  minZoom: minZoomPara(innerWidth, innerHeight),
  // No se puede arrastrar fuera del mundo.
  maxBounds: [[-85, -179], [85, 179]],
  maxBoundsViscosity: 1.0
}).setView([-30, -68], 4);
window.addEventListener('resize', () => {
  map.invalidateSize();
  map.setMinZoom(minZoomPara(map.getSize().x, map.getSize().y));
});
L.control.zoom({ position: 'bottomright' }).addTo(map);

const esri = (capa, max) => L.tileLayer(
  `https://server.arcgisonline.com/ArcGIS/rest/services/${capa}/MapServer/tile/{z}/{y}/{x}`,
  { maxZoom: max, attribution: 'Tiles © Esri' });
const oscuro = L.layerGroup([esri('Canvas/World_Dark_Gray_Base', 16), esri('Canvas/World_Dark_Gray_Reference', 16)]);
const satelite = L.layerGroup([esri('World_Imagery', 18), esri('Reference/World_Boundaries_and_Places', 18)]);
oscuro.addTo(map);
L.control.layers({ 'Oscuro': oscuro, 'Satélite': satelite, 'Calles': esri('World_Street_Map', 18) }, null,
  { collapsed: movil, position: movil ? 'topright' : 'bottomright' }).addTo(map);

[['Argentina', -36, -65, 1], ['Chile', -31, -73.2, 0], ['Uruguay', -32.8, -55.8, 0], ['Paraguay', -23.4, -58.4, 0],
 ['Bolivia', -16.5, -64.7, 0], ['Perú', -9.5, -75, 0], ['Brasil', -11, -52, 1]].forEach(([n, lat, lng, g]) =>
  L.marker([lat, lng], { interactive: false, keyboard: false,
    icon: L.divIcon({ className: 'pais' + (g ? ' grande' : ''), html: `<span>${n}</span>`, iconSize: [0, 0] }) }).addTo(map));
const ajustarZoom = () => { const c = map.getContainer().classList; c.toggle('zoom-alto', map.getZoom() > 7); c.toggle('zoom-bajo', map.getZoom() < 5); };
map.on('zoomend', ajustarZoom); ajustarZoom();

const $detalle = $('detalle'), visor = $('visor');

const obrasToggle = $('obras-toggle');
let listadoAbierto = !matchMedia('(max-width: 820px)').matches;

function actualizarListado() {
  document.body.classList.toggle('lista-abierta', listadoAbierto);
  if (obrasToggle) {
    obrasToggle.hidden = listadoAbierto;
    obrasToggle.setAttribute('aria-expanded', String(listadoAbierto));
  }
}

function abrirListado() {
  listadoAbierto = true;
  actualizarListado();
  map.invalidateSize();
}

function cerrarListado() {
  listadoAbierto = false;
  actualizarListado();
  map.invalidateSize();
}

if (obrasToggle) obrasToggle.addEventListener('click', abrirListado);
actualizarListado();

const PAISES_BASE = ['Argentina', 'Chile', 'Perú', 'Brasil', 'México', 'Ecuador'];
const PAISES = [...new Set([...PAISES_BASE, ...OBRAS.map(o => o.pais)])];
const f = { pais: 'Todos', tipo: null, q: '' };
const color = o => COLORES[o.tipo] || '#ccc';
const usd = n => !n ? 's/d' : 'US$ ' + (n >= 1e9 ? (n / 1e9).toLocaleString('es-AR') + ' mil M' : (n / 1e6).toLocaleString('es-AR') + ' M');

// ---- Tarjeta de responsable: la persona a cargo de una obra o de un país ----
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const iniciales = n => String(n || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
const fotoUrl = u => (typeof fotoPerfil === 'function' ? fotoPerfil(u) : u) || '';
const clave = p => (typeof clavePais === 'function' ? clavePais(p) : String(p ?? '').toLowerCase());
const responsablePais = p => (typeof RESPONSABLES_PAIS !== 'undefined' && RESPONSABLES_PAIS[clave(p)]) || null;

function tarjetaResp({ rol, nombre, cargo, foto, stats = [], variante = '' }) {
  const f = fotoUrl(foto);
  const img = f ? `<img src="${escH(f)}" alt="${escH(nombre)}" loading="lazy" onerror="this.parentNode.classList.add('sin-foto');this.remove()">` : '';
  const st = stats.filter(Boolean).filter(([v]) => v !== null && v !== undefined && v !== '')
    .map(([v, l]) => `<div><b>${v}</b><span>${escH(l)}</span></div>`).join('');
  return `<div class="resp${variante ? ' ' + variante : ''}">`
    + `<div class="resp-ava${f ? '' : ' sin-foto'}" data-ini="${escH(iniciales(nombre))}">${img}</div>`
    + `<div class="resp-txt"><p class="resp-rol">${escH(rol)}</p><b class="resp-nom">${escH(nombre)}</b>`
    + (cargo ? `<span class="resp-cargo">${escH(cargo)}</span>` : '') + `</div>`
    + (st ? `<div class="resp-stats">${st}</div>` : '') + `</div>`;
}

// Responsable de la obra; si no hay, cae al responsable del país.
function datosResponsable(o) {
  if (o.responsable && (o.responsable.nombre || o.responsable.foto))
    return { rol: 'Responsable de obra', nombre: o.responsable.nombre, cargo: o.responsable.cargo, foto: o.responsable.foto };
  const p = responsablePais(o.pais);
  if (p && (p.responsable || p.foto))
    return { rol: 'Responsable del país', nombre: p.responsable, cargo: p.cargo, foto: p.foto };
  return null;
}

// Detalle de la obra: solo el responsable de la obra (si falta, cae al del país).
function bloqueResponsable(o) {
  const r = datosResponsable(o);
  if (!r) return '';
  return tarjetaResp({ ...r, variante: 'resp--destacada' });
}

// Miniatura de la obra para el listado: usa la primera foto de la columna "Fotos".
function fotoMini(o) {
  const foto = (o.fotos || []).find(Boolean);
  if (!foto) return '';
  return `<span class="obra-foto"><img src="${escH(fotoUrl(foto))}" alt="" loading="lazy" onerror="this.parentNode.style.display='none'"></span>`;
}
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const visibles = () => OBRAS.filter(o => (f.pais === 'Todos' || o.pais === f.pais) && (!f.tipo || o.tipo === f.tipo) &&
  (!f.q || norm([o.nombre, o.ubicacion, o.pais, o.tipo, o.descripcion, ...o.colaboradores].join(' ')).includes(norm(f.q))));
// Área realmente visible del mapa: descuenta el encabezado arriba y la barra inferior.
const margen = () => {
  if (innerWidth > 820) return { paddingTopLeft: [470, 90], paddingBottomRight: [30, 90] };
  const h = document.querySelector('#ui header.card');
  let arriba = h ? h.getBoundingClientRect().bottom : 170;
  const ctrl = document.querySelector('.obras-controls');
  if (ctrl) { const r = ctrl.getBoundingClientRect(); if (r.height > 0) arriba = Math.max(arriba, r.bottom); }
  const barra = document.getElementById('exec-toggle');
  const abajo = (barra && !barra.hidden) ? (innerHeight - barra.getBoundingClientRect().top) : 80;
  return {
    paddingTopLeft: [20, Math.round(Math.max(60, arriba + 10))],
    paddingBottomRight: [20, Math.round(Math.max(40, abajo + 10))]
  };
};
let actual = null, urlsMapa = [], urlsGal = [];
const capa = L.layerGroup().addTo(map);

const abrirDB = () => new Promise((ok, mal) => {
  const r = indexedDB.open('megaobras', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('fotos', { keyPath: 'id', autoIncrement: true }).createIndex('obra', 'obra');
  r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
});
const pedir = async (modo, fn) => {
  const d = await abrirDB();
  return new Promise((ok, mal) => { const q = fn(d.transaction('fotos', modo).objectStore('fotos')); q.onsuccess = () => ok(q.result); q.onerror = () => mal(q.error); });
};
const todasLasFotos = () => pedir('readonly', s => s.getAll());
const fotosDe = obra => pedir('readonly', s => s.index('obra').getAll(obra));
const guardarFoto = (obra, blob, nombre) => pedir('readwrite', s => s.add({ obra, blob, nombre }));
const borrarFoto = id => pedir('readwrite', s => s.delete(id));

async function reducir(file) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(ok => c.toBlob(b => ok(b || file), 'image/jpeg', 0.85));
  } catch { return file; }
}

async function dibujar() {
  let subidas = []; try { subidas = await todasLasFotos(); } catch {}
  urlsMapa.forEach(u => URL.revokeObjectURL(u)); urlsMapa = [];
  capa.clearLayers();
  const vis = visibles(); let fotosTotal = 0;
  vis.forEach(o => {
    const mias = subidas.filter(x => x.obra === o.id);
    const n = o.fotos.length + mias.length; fotosTotal += n;
    let thumb = o.fotos[0] || null;
    if (!thumb && mias[0]) { thumb = URL.createObjectURL(mias[0].blob); urlsMapa.push(thumb); }
    const cuerpo = thumb ? `<em class="foto"><img src="${thumb}" alt="">${n > 1 ? `<b>${n}</b>` : ''}</em>` : '<i></i>';
    const icon = L.divIcon({ className: '', iconSize: [0, 0],
      html: `<div class="pin${thumb ? ' con-foto' : ''}${o.id === actual ? ' sel' : ''}" data-id="${o.id}" style="--c:${color(o)}">${cuerpo}<span>${o.nombre.split(' · ')[0]}</span></div>` });
    L.marker(o.coordenadas, { icon, title: o.nombre }).addTo(capa).on('click', () => seleccionar(o.id))
      .bindTooltip(`<b>${o.nombre}</b><br>${o.pais} · ${usd(o.inversion_usd)}<br>${o.estado}<br><small>Tocá para ver</small>`,
        { direction: 'top', offset: [0, thumb ? -32 : -12], className: 'tip' });
    if (o.ruta) L.polyline(o.ruta, { color: color(o), weight: 4, dashArray: '8 6' }).addTo(capa);
  });
  const fecha = new Date(ACTUALIZADO + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  const $stats = $('stats');
  if ($stats) {
    $stats.innerHTML = [[usd(vis.reduce((t, o) => t + o.inversion_usd, 0)), 'Inversión total'], [vis.length, 'Cantidad de Obras'],
      [new Set(vis.map(o => o.pais)).size, 'Cantidad de Países'], [fotosTotal, 'Imagenes Cargadas'], [fecha, 'Ultima Actualización']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
  }

  if (window.pintarEjecutivo) window.pintarEjecutivo(vis);
}

function ajustarMapa() {
  const pts = visibles().flatMap(o => o.ruta || [o.coordenadas]);
  if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(0.25), { ...margen(), maxZoom: 7, duration: 0.9 });
}

function pintarFiltros() {
  const $paises = $('paises'), $tipos = $('tipos');
  if ($paises) {
    $paises.innerHTML = ['Todos', ...PAISES].map(p => {
      const n = p === 'Todos' ? OBRAS.length : OBRAS.filter(o => o.pais === p).length;
      return `<button data-pais="${p}" aria-pressed="${f.pais === p}">${p}<sup>${n}</sup></button>`;
    }).join('');
  }
  if ($tipos) {
    $tipos.innerHTML = Object.keys(COLORES).filter(t => OBRAS.some(o => o.tipo === t)).map(t =>
      `<button data-tipo="${t}" style="--c:${COLORES[t]}" aria-pressed="${f.tipo === t}">${t}</button>`).join('');
  }
  // En mobile los filtros están plegados: el botón muestra qué hay activo.
  const $fl = $('filtros-label');
  if ($fl) {
    const act = [f.pais !== 'Todos' ? f.pais : null, f.tipo, f.q].filter(Boolean);
    $fl.textContent = act.length ? 'Filtros · ' + act.join(' · ') : 'Filtros';
  }
}
function refrescar() { pintarFiltros(); mostrarLista(); dibujar(); ajustarMapa(); }
if ($('paises')) $('paises').onclick = e => { const b = e.target.closest('[data-pais]'); if (b) { f.pais = b.dataset.pais; refrescar(); } };
if ($('tipos')) $('tipos').onclick = e => { const b = e.target.closest('[data-tipo]'); if (b) { f.tipo = f.tipo === b.dataset.tipo ? null : b.dataset.tipo; refrescar(); } };
if ($('buscar')) $('buscar').oninput = e => { f.q = e.target.value.trim(); mostrarLista(); dibujar(); ajustarMapa(); };
// Mobile: despliega y pliega países, búsqueda y tipos.
const $filtrosBtn = $('filtros-toggle'), $headerCard = document.querySelector('#ui header.card');
if ($filtrosBtn && $headerCard) {
  $filtrosBtn.onclick = () => {
    const abierto = $headerCard.classList.toggle('filtros-abiertos');
    $filtrosBtn.setAttribute('aria-expanded', String(abierto));
    // Al plegar, el mapa recupera espacio: reencuadramos.
    if (!abierto) setTimeout(() => { map.invalidateSize(); ajustarMapa(); }, 60);
  };
}

// Mobile: anclar la barra inferior al alto VISIBLE real.
// Al abrir la página el navegador reserva el alto de la barra de direcciones y los
// elementos fixed con "bottom" quedan fuera de cuadro hasta que se hace scroll.
let huecoBarra = -1;
function anclarBarraInferior() {
  const vv = window.visualViewport;
  if (!vv) return;
  const hueco = Math.max(0, Math.min(240, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
  document.documentElement.style.setProperty('--barra-abajo', (12 + hueco) + 'px');
  // Si cambió el área visible, el mapa tiene que reacomodarse.
  if (hueco !== huecoBarra) {
    huecoBarra = hueco;
    if (typeof map !== 'undefined') { map.invalidateSize(); ajustarMapa(); }
  }
}
anclarBarraInferior();
addEventListener('load', () => { anclarBarraInferior(); setTimeout(() => { map.invalidateSize(); ajustarMapa(); }, 120); });
addEventListener('resize', anclarBarraInferior);
addEventListener('orientationchange', () => setTimeout(anclarBarraInferior, 180));
if (window.visualViewport) {
  visualViewport.addEventListener('resize', anclarBarraInferior);
  visualViewport.addEventListener('scroll', anclarBarraInferior);
}
setTimeout(anclarBarraInferior, 80);
setTimeout(anclarBarraInferior, 400);

const tarjeta = o => {
  const mini = fotoMini(o);
  return `<button class="obra${mini ? ' con-foto' : ''}" data-id="${o.id}" style="--c:${color(o)}"><span class="dot"></span><b>${o.nombre}</b>
  <span class="monto">${usd(o.inversion_usd)}</span><small>${o.pais} · ${o.tipo} · ${o.estado}</small>
  ${o.avance_pct == null ? '' : `<i class="mini"><u style="width:${o.avance_pct}%"></u></i>`}${mini}</button>`;
};
function mostrarLista() {
  actual = null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  document.querySelectorAll('.pin').forEach(p => p.classList.remove('sel'));
  const v = visibles();
  const $cnt = $('obras-count');
  if ($cnt) $cnt.textContent = v.length;
  
  let contenidoObras;
  if (!v.length) contenidoObras = '<div class="vacio-lista"><p>No hay obras con ese filtro.</p><button class="btn" id="limpiar">Ver todas</button></div>';
  else if (f.pais !== 'Todos') contenidoObras = v.map(tarjeta).join('');
  else contenidoObras = PAISES.map(p => [p, v.filter(o => o.pais === p)]).filter(g => g[1].length)
    .map(([p, l]) => `<h3>${p} · ${l.length}</h3>${l.map(tarjeta).join('')}`).join('');
  
  $detalle.style.removeProperty('--c');
  
  //  Listado izquierdo de obras
  const cabeceraIdentica = `
    <header class="ex-cab" style="padding: 16px 46px 12px 18px; margin: -22px -22px 16px -22px; border-bottom: 1px solid var(--line);">
      <div>
        <p class="ex-sup" style="margin: 0 0 3px; font: 700 10.5px 'JetBrains Mono',monospace; letter-spacing: .16em; text-transform: uppercase; color: var(--verde);">Listado de Obras | Pais </p><br>
        <h2 style="margin: 0; font-size: 20px; letter-spacing: -.02em; font-weight: 800; color: #ffffff;"> Obras </h2>
        <p class="ex-sub" style="margin: 4px 0 0; color: var(--muted); font-size: 12.5px;">${v.length} proyectos</p>
      </div>
      <button class="ex-x" id="btn-cerrar-listado" aria-label="Cerrar listado">✕</button>
    </header>
  `;

  $detalle.classList.remove('detalle-obra');
  $detalle.innerHTML = cabeceraIdentica + `<div class="lista-contenedor">${contenidoObras}</div>`;
  $detalle.scrollTop = 0;

  const btnCerrar = $('btn-cerrar-listado');
  if (btnCerrar) btnCerrar.onclick = cerrarListado;
  if (window.pintarEjecutivo) window.pintarEjecutivo(visibles());
}

function seleccionar(id) {
  const o = OBRAS.find(x => x.id === id);
  actual = id;
  if (!listadoAbierto) abrirListado();
  try { history.replaceState(null, '', '#' + id); } catch {}
  document.querySelectorAll('.pin').forEach(p => p.classList.toggle('sel', p.dataset.id === id));
  map.flyToBounds(L.latLngBounds(o.ruta || [o.coordenadas]).pad(0.6), { ...margen(), maxZoom: 8, duration: 1 });
  const avance = o.avance_pct == null
    ? '<p class="nota">Avance: sin dato verificado todavía.</p>'
    : `<div class="barra" role="progressbar" aria-valuenow="${o.avance_pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${o.avance_pct}%"></i></div>
       <p class="nota">Avance: ${o.avance_pct} %</p>`;
  $detalle.style.setProperty('--c', color(o));
  $detalle.classList.add('detalle-obra');
  $detalle.innerHTML = `
    <div class="fila"><button class="cerrar" id="volver">← Todas las obras</button>
      <span class="nav"><button class="cerrar" id="prev" aria-label="Obra anterior">‹</button><button class="cerrar" id="next" aria-label="Obra siguiente">›</button></span></div>
    <p class="etiquetas"><span class="tipo">${o.tipo}</span> <span class="pais-tag">${o.pais}</span></p>
    <h2>${o.nombre}</h2>
    <p class="ubic">${o.ubicacion}</p>
    ${bloqueResponsable(o)}
    <div class="kpis">
      <div class="kpi"><b>${usd(o.inversion_usd)}</b><span>Inversión</span></div>
      <div class="kpi"><b>${o.estado}</b><span>Estado</span></div>
    </div>
    <p class="nota" style="margin:0 0 12px">${o.inversion_nota || ''}</p>
    ${avance}
    <h3>Sobre la obra</h3>
    <p class="desc">${o.descripcion}</p>
    <div class="kpis">${o.datos.map(d => `<div class="kpi"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('')}</div>
    <h3>Colaboradores</h3>
    <ul>${o.colaboradores.map(c => `<li>${c}</li>`).join('')}</ul>
    <h3>Avances e hitos</h3>
    <ul class="hitos">${o.hitos.map(h => `<li><small>${h.fecha}</small>${h.texto}</li>`).join('')}</ul>
    <h3>Imágenes</h3>
    <button class="btn" data-abrir>Subir fotos a esta obra</button>
    <div class="galeria" id="galeria"></div>
    <h3>Fuentes</h3>
    <ul>${o.fuentes.map(x => `<li><a href="${x.url}" target="_blank" rel="noopener">${x.texto}</a></li>`).join('')}</ul>`;
  $detalle.scrollTop = 0;
  pintarGaleria();
  if (window.pintarEjecutivo) window.pintarEjecutivo(visibles());
}

async function pintarGaleria() {
  const o = OBRAS.find(x => x.id === actual), $g = $('galeria');
  if (!o || !$g) return;
  urlsGal.forEach(u => URL.revokeObjectURL(u)); urlsGal = [];
  let subidas = []; try { subidas = await fotosDe(o.id); } catch {}
  const todas = [...o.fotos.map(src => ({ src })), ...subidas.map(x => { const src = URL.createObjectURL(x.blob); urlsGal.push(src); return { src, id: x.id }; })];
  $g.innerHTML = todas.length
    ? todas.map(x => `<figure><img src="${x.src}" alt="Foto de ${o.nombre}">${x.id ? `<button class="borrar" data-id="${x.id}" aria-label="Borrar imagen">×</button>` : ''}</figure>`).join('')
    : '<div class="vacio">Todavía no hay imágenes de esta obra.</div>';
}

$detalle.addEventListener('click', async e => {
  const t = e.target, card = t.closest('.obra');
  if (card) return seleccionar(card.dataset.id);
  if (t.closest('#volver')) { mostrarLista(); return ajustarMapa(); }
  if (t.closest('#prev') || t.closest('#next')) {
    const v = visibles(), i = v.findIndex(o => o.id === actual), d = t.closest('#next') ? 1 : -1;
    return seleccionar(v[(i + d + v.length) % v.length].id);
  }
  if (t.closest('#limpiar')) { Object.assign(f, { pais: 'Todos', tipo: null, q: '' }); if ($('buscar')) $('buscar').value = ''; return refrescar(); }
  if (t.closest('[data-abrir]')) return abrirSubida();
  const b = t.closest('.borrar');
  if (b) { await borrarFoto(Number(b.dataset.id)); dibujar(); return pintarGaleria(); }
  const img = t.closest('.galeria img');
  if (img) { visor.querySelector('img').src = img.src; visor.showModal(); }
});
if (visor) visor.onclick = () => visor.close();

const $modal = $('subida'), $sel = $('obra-sel'), $msg = $('msg'), zona = $('zona');
if ($sel) $sel.innerHTML = OBRAS.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('');
function abrirSubida() { if ($sel) $sel.value = actual || visibles()[0]?.id || OBRAS[0].id; if ($msg) $msg.textContent = ''; if ($modal) $modal.showModal(); }
if ($('cta')) $('cta').onclick = abrirSubida;
if ($('cerrar-modal')) $('cerrar-modal').onclick = () => $modal.close();

async function importar(files) {
  const imgs = [...files].filter(f => f.type.startsWith('image/'));
  if (!imgs.length) { if ($msg) $msg.textContent = 'No encontré imágenes. Para una carpeta, usá "Importar carpeta".'; return; }
  if ($msg) $msg.textContent = `Importando ${imgs.length}…`;
  try {
    for (const f of imgs) await guardarFoto($sel.value, await reducir(f), f.name);
    if ($msg) $msg.textContent = `${imgs.length} imagen(es) agregada(s) a esta obra.`;
  } catch { if ($msg) $msg.textContent = 'No se pudieron guardar las imágenes.'; }
  dibujar(); pintarGaleria();
}
for (const id of ['subir', 'carpeta']) if ($(id)) $(id).onchange = e => { importar(e.target.files); e.target.value = ''; };
if (zona) {
  zona.ondragover = e => { e.preventDefault(); zona.classList.add('sobre'); };
  zona.ondragleave = () => zona.classList.remove('sobre');
  zona.ondrop = e => { e.preventDefault(); zona.classList.remove('sobre'); importar(e.dataTransfer.files); };
}

pintarFiltros();
const inicio = OBRAS.find(o => o.id === location.hash.slice(1));
dibujar();
if (inicio) seleccionar(inicio.id); else { mostrarLista(); ajustarMapa(); }

// Aviso visible si la fuente de datos falló o si no quedó ninguna obra para mostrar.
function mostrarAvisoDatos() {
  const el = $('aviso-datos');
  if (!el) return;
  const err = window.ERROR_FUENTE;
  const info = window.ORIGEN_DATOS || { n: OBRAS.length, origen: '', omitidas: [] };
  if (!err && info.n > 0) { el.hidden = true; return; }
  const detalle = err || 'La fuente no devolvió obras válidas.';
  el.innerHTML = '<b>⚠ No se pudieron cargar los datos</b>'
    + `<span>${escH(detalle)}${info.origen ? ' · ' + escH(info.origen) : ''}</span>`
    + '<button class="btn" id="aviso-reintentar">Reintentar</button>';
  el.hidden = false;
  const b = $('aviso-reintentar');
  if (b) b.onclick = () => location.reload();
}
mostrarAvisoDatos();
