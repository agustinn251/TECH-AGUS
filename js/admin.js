// Botón "Datos": importar y exportar la planilla de obras, y ver de dónde salen los datos.
(() => {
  const $ = id => document.getElementById(id), dlg = $('datos-modal'), cuerpo = $('datos-cuerpo');
  const aviso = txt => { const t = $('toast'); t.textContent = txt; t.classList.add('on'); clearTimeout(aviso.t); aviso.t = setTimeout(() => t.classList.remove('on'), 3500); };
  function abrir() {
    const info = window.ORIGEN_DATOS || { origen: 'data/obras.js (local)', n: OBRAS.length, omitidas: [] }, g = DATOS.leerGuardado();
    cuerpo.innerHTML = `
      <p class="desc" style="margin-top:14px"><b>Fuente actual:</b> ${info.origen} · ${info.n} obras${g ? ` · importado el ${new Date(g.fecha).toLocaleDateString('es-AR')}` : ''}.</p>
      ${window.ERROR_FUENTE ? `<div class="aviso-basica">No pude leer la fuente configurada: ${window.ERROR_FUENTE}. Mostré los datos locales.</div>` : ''}
      ${info.omitidas.length ? `<div class="aviso-basica">Omití ${info.omitidas.length} fila(s): ${info.omitidas.slice(0, 5).join(' · ')}${info.omitidas.length > 5 ? '…' : ''}</div>` : ''}
      <h3>Excel, CSV o JSON</h3>
      <div class="zona"><p>Elegí un archivo con una fila por obra. Reemplaza los datos actuales en este navegador.</p>
        <label class="btn">Importar archivo<input id="d-archivo" type="file" accept=".xlsx,.xls,.csv,.json" hidden></label>
        <button class="cerrar" id="d-xlsx">Descargar Excel</button><button class="cerrar" id="d-csv">Descargar CSV</button>
        ${g ? '<button class="cerrar" id="d-reset">Volver a data/obras.js</button>' : ''}</div>
      <h3>Columnas</h3>
      <p class="desc" style="font-size:13px">Obligatorias: <b>Nombre, Latitud, Longitud</b>. Opcionales: ID, Tipo, Pais, Ubicacion, InversionUSD, InversionNota, Estado, AvancePct, Descripcion.
      Con varios valores en una celda, ponelos uno por línea (Alt+Enter) o separados por <b>;</b>. <b>Colaboradores</b>: texto. <b>Hitos</b>: fecha|texto. <b>Datos</b>: valor|etiqueta. <b>Fuentes</b>: texto|url. <b>Fotos</b>: urls. <b>Ruta</b>: lat,lng; lat,lng (con punto decimal).
      Si dejás <b>Estado</b> vacío, se calcula con el avance. Conservá el <b>ID</b> de cada obra para no perder sus fotos subidas.</p>
      <h3>SharePoint</h3>
      <p class="desc" style="font-size:13px">En <b>js/config.js</b> elegí <b>modo: 'url'</b> (enlace a un .xlsx, .csv o .json) o <b>modo: 'sharepoint'</b> (lista leída con Microsoft Graph). El segundo necesita un registro de aplicación en Entra ID y abrir el mapa desde una dirección https, no como archivo.</p>`;
    if (!dlg.open) dlg.showModal();
  }
  $('datos-btn').onclick = abrir; $('datos-x').onclick = () => dlg.close();
  cuerpo.addEventListener('click', e => {
    if (e.target.closest('#d-xlsx')) DATOS.descargarXLSX().catch(err => aviso('No pude generar el Excel: ' + err.message));
    if (e.target.closest('#d-csv')) DATOS.descargarCSV();
    if (e.target.closest('#d-reset') && confirm('¿Volver a los datos de data/obras.js?')) { DATOS.restablecer(); location.reload(); }
  });
  cuerpo.addEventListener('change', async e => {
    if (e.target.id !== 'd-archivo' || !e.target.files[0]) return;
    const f = e.target.files[0];
    try {
      const filas = await DATOS.leerArchivo(f), r = DATOS.normalizarTodo(filas);
      if (!r.obras.length) return aviso('No encontré obras válidas: revisá Nombre, Latitud y Longitud.');
      if (!confirm(`Voy a reemplazar las ${OBRAS.length} obras actuales por ${r.obras.length} de "${f.name}"${r.omitidas.length ? ` (${r.omitidas.length} fila(s) omitidas por datos incompletos)` : ''}. ¿Continuar?`)) return;
      DATOS.guardar(f.name, filas); location.reload();
    } catch (err) { aviso('No pude leer el archivo: ' + err.message); }
  });
  if (window.ERROR_FUENTE) aviso('No pude leer la fuente de datos: ' + window.ERROR_FUENTE);
})();