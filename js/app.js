const $ = id => document.getElementById(id);
const movil = innerWidth <= 820;
// Evita que el mundo se reduzca a una baldosa pequeña y deje franjas negras.
// El mínimo se adapta a la altura de la ventana (zoom 2 como piso).
const zoomMinimo = Math.max(2, Math.ceil(Math.log2(Math.max(256, innerHeight) / 256)));
const map = L.map('map', { zoomControl: false, minZoom: zoomMinimo }).setView([-30, -68], 4);
window.addEventListener('resize', () => {
  map.invalidateSize();
  const nuevoMinimo = Math.max(2, Math.ceil(Math.log2(Math.max(256, map.getSize().y) / 256)));
  map.setMinZoom(nuevoMinimo);
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

// ---- Panel desplegable del listado de obras en móviles ----
const obrasToggle = $('obras-toggle');
const obrasCerrar = $('obras-cerrar');

function abrirListado() {
  document.body.classList.add('lista-abierta');
  obrasToggle.setAttribute('aria-expanded', 'true');
}

function cerrarListado() {
  document.body.classList.remove('lista-abierta');
  obrasToggle.setAttribute('aria-expanded', 'false');
}

obrasToggle.onclick = abrirListado;
obrasCerrar.onclick = cerrarListado;


// ---- Paises en la busqueda del panel izquierdo ----
const PAISES_BASE = [
  'Argentina',
  'Chile',
  'Perú',
  'Brasil',
  'México',
  'Ecuador',
  
];
// Si agregás un proyecto de otro país en el Excel, aparece solo al final de la lista.
const PAISES = [...new Set([...PAISES_BASE, ...OBRAS.map(o => o.pais)])];
const f = { pais: 'Todos', tipo: null, q: '' };
const color = o => COLORES[o.tipo] || '#ccc';
const usd = n => !n ? 's/d' : 'US$ ' + (n >= 1e9 ? (n / 1e9).toLocaleString('es-AR') + ' mil M' : (n / 1e6).toLocaleString('es-AR') + ' M');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const visibles = () => OBRAS.filter(o => (f.pais === 'Todos' || o.pais === f.pais) && (!f.tipo || o.tipo === f.tipo) &&
  (!f.q || norm([o.nombre, o.ubicacion, o.pais, o.tipo, o.descripcion, ...o.colaboradores].join(' ')).includes(norm(f.q))));
const margen = () => innerWidth > 820
  ? { paddingTopLeft: [470, 90], paddingBottomRight: [30, 90] }
  : { paddingTopLeft: [20, 70], paddingBottomRight: [20, innerHeight * 0.6] };
let actual = null, urlsMapa = [], urlsGal = [];
const capa = L.layerGroup().addTo(map);

// ---- Almacenamiento de fotos subidas (IndexedDB, en este navegador) ----
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

async function reducir(file) { // máx. 1600 px
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(ok => c.toBlob(b => ok(b || file), 'image/jpeg', 0.85));
  } catch { return file; }
}

// ---- Mapa: marcadores con foto, rutas y estadísticas (solo las obras visibles) ----
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
    const cuerpo = thumb ? `<em class="foto"><img src="${thumb}" alt=""><b>${n}</b></em>` : '<i></i>';
    const icon = L.divIcon({ className: '', iconSize: [0, 0],
      html: `<div class="pin${thumb ? ' con-foto' : ''}${o.id === actual ? ' sel' : ''}" data-id="${o.id}" style="--c:${color(o)}">${cuerpo}<span>${o.nombre.split(' · ')[0]}</span></div>` });
    L.marker(o.coordenadas, { icon, title: o.nombre }).addTo(capa).on('click', () => seleccionar(o.id))
      .bindTooltip(`<b>${o.nombre}</b><br>${o.pais} · ${usd(o.inversion_usd)}<br>${o.estado}<br><small>Tocá para ver</small>`,
        { direction: 'top', offset: [0, thumb ? -32 : -12], className: 'tip' });
    if (o.ruta) L.polyline(o.ruta, { color: color(o), weight: 4, dashArray: '8 6' }).addTo(capa);
  });
  const fecha = new Date(ACTUALIZADO + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  $('stats').innerHTML = [[usd(vis.reduce((t, o) => t + o.inversion_usd, 0)), 'Inversión total'], [vis.length, 'Cantidad de Obras'],
    [new Set(vis.map(o => o.pais)).size, 'Cantidad de Países'], [fotosTotal, 'Imagenes Cargadas'], [fecha, 'Ultima Actualización']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');

  // Si el módulo ejecutivo ya está cargado, actualiza KPIs y panel con los proyectos visibles.
  if (window.pintarEjecutivo) window.pintarEjecutivo(vis);
}

function ajustarMapa() {
  const pts = visibles().flatMap(o => o.ruta || [o.coordenadas]);
  if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(0.25), { ...margen(), maxZoom: 7, duration: 0.9 });
}

// ---- Filtros: país, tipo y búsqueda ----
function pintarFiltros() {
  $('paises').innerHTML = ['Todos', ...PAISES].map(p => {
    const n = p === 'Todos' ? OBRAS.length : OBRAS.filter(o => o.pais === p).length;
    return `<button data-pais="${p}" aria-pressed="${f.pais === p}">${p}<sup>${n}</sup></button>`;
  }).join('');
  $('tipos').innerHTML = Object.keys(COLORES).filter(t => OBRAS.some(o => o.tipo === t)).map(t =>
    `<button data-tipo="${t}" style="--c:${COLORES[t]}" aria-pressed="${f.tipo === t}">${t}</button>`).join('');
}
function refrescar() { pintarFiltros(); mostrarLista(); dibujar(); ajustarMapa(); }
$('paises').onclick = e => { const b = e.target.closest('[data-pais]'); if (b) { f.pais = b.dataset.pais; refrescar(); } };
$('tipos').onclick = e => { const b = e.target.closest('[data-tipo]'); if (b) { f.tipo = f.tipo === b.dataset.tipo ? null : b.dataset.tipo; refrescar(); } };
$('buscar').oninput = e => { f.q = e.target.value.trim(); mostrarLista(); dibujar(); ajustarMapa(); };

