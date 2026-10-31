// De dónde salen los proyectos. Cambiá "modo" y guardá; no hace falta tocar app.js.
//   'local'       -> data/obras.js (o el último Excel/CSV/JSON que importaste con el botón "Datos")
//   'url'         -> un enlace a un .json, .csv o .xlsx (por ejemplo, un archivo de SharePoint)
//   'sharepoint'  -> una lista de SharePoint, leída con Microsoft Graph (pide iniciar sesión)
const FUENTE = {
  modo: 'url',

  // Solo para modo 'url'. El enlace debe poder abrirse desde el navegador del usuario
  // (por ejemplo, un enlace de descarga directa del archivo en SharePoint o OneDrive).
  url: 'https://docs.google.com/spreadsheets/d/1jyRwIQb-Rcpp0ERvFJtfp_Pu60u4KupCdEAzlrYKZXA/export?format=csv&gid=0',

  // Solo para modo 'sharepoint'. Necesita:
  //  1) Un registro de aplicación en Microsoft Entra ID (tipo "Aplicación de página única")
  //     con el permiso delegado de Microsoft Graph "Sites.Read.All".
  //  2) Como URI de redirección, la dirección https donde publiques este mapa
  //     (o http://localhost:8000 para probar). No funciona abriendo index.html como archivo.
  sharepoint: {
    tenantId: '',                       // ID del directorio (inquilino)
    clientId: '',                       // ID de la aplicación (cliente)
    host: 'tuempresa.sharepoint.com',   // dominio de SharePoint
    sitio: '/sites/Proyectos',          // ruta del sitio
    lista: 'Proyectos'                  // nombre de la lista
  }
};
