// Executive Insight Panel + KPIs superiores del portafolio.
// Se carga después de app.js: usa sus filtros (f), sus datos (OBRAS) y sus funciones (refrescar, seleccionar).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = (n, d = 0) => n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const usdCorto = n => !n ? 's/d' : n >= 1e9 ? `USD ${fmt(n / 1e9, 1)} B` : `USD ${fmt(n / 1e6)} M`;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const filtrado = () => f.pais !== 'Todos' || !!f.tipo || !!f.q;
  const VERDE = '#34A853', GRIS = '#9ca3af';
  const NIVELES = [
    { id: 'avanzado', etiqueta: 'Avanzados', rango: '> 75 %', color: '#22c55e', ok: a => a > 75 },
    { id: 'progreso', etiqueta: 'En progreso', rango: '25 – 75 %', color: '#f5b301', ok: a => a >= 25 && a <= 75 },
    { id: 'inicial', etiqueta: 'Iniciales', rango: '< 25 %', color: '#ef4444', ok: a => a < 25 }
  ];
  const IC = {
    inversion: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M14.5 9.5c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 1.9s1 1.7 2.5 2.1 2.5 1 2.5 2.1-1.1 1.9-2.5 1.9c-1.1 0-2-.4-2.6-1.2"/>',
    proyectos: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    encurso: '<path d="M3 21h18"/><path d="M6 21V9l6-4 6 4v12"/><path d="M10 21v-5h4v5"/>',
    paises: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    avance: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
    fecha: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    estado: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    industria: '<path d="M3 20V9l6 3V9l6 3V5h3v15z"/>',
    estrella: '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/>',
    meta: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
    resumen: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    alerta: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    dato: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16"/>'
  };
  const svg = k => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
  const colorDe = t => (typeof COLORES !== 'undefined' && COLORES[t]) || GRIS;

  // Países con responsable cargado (filas "pais-..." de la planilla), ordenados por nombre.
  // Se usa el nombre de país tal como aparece en las obras, para que el filtro encuentre coincidencias.
  function paisesConResponsable() {
    const map = (typeof RESPONSABLES_PAIS !== 'undefined' && RESPONSABLES_PAIS) ? RESPONSABLES_PAIS : {};
    const cl = q => (typeof clavePais === 'function' ? clavePais(q) : String(q || '').toLowerCase());
    return Object.values(map).filter(p => p && (p.responsable || p.foto)).map(p => {
      const o = OBRAS.find(x => cl(x.pais) === cl(p.nombre));
      return { ...p, pais: o ? o.pais : p.nombre };
    }).sort((a, b) => String(a.pais).localeCompare(String(b.pais), 'es'));
  }

  // ---------- Métricas derivadas (todo se calcula sobre los proyectos visibles) ----------
  function metricas(vis) {
    const n = vis.length, conAv = vis.filter(o => o.avance_pct != null), conInv = vis.filter(o => o.inversion_usd > 0);
    const inversion = conInv.reduce((t, o) => t + o.inversion_usd, 0);
    const avance = conAv.length ? conAv.reduce((t, o) => t + o.avance_pct, 0) / conAv.length : null;
    const ambos = conInv.filter(o => o.avance_pct != null), base = ambos.reduce((t, o) => t + o.inversion_usd, 0);
    const pond = base ? ambos.reduce((t, o) => t + o.avance_pct * o.inversion_usd, 0) / base : null;
    const agrupar = clave => { const m = new Map(); vis.forEach(o => { const k = o[clave] || 'Sin clasificar', g = m.get(k) || { nombre: k, n: 0, inv: 0 }; g.n++; g.inv += o.inversion_usd || 0; m.set(k, g); });
      return [...m.values()].sort((a, b) => b.n - a.n || b.inv - a.inv); };
    const mayor = conInv.slice().sort((a, b) => b.inversion_usd - a.inversion_usd)[0] || null;
    const adelantado = conAv.slice().sort((a, b) => b.avance_pct - a.avance_pct || (b.inversion_usd || 0) - (a.inversion_usd || 0))[0] || null;
    // Obras "vivas": todo lo que no está finalizado, terminado u operativo.
    const enCursoArr = vis.filter(o => !/^(finaliz|termin|operativ)/i.test(String(o.estado || '').trim()));
    const enCurso = enCursoArr.length, invEnCurso = enCursoArr.reduce((t, o) => t + (o.inversion_usd || 0), 0);
    return { vis, n, enCurso, invEnCurso, paises: new Set(vis.map(o => o.pais)).size, inversion, avance, pond, sinAvance: n - conAv.length,
      industrias: agrupar('tipo'), porPais: agrupar('pais'), niveles: NIVELES.map(v => ({ ...v, n: conAv.filter(o => v.ok(o.avance_pct)).length })),
      mayor, adelantado, empatados: adelantado ? conAv.filter(o => o.avance_pct === adelantado.avance_pct).length - 1 : 0 };
  }
  function resumen(m) {
    if (!m.n) return 'No hay proyectos que coincidan con los filtros aplicados.';
    const top = m.industrias[0], plural = (k, s, p) => `${k} ${k === 1 ? s : p}`;
    return `${filtrado() ? 'Con los filtros aplicados, el' : 'El'} portafolio contiene ${plural(m.n, 'proyecto', 'proyectos')} ${m.paises === 1 ? 'en 1 país' : `distribuidos en ${m.paises} países`}. ` +
      (m.inversion ? `La inversión estimada alcanza ${usdCorto(m.inversion)}. ` : 'Todavía no hay inversión informada. ') +
      `La industria con mayor participación es ${top.nombre} (${pct(top.n, m.n)} % de los proyectos). ` +
      (m.avance != null ? `El avance promedio del portafolio es de ${fmt(m.avance)} %.` : 'No hay avance verificado para calcular un promedio.');
  }

  // ---------- KPIs superiores ----------
  function pintarKPIs(m) {
    const fecha = new Date(ACTUALIZADO + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '').toUpperCase();
    $('stats').innerHTML = [
      ['inversion', usdCorto(m.inversion), 'Inversión total', 'USD B = miles de millones de dólares'],
      ['proyectos', fmt(m.n), 'Proyectos', ''],
      ['encurso', fmt(m.enCurso), 'En ejecución', `Obras no finalizadas. Inversión en ejecución: ${usdCorto(m.invEnCurso)}`],
      ['paises', fmt(m.paises), 'Países', ''],
      ['avance', m.avance == null ? 's/d' : `${fmt(m.avance)}%`, 'Avance promedio', m.pond != null ? `Ponderado por inversión: ${fmt(m.pond)} %` : 'Promedio simple de los proyectos con avance'],
      ['fecha', fecha, 'Última actualización', '']
    ].map(([i, v, l, t]) => `<div class="k"${t ? ` title="${esc(t)}"` : ''}>${svg(i)}<div class="k-t"><b>${esc(v)}</b><small>${l}</small></div></div>`).join('');
  }

  // ---------- Panel ejecutivo ----------
  const bar = (p, color) => `<span class="eb" aria-hidden="true"><i data-w="${Math.max(0, Math.min(100, p))}" style="width:0;background:${color}"></i></span>`;
  const seccion = (ic, t, cuerpo) => `<section class="ex-sec"><h3 class="ex-t">${svg(ic)}${t}</h3>${cuerpo}</section>`;
  const tira = segs => `<div class="ex-strip" aria-hidden="true">${segs.filter(s => s.v > 0).map(s => `<i style="flex:${s.v};background:${s.c}"></i>`).join('')}</div>`;
  const fila = (nombre, valor, p, color, attr = '', activo = false, extra = '') => {
    const cuerpo = `<span class="ex-n"><i class="ex-dot" style="background:${color}"></i>${nombre}${extra}</span><span class="ex-v">${valor}</span>${bar(p, color)}`;
    return attr ? `<button class="ex-fila" ${attr} aria-pressed="${activo}">${cuerpo}</button>` : `<div class="ex-fila">${cuerpo}</div>`;
  };
  const anillo = (p, c) => { const C = 2 * Math.PI * 26;
    return `<svg class="ex-ring" viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-90 32 32)"><circle class="p" cx="32" cy="32" r="26"/><circle class="v" cx="32" cy="32" r="26" style="stroke:${c}" stroke-dasharray="${(C * p / 100).toFixed(1)} ${C.toFixed(1)}"/></g><text x="32" y="37" text-anchor="middle">${fmt(p)}%</text></svg>`; };

  function pintarPanel(m) {
    const cab = `<header class="ex-cab"><div><p class="ex-sup">PORTAFOLIO EJECUTIVO</p><h2>Proyectos - Obras</h2>
      <p class="ex-sub">${fmt(m.n)} ${m.n === 1 ? 'proyecto' : 'proyectos'}${filtrado() ? ' · <span class="ex-chip">Vista filtrada</span> <button class="ex-lnk" id="ex-limpiar">Limpiar</button>' : ' · portafolio completo'}</p></div>
      <button class="ex-x" id="exec-cerrar" aria-label="Ocultar el panel ejecutivo">✕</button></header>`;
    if (!m.n) { $('exec').innerHTML = cab + '<div class="ex-cuerpo"><p class="ex-vacio">No hay proyectos con los filtros actuales.</p></div>'; return; }

    const totAv = m.n - m.sinAvance, topInv = m.industrias.slice().sort((a, b) => b.inv - a.inv);
    // A. Estado del portafolio
    const A = seccion('estado', 'Estado del portafolio',
      tira(m.niveles.map(v => ({ v: v.n, c: v.color }))) + m.niveles.map(v => fila(v.etiqueta, `<b>${v.n}</b> · ${pct(v.n, totAv)} %`, pct(v.n, totAv), v.color, '', false, ` <small>${v.rango}</small>`)).join('') +
      (m.sinAvance ? `<p class="ex-nota">${m.sinAvance} sin avance verificado (no se incluye en estos grupos).</p>` : ''));
    // B. Top industrias
    const B = seccion('industria', 'Top industrias', m.industrias.slice(0, 6).map(g =>
      fila(esc(g.nombre), `<b>${g.n}</b> · ${pct(g.n, m.n)} %`, pct(g.n, m.n), colorDe(g.nombre), `data-ind="${esc(g.nombre)}"`, f.tipo === g.nombre)).join(''));
    // C. Top países
    const C = seccion('paises', 'Top países', m.porPais.slice(0, 6).map(g =>
      fila(esc(g.nombre), `<b>${g.n}</b> · ${pct(g.n, m.n)} %`, pct(g.n, m.n), VERDE, `data-pais="${esc(g.nombre)}"`, f.pais === g.nombre)).join(''));
    // D. Inversión por industria
    const mx = topInv[0] ? topInv[0].inv : 0;
    const D = seccion('inversion', 'Inversión por industria', m.inversion
      ? tira(topInv.map(g => ({ v: g.inv, c: colorDe(g.nombre) }))) + topInv.filter(g => g.inv > 0).map(g =>
          fila(esc(g.nombre), `<b>${usdCorto(g.inv)}</b> · ${pct(g.inv, m.inversion)} %`, pct(g.inv, mx), colorDe(g.nombre), `data-ind="${esc(g.nombre)}"`, f.tipo === g.nombre)).join('')
      : '<p class="ex-nota">Todavía no hay inversión informada para estos proyectos.</p>');
    // E. Proyecto destacado (mayor inversión)
    const h = m.mayor, E = h ? seccion('estrella', 'Proyecto destacado', `<button class="ex-hero" data-id="${esc(h.id)}" style="--c:${colorDe(h.tipo)}">
      <span class="ex-badge">${esc(h.tipo)}</span><h4>${esc(h.nombre)}</h4>
      <p class="ex-loc">${svg('pin')}${esc(h.pais)}${h.estado ? ' · ' + esc(h.estado) : ''}</p>
      <div class="ex-datos"><div><small>Inversión</small><strong>${usdCorto(h.inversion_usd)}</strong></div><div><small>Avance</small><strong>${h.avance_pct == null ? 's/d' : fmt(h.avance_pct) + ' %'}</strong></div></div>
      ${h.avance_pct == null ? '' : bar(h.avance_pct, 'var(--c)')}
      <small class="ex-share">${pct(h.inversion_usd, m.inversion)} % de la inversión del portafolio</small><span class="ex-link">Ver en el mapa →</span></button>`) : '';
    // F. Proyecto más avanzado
    const a = m.adelantado, F = a ? seccion('meta', 'Proyecto más avanzado', `<button class="ex-av" data-id="${esc(a.id)}">${anillo(a.avance_pct, '#22c55e')}
      <span><b>${esc(a.nombre)}</b><small>${esc(a.pais)} · ${esc(a.tipo)}</small>${m.empatados ? `<small>+${m.empatados} más con ${fmt(a.avance_pct)} % de avance</small>` : ''}</span></button>`) : '';
    // G. Resumen ejecutivo
    const ins = [];
    if (m.inversion && topInv[0] && topInv[0].inv) ins.push(['inversion', `${esc(topInv[0].nombre)} concentra el ${pct(topInv[0].inv, m.inversion)} % de la inversión.`]);
    if (m.niveles[2].n) ins.push(['alerta', `${m.niveles[2].n} ${m.niveles[2].n === 1 ? 'proyecto está' : 'proyectos están'} en etapa inicial (< 25 %): requieren seguimiento.`]);
    if (m.niveles[0].n) ins.push(['ok', `${m.niveles[0].n} ${m.niveles[0].n === 1 ? 'proyecto supera' : 'proyectos superan'} el 75 % de avance.`]);
    if (m.pond != null) ins.push(['dato', `Avance ponderado por inversión: ${fmt(m.pond)} %.`]);
    const G = seccion('resumen', 'Resumen ejecutivo', `<p class="ex-resumen" id="ex-texto">${esc(resumen(m))}</p>
      <ul class="ex-ins">${ins.map(([i, t]) => `<li class="${i}">${svg(i)}<span>${t}</span></li>`).join('')}</ul><button class="ex-btn" id="ex-copiar">Copiar resumen</button>`);
    // H. Responsable del país activo (el filtro, o el país de la obra abierta)
    const listaResp = paisesConResponsable();
    const cl = q => (typeof clavePais === 'function' ? clavePais(q) : String(q || '').toLowerCase());
    const paisActivo = f.pais !== 'Todos' ? f.pais
      : (typeof actual !== 'undefined' && actual ? ((OBRAS.find(o => o.id === actual) || {}).pais || null) : null);
    const activo = paisActivo ? listaResp.find(p => cl(p.pais) === cl(paisActivo)) : null;
    const filasResp = listaResp.map(p => {
      const foto = (typeof fotoPerfil === 'function' ? fotoPerfil(p.foto) : p.foto);
      const ini = String(p.responsable || '?').trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
      const ava = foto ? `<img src="${esc(foto)}" alt="${esc(p.responsable)}" loading="lazy">` : `<span class="ini">${esc(ini)}</span>`;
      return `<button class="ex-resp" data-pais="${esc(p.pais)}" aria-pressed="${f.pais === p.pais}">${ava}`
        + `<span><b>${esc(p.responsable || 'Sin asignar')}</b><small>${esc([p.cargo, p.pais].filter(Boolean).join(' · '))}</small></span></button>`;
    }).join('');
    const tarjetaPais = activo && typeof tarjetaResp === 'function'
      ? tarjetaResp({ rol: 'Responsable del país', nombre: activo.responsable || 'Sin asignar', cargo: activo.cargo, foto: activo.foto })
      : '';
    const R = listaResp.length ? seccion('persona', 'Responsables',
      (tarjetaPais || filasResp) + `<button class="ex-btn" id="ex-equipo">Ver equipo completo</button>`) : '';

    const cuerpo = $('exec').querySelector('.ex-cuerpo'), y = cuerpo ? cuerpo.scrollTop : 0;
    $('exec').innerHTML = cab + `<div class="ex-cuerpo">${R}${G}${A}${E}${F}${B}${C}${D}</div><footer class="ex-pie">Cálculos sobre los proyectos visibles. Los montos provienen de fuentes públicas; los proyectos sin avance verificado se excluyen del promedio.</footer>`;
    const nuevo = $('exec').querySelector('.ex-cuerpo'); if (nuevo) nuevo.scrollTop = y;
    requestAnimationFrame(() => $('exec').querySelectorAll('.eb i[data-w]').forEach(i => { i.style.width = i.dataset.w + '%'; }));
  }

  window.pintarEjecutivo = vis => { const m = metricas(vis); pintarKPIs(m); pintarPanel(m); };
  window.__metricasEjecutivo = metricas; window.__resumenEjecutivo = resumen;

  // ---------- Interacción ----------
  const aviso = txt => { const t = $('toast'); if (!t) return; t.textContent = txt; t.classList.add('on'); clearTimeout(aviso.t); aviso.t = setTimeout(() => t.classList.remove('on'), 2500); };

  // Grilla completa de responsables (una tarjeta por país).
  function abrirEquipo() {
    const dlg = $('equipo'), grid = $('equipo-grid'), nota = $('equipo-nota');
    if (!dlg || !grid) return;
    const cl = p => (typeof clavePais === 'function' ? clavePais(p) : String(p || '').toLowerCase());
    const lista = paisesConResponsable();
    if (nota) nota.textContent = lista.length
      ? `${lista.length} ${lista.length === 1 ? 'país' : 'países'} con responsable asignado.`
      : 'Todavía no hay responsables cargados en la planilla.';
    grid.innerHTML = lista.map(p => {
      const obras = OBRAS.filter(o => cl(o.pais) === cl(p.pais));
      const conAv = obras.filter(o => o.avance_pct != null);
      const av = conAv.length ? Math.round(conAv.reduce((t, o) => t + o.avance_pct, 0) / conAv.length) : null;
      const inv = obras.reduce((t, o) => t + (o.inversion_usd || 0), 0);
      const stats = [[fmt(obras.length), 'obras'], [av == null ? 's/d' : av + ' %', 'avance'], [usdCorto(inv), 'inversión']];
      return typeof tarjetaResp === 'function'
        ? tarjetaResp({ rol: p.pais, nombre: p.responsable || 'Sin asignar', cargo: p.cargo, foto: p.foto, stats, variante: 'resp--card' })
        : '';
    }).join('');
    dlg.showModal();
  }

  const btnEquipoX = $('equipo-x');
  if (btnEquipoX && $('equipo')) btnEquipoX.onclick = () => $('equipo').close();

  $('exec').addEventListener('click', async e => {
    const t = e.target, ind = t.closest('[data-ind]'), pa = t.closest('[data-pais]'), id = t.closest('[data-id]');
    if (t.closest('#ex-equipo')) return abrirEquipo();
    if (ind) { f.tipo = f.tipo === ind.dataset.ind ? null : ind.dataset.ind; return refrescar(); }
    if (pa) { f.pais = f.pais === pa.dataset.pais ? 'Todos' : pa.dataset.pais; return refrescar(); }
    if (id) return seleccionar(id.dataset.id);
    if (t.closest('#ex-limpiar')) { Object.assign(f, { pais: 'Todos', tipo: null, q: '' }); $('buscar').value = ''; return refrescar(); }
    if (t.closest('#ex-copiar')) { const txt = $('ex-texto').textContent; try { await navigator.clipboard.writeText(txt); aviso('Resumen copiado'); } catch { prompt('Copiá el resumen:', txt); } return; }
    if (t.closest('#exec-cerrar')) { abierto = false; aplicar(); }
  });

  // Desktop: visible siempre. Tablet y móvil: se abre y se cierra con el botón "Portafolio Ejecutivo".
  const mq = matchMedia('(min-width: 1200px)'); let abierto = mq.matches;
  function aplicar() {
    document.body.classList.toggle('exec-abierto', abierto); $('exec').hidden = !abierto;
    const b = $('exec-toggle');
    // En escritorio, ocultar el botón solo mientras el panel está abierto.
    // Al cerrar con la X, el botón vuelve a aparecer para poder abrirlo.
    b.hidden = mq.matches && abierto;
    b.setAttribute('aria-expanded', String(abierto));
    b.setAttribute('aria-label', abierto ? 'Cerrar portafolio ejecutivo' : 'Abrir portafolio ejecutivo');
    const etiqueta = $('exec-toggle-label');
    if (etiqueta) etiqueta.textContent = abierto ? 'Cerrar portafolio' : 'Portafolio Ejecutivo';
    if (typeof actual !== 'undefined' && !actual && typeof ajustarMapa === 'function') ajustarMapa();
  }
  mq.addEventListener('change', () => { abierto = mq.matches; aplicar(); });
  $('exec-toggle').onclick = () => { abierto = !abierto; aplicar(); };
  aplicar(); window.pintarEjecutivo(visibles());
})();