// ---- Lista de obras ----
const tarjeta = o => `<button class="obra" data-id="${o.id}" style="--c:${color(o)}"><span class="dot"></span><b>${o.nombre}</b>
  <span class="monto">${usd(o.inversion_usd)}</span><small>${o.pais} · ${o.tipo} · ${o.estado}</small>
  ${o.avance_pct == null ? '' : `<i class="mini"><u style="width:${o.avance_pct}%"></u></i>`}</button>`;

function mostrarLista() {
  actual = null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  document.querySelectorAll('.pin').forEach(p => p.classList.remove('sel'));
  const v = visibles();
  $('obras-count').textContent = v.length;
  let cuerpo;
  if (!v.length) cuerpo = '<div class="vacio-lista"><p>No hay obras con ese filtro.</p><button class="btn" id="limpiar">Ver todas</button></div>';
  else if (f.pais !== 'Todos') cuerpo = v.map(tarjeta).join('');
  else cuerpo = PAISES.map(p => [p, v.filter(o => o.pais === p)]).filter(g => g[1].length)
    .map(([p, l]) => `<h3>${p} · ${l.length}</h3>${l.map(tarjeta).join('')}`).join('');
  $detalle.style.removeProperty('--c');
  $detalle.innerHTML = `<p class="nota resumen">${v.length} obra${v.length === 1 ? '' : 's'}. Tocá una para ver el detalle.</p>${cuerpo}`;
  $detalle.scrollTop = 0;
}

// ---- Detalle de una obra ----
function seleccionar(id) {
  const o = OBRAS.find(x => x.id === id);
  actual = id;
  if (innerWidth <= 820) abrirListado();
  try { history.replaceState(null, '', '#' + id); } catch {}
  document.querySelectorAll('.pin').forEach(p => p.classList.toggle('sel', p.dataset.id === id));
  map.flyToBounds(L.latLngBounds(o.ruta || [o.coordenadas]).pad(0.6), { ...margen(), maxZoom: 8, duration: 1 });
  const avance = o.avance_pct == null
    ? '<p class="nota">Avance: sin dato verificado todavía.</p>'
    : `<div class="barra" role="progressbar" aria-valuenow="${o.avance_pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${o.avance_pct}%"></i></div>
       <p class="nota">Avance: ${o.avance_pct} %</p>`;
  $detalle.style.setProperty('--c', color(o));
  $detalle.innerHTML = `
    <div class="fila"><button class="cerrar" id="volver">← Todas las obras</button>
      <span class="nav"><button class="cerrar" id="prev" aria-label="Obra anterior">‹</button><button class="cerrar" id="next" aria-label="Obra siguiente">›</button></span></div>
    <p class="etiquetas"><span class="tipo">${o.tipo}</span> <span class="pais-tag">${o.pais}</span></p>
    <h2>${o.nombre}</h2>
    <p class="ubic">${o.ubicacion}</p>
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
  if (t.closest('#limpiar')) { Object.assign(f, { pais: 'Todos', tipo: null, q: '' }); $('buscar').value = ''; return refrescar(); }
  if (t.closest('[data-abrir]')) return abrirSubida();
  const b = t.closest('.borrar');
  if (b) { await borrarFoto(Number(b.dataset.id)); dibujar(); return pintarGaleria(); }
  const img = t.closest('.galeria img');
  if (img) { visor.querySelector('img').src = img.src; visor.showModal(); }
});
visor.onclick = () => visor.close();

// ---- Subir fotos (botón destacado) ----
const $modal = $('subida'), $sel = $('obra-sel'), $msg = $('msg'), zona = $('zona');
$sel.innerHTML = OBRAS.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('');
function abrirSubida() { $sel.value = actual || visibles()[0]?.id || OBRAS[0].id; $msg.textContent = ''; $modal.showModal(); }
$('cta').onclick = abrirSubida;
$('cerrar-modal').onclick = () => $modal.close();

async function importar(files) {
  const imgs = [...files].filter(f => f.type.startsWith('image/'));
  if (!imgs.length) { $msg.textContent = 'No encontré imágenes. Para una carpeta, usá "Importar carpeta".'; return; }
  $msg.textContent = `Importando ${imgs.length}…`;
  try {
    for (const f of imgs) await guardarFoto($sel.value, await reducir(f), f.name);
    $msg.textContent = `${imgs.length} imagen(es) agregada(s) a esta obra.`;
  } catch { $msg.textContent = 'No se pudieron guardar las imágenes.'; }
  dibujar(); pintarGaleria();
}
for (const id of ['subir', 'carpeta']) $(id).onchange = e => { importar(e.target.files); e.target.value = ''; };
zona.ondragover = e => { e.preventDefault(); zona.classList.add('sobre'); };
zona.ondragleave = () => zona.classList.remove('sobre');
zona.ondrop = e => { e.preventDefault(); zona.classList.remove('sobre'); importar(e.dataTransfer.files); };

pintarFiltros();
const inicio = OBRAS.find(o => o.id === location.hash.slice(1));
dibujar();
if (inicio) seleccionar(inicio.id); else { mostrarLista(); ajustarMapa(); }
