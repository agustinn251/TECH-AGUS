// De dónde salen los proyectos. Cambiá "modo" y guardá; no hace falta tocar app.js.
//   'local'       -> data/obras.js (o el último Excel/CSV/JSON que importaste con el botón "Datos")
//   'url'         -> un enlace a un .json, .csv o .xlsx (por ejemplo, un archivo de SharePoint)
//   'sharepoint'  -> una lista de SharePoint, leída con Microsoft Graph (pide iniciar sesión)
const FUENTE = {
  modo: 'url',

  url: 'https://docs.google.com/spreadsheets/d/1jyRwIQb-Rcpp0ERvFJtfp_Pu60u4KupCdEAzlrYKZXA/export?format=csv',

  sharepoint: {
    tenantId: '',
    clientId: '',
    host: 'tuempresa.sharepoint.com',
    sitio: '/sites/Proyectos',
    lista: 'Proyectoss'
  }
};

