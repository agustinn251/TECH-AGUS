// Editá o agregá obras acá. Los datos con "aprox." deben verificarse antes de publicar.
const ACTUALIZADO = "2026-10-30";
const COLORES = {
  "Petróleo y gas": "#ff6a2b",      // Naranja
  "Agua": "#22d3c5",               // Turquesa
  "Minería": "#b794f6",            // Violeta claro
  "Acero e industria": "#ef4444",  // Rojo Industrial
};

function obtenerEstadoPorAvance(avance) {
  if (avance >= 100) return "Operativo";
  if (avance >= 75) return "Construcción avanzada";
  if (avance >= 40) return "En construcción";
  if (avance >= 15) return "En desarrollo";
  return "En estudio";
};

const OBRAS = [
  {
  id: "los-toldos-ii-este",
  nombre: "Los Toldos II Este",

  tipo: "Petróleo y gas",
  pais: "Argentina",

  ubicacion: "Hub Norte de Vaca Muerta, cerca de Rincón de los Sauces, Neuquén",
  coordenadas: [-37.45, -69.55], // aproximadas

  estado: "En construcción",
  avance_pct: 15,

  inversion_usd: 6400000000,
  inversion_nota: "Inversión total proyectada. Segunda etapa aprobada bajo el RIGI en agosto de 2026.",

  descripcion:
    "Desarrollo de shale oil de Tecpetrol sobre un área de 78 km² en Vaca Muerta. El proyecto contempla una Planta Central de Tratamiento (CPF) construida bajo un esquema modularizado por Techint Ingeniería y Construcción, además de ductos de petróleo y gas, acueducto y sistemas de reinyección de agua.",

  datos: [
    {
      valor: "70.000",
      etiqueta: "Barriles de petróleo por día (objetivo)"
    },
    {
      valor: "3,6 MM m³/d",
      etiqueta: "Capacidad de procesamiento de gas"
    },
    {
      valor: "380",
      etiqueta: "Pozos previstos"
    },
    {
      valor: "~800",
      etiqueta: "Empresas nacionales participantes"
    }
  ],

  colaboradores: [
    "Tecpetrol (Operadora)",
    "Techint Ingeniería y Construcción",
    "Oldelval",
    "Programa ProPymes"
  ],

  hitos: [
    {
      fecha: "Septiembre 2023",
      texto: "Inicio de las principales definiciones de ingeniería para la planta."
    },
    {
      fecha: "Agosto 2026",
      texto: "Aprobación de la segunda etapa del proyecto dentro del Régimen de Incentivo para Grandes Inversiones (RIGI)."
    },
    {
      fecha: "2027 (previsto)",
      texto: "Incremento progresivo de producción hasta alcanzar 70.000 barriles diarios."
    }
  ],

  fotos: [],

  fuentes: [
    {
      texto: "El Economista - Ingreso al RIGI",
      url: "https://eleconomista.com.ar/energia/vaca-muerta-suma-rigi-us6400-millones-tecpetrol-apunta-producir-70000-barriles-diarios-n97548"
    },
    {
      texto: "Más Energía - 380 pozos y US$ 6.400 millones",
      url: "https://mase.lmneuquen.com/vaca-muerta/los-toldos-ii-este-el-desarrollo-tecpetrol-que-preve-380-pozos-y-us6400-millones-n1257286"
    }
  ]
},
  {
    id: "duplicar", nombre: "Duplicar", tipo: "Petróleo y gas", pais: "Argentina",
    ubicacion: "Allen (Río Negro) a Puerto Rosales (Buenos Aires)",
    coordenadas: [-38.98, -67.83], ruta: [[-38.98, -67.83], [-38.95, -66.0], [-38.9, -64.0], [-38.92, -62.06]], // trazado referencial
    inversion_usd: 1400000000, inversion_nota: "Inversión informada por Oldelval.",
    avance_pct: 100, estado: "Operativo desde abril 2025",
    descripcion: "Oleoducto paralelo al existente que atraviesa Río Negro, La Pampa y Buenos Aires para sacar más crudo de Vaca Muerta hacia el Atlántico. La UTE Techint–SACDE ejecutó el Módulo 2: 254 km, de los cuales 199 km son de 24 pulgadas y 55 km de 30 pulgadas.",
    datos: [{ valor: "525 km", etiqueta: "de oleoducto nuevo" }, { valor: "540.000", etiqueta: "bbl/d de capacidad (antes 225.000)" },
            { valor: "24 meses", etiqueta: "de construcción" }, { valor: "254 km", etiqueta: "Módulo 2, UTE Techint–SACDE" }],
    colaboradores: ["Oldelval (comitente)", "UTE Techint Ingeniería y Construcción – SACDE (Módulo 2)", "Productores de la cuenca (financiaron cerca del 80 % con adelantos)"],
    hitos: [{ fecha: "Octubre 2023", texto: "Entra en operación la primera ampliación (+20.000 bbl/d)." }, { fecha: "Abril 2025", texto: "Inauguración: la capacidad pasa de 225.000 a 540.000 bbl/d." }],
    fotos: [],
    fuentes: [{ texto: "Noticias NQN: inauguración (2025)", url: "https://www.noticiasnqn.com.ar/noticias/2025/04/03/310806-inauguracion-de-la-nueva-planta-de-bombeo-de-oldelval-hacia-buenos-aires" },
              { texto: "Noticias NQN: primera ampliación (2023)", url: "https://www.noticiasnqn.com.ar/amp/noticias/2023/10/01/283808-vaca-muerta-oldelval-suma-20-mil-barriles-de-crudo-por-dia-a-su-capacidad-de-transporte" },
              { texto: "Inspenet: avance del Módulo 2", url: "https://inspenet.com/en/news/duplicate-pipeline-construction-project/" }]
  },{
  id: "shushufindi",
  nombre: "Shushufindi",
  tipo: "Petróleo y gas",
  pais: "Ecuador",

  ubicacion: "Provincia de Sucumbíos, Ecuador",
  coordenadas: [-0.193305, -76.644577],

  inversion_usd: 500000000,
  inversion_nota: "Proyecto EPC de ampliación y optimización de campo petrolero.",

  avance_pct: 100,
  estado: "Finalizado",

  descripcion: "Proyecto de ampliación y optimización del campo petrolero Shushufindi-Aguarico. Incluye construcción de plataformas, facilidades de producción, líneas de flujo, infraestructura eléctrica y planta de tratamiento de agua.",

  datos: [
    { valor: "1.600", etiqueta: "Colaboradores pico" },
    { valor: "7,8 M", etiqueta: "Horas-hombre" },
    { valor: "29 km", etiqueta: "Línea eléctrica" },
    { valor: "40 Kbapd", etiqueta: "Planta de agua" }
  ],

  colaboradores: [
    "Techint Ingeniería y Construcción",
    "Consorcio Shushufindi S.A."
  ],

  hitos: [
    { fecha: "2012", texto: "Inicio de los contratos EPC en el campo Shushufindi." },
    { fecha: "2015", texto: "Ejecución de ampliaciones y nuevas plataformas." },
    { fecha: "2018", texto: "Consolidación de infraestructura de producción y servicios." }
  ],

  fotos: [],

  fuentes: [
    {
      texto: "Techint - Proyecto Shushufindi",
      url: "https://www.techint.com/es/nuestros-proyectos/shushufindi/"
    }
  ]
},
  {
  id: "vmos",
  nombre: "Vaca Muerta Oil Sur (VMOS)",
  tipo: "Petróleo y gas",
  pais: "Argentina",

  ubicacion: "Allen (Río Negro) - Punta Colorada (Río Negro)",
  coordenadas: [-39.03, -67.82],

  inversion_usd: 3000000000,
  inversion_nota: "Proyecto integral de transporte y exportación de crudo de Vaca Muerta.",

  avance_pct: 45,
  estado: "En construcción",

  descripcion: "Sistema de evacuación de crudo destinado a ampliar la capacidad exportadora de Vaca Muerta mediante oleoductos, terminal marítima y obras complementarias.",

  datos: [
    { valor: "437 km", etiqueta: "Oleoducto principal" },
    { valor: "Punta Colorada", etiqueta: "Terminal de exportación" },
    { valor: "Río Negro", etiqueta: "Provincia de destino" },
    { valor: "2027", etiqueta: "Puesta en operación esperada" }
  ],

  colaboradores: [
    "VMOS S.A.",
    "YPF",
    "Pan American Energy",
    "Vista",
    "Pluspetrol",
    "Techint Ingeniería y Construcción"
  ],

  hitos: [
    { fecha: "2024", texto: "Inicio de las obras principales." },
    { fecha: "2025", texto: "Avance de construcción del ducto." },
    { fecha: "2027", texto: "Inicio previsto de operación." }
  ],

  fotos: [],

  fuentes: [
    {
      texto: "Techint - VMOS",
      url: "https://www.techint.com/es/nuestros-proyectos"
    }
  ]
},
{
  id: "argentina-lng",
  nombre: "Argentina LNG",
  tipo: "Petróleo y gas",
  pais: "Argentina",

  ubicacion: "Tratayén (Neuquén) - Punta Colorada (Río Negro)",
  coordenadas: [-38.55, -68.62],

  inversion_usd: 7000000000,
  inversion_nota: "Proyecto multipropósito de exportación de GNL en desarrollo.",

  avance_pct: 15,
  estado: "En desarrollo",

  descripcion: "Proyecto estratégico de exportación de gas natural licuado desde Vaca Muerta hacia mercados internacionales mediante infraestructura de transporte, licuefacción y terminal marítima.",

  datos: [
    { valor: "~470 km", etiqueta: "Gasoducto proyectado" },
    { valor: "GNL", etiqueta: "Producto de exportación" },
    { valor: "Río Negro", etiqueta: "Ubicación terminal" },
    { valor: "2026", etiqueta: "Etapa de desarrollo" }
  ],

  colaboradores: [
    "YPF",
    "Shell",
    "Consorcios internacionales",
    "Empresas energéticas asociadas"
  ],

  hitos: [
    { fecha: "2024", texto: "Presentación de etapas iniciales." },
    { fecha: "2025", texto: "Definición de licitaciones principales." },
    { fecha: "2026", texto: "Adjudicación del gasoducto principal." }
  ],

  fotos: [],

  fuentes: [
    {
      texto: "Vaca Muerta Digital - Argentina LNG",
      url: "https://www.vacamuertadigital.com/noticias/techint-sacde-fuera-licitacion-gasoducto-vaca-muerta"
    }
  ]
},
  {
    id: "duplicar-norte", nombre: "Duplicar Norte", tipo: "Petróleo y gas", pais: "Argentina",
    ubicacion: "Estación de bombeo Auca Mahuida (Neuquén) a Allen (Río Negro)",
    coordenadas: [-37.7, -68.9], ruta: [[-37.7, -68.9], [-38.4, -68.5], [-38.98, -67.83]], // trazado referencial
    inversion_usd: 380000000, inversion_nota: "Inversión estimada informada por la prensa.",
    avance_pct: 85, estado: "En construcción, última soldadura completada",
    descripcion: "Oleoducto de 207 km y 24 pulgadas que une Auca Mahuida con Allen, ejecutado por Techint E&C bajo modalidad EPC para Oldelval. Se conecta con el sistema troncal y con VMOS para ampliar la evacuación del Hub Norte de Vaca Muerta.",
    datos: [{ valor: "207 km", etiqueta: "de ducto de 24 pulgadas" }, { valor: "220.000", etiqueta: "bbl/d en la primera etapa" },
            { valor: "300.000", etiqueta: "bbl/d en una segunda etapa" }, { valor: "55.400 m³/d", etiqueta: "capacidad del tramo (antes 20.400)" }],
    colaboradores: ["Oldelval (comitente)", "Techint Ingeniería y Construcción (EPC)", "Pluspetrol, Chevron, Tecpetrol y GyP (contratos de capacidad)"],
    hitos: [{ fecha: "Mediados de 2025", texto: "Se inicia la obra con contratos firmados de las operadoras del Hub Norte." }, { fecha: "Septiembre 2026", texto: "Techint completa la última soldadura de la línea regular." }, { fecha: "1.er trim. 2027 (previsto)", texto: "Habilitación definitiva." }],
    fotos: [],
    fuentes: [{ texto: "iProfesional: fin de la soldadura", url: "https://www.iprofesional.com/energia/464755-techint-termino-un-oleoducto-para-exportar-mas-crudo-de-vaca-muerta" },
              { texto: "El Economista: US$380 millones", url: "https://eleconomista.com.ar/energia/tras-una-inversion-us-380-millones-oldelval-techint-apuran-cuello-botella-exportador-n98376" },
              { texto: "Más Energía: cuándo estará listo", url: "https://mase.lmneuquen.com/vaca-muerta/techint-le-da-forma-al-duplicar-norte-cuando-estara-listo-el-nuevo-oleoducto-sacar-mas-petroleo-vaca-muerta-n1249204" }]
  },
  {
    id: "gasoducto-perito-moreno", nombre: "Gasoducto Perito Moreno", tipo: "Petróleo y gas", pais: "Argentina",
    ubicacion: "Tratayén (Neuquén) a Salliqueló (Buenos Aires)",
    coordenadas: [-38.55, -69.95], ruta: [[-38.55, -69.95], [-38.4, -67.5], [-37.9, -65.5], [-37.3, -64.0], [-36.75, -62.97]], // trazado referencial
    inversion_usd: 560000000, inversion_nota: "Monto de la ampliación del Tramo I (RIGI, TGS). Las fuentes consultadas no informan el monto de la obra original.",
    avance_pct: 100, estado: "Operativo, ampliación en marcha",
    descripcion: "Gasoducto troncal de 36 pulgadas, antes llamado Presidente Néstor Kirchner, que lleva gas de Vaca Muerta al centro del país. Techint y Sacde construyeron 440 km (renglones 1 y 2) y BTU el resto. TGS lo amplía con tres plantas compresoras para sumar 14 MMm³/d hacia el invierno de 2027.",
    datos: [{ valor: "563 km", etiqueta: "de gasoducto de 36 pulgadas" }, { valor: "440 km", etiqueta: "construidos por Techint y Sacde" },
            { valor: "21 → 35", etiqueta: "MMm³/d de capacidad con la ampliación" }, { valor: "90.000 HP", etiqueta: "de compresión nueva (3 plantas)" }],
    colaboradores: ["Techint Ingeniería y Construcción y Sacde (440 km)", "BTU (133 km restantes)", "TGS (ampliación del Tramo I)", "Enarsa (licitación de la ampliación)"],
    hitos: [{ fecha: "2023", texto: "Habilitación del primer tramo tras el llenado de gas." }, { fecha: "Abril 2026", texto: "El Ministerio de Economía aprueba la adhesión de la ampliación al RIGI." }, { fecha: "Invierno 2027 (previsto)", texto: "Capacidad total de 35 MMm³/d." }],
    fotos: [],
    fuentes: [{ texto: "EconoJournal: RIGI de la ampliación", url: "https://econojournal.com.ar/energia/aprueban-el-rigi-del-proyecto-de-tgs-que-ampliara-60-la-capacidad-del-gasoducto-perito-moreno/" },
              { texto: "Forbes Argentina: adjudicación a TGS", url: "https://www.forbesargentina.com/negocios/tgs-quedo-primera-obra-iniciativa-privada-va-invertir-us-700-millones-ampliar-gasoductos-n80113/amp" },
              { texto: "Casa Rosada: ficha del gasoducto", url: "https://www.casarosada.gob.ar/pdf/Brief%20GPNK.pdf" }]
  },
  {
  id: "josemaria",
  nombre: "Josemaría",
  tipo: "Minería",
  pais: "Argentina",

  ubicacion: "Iglesia, San Juan",
  coordenadas: [-29.40, -69.75],

  inversion_usd: 4100000000,
  inversion_nota: "Inversión estimada informada públicamente por los desarrolladores.",

  avance_pct: 100,
  estado: "En desarrollo",

  descripcion: "Proyecto minero de cobre, oro y plata ubicado en la Cordillera de los Andes. Es uno de los mayores proyectos mineros actualmente en desarrollo en Argentina.",

  datos: [
    { valor: "10.000+", etiqueta: "Empleos en construcción" },
    { valor: "25 años", etiqueta: "Vida útil estimada" },
    { valor: "175.000 t/d", etiqueta: "Procesamiento previsto" },
    { valor: "Cobre, oro y plata", etiqueta: "Minerales principales" }
  ],

  colaboradores: [
    "Vicuña Corp",
    "Lundin Mining",
    "BHP"
  ],

  hitos: [
    { fecha: "2025", texto: "Actualización del estudio ambiental." },
    { fecha: "2026", texto: "Avances de ingeniería y planificación." },
    { fecha: "2028", texto: "Inicio operativo previsto." }
  ],

  fotos: [],

  fuentes: [
    {
      texto: "Tecnoenergía - Josemaría",
      url: "https://tecnoenergia.com.ar/josemaria-el-proyecto-minero-que-lidera-la-generacion-de-empleo-en-argentina/"
    }
  ]
},

  {
    id: "saddn", nombre: "SADDN · Agua desalinizada Distrito Norte", tipo: "Agua", pais: "Chile",
    ubicacion: "Tocopilla a Radomiro Tomic, región de Antofagasta",
    coordenadas: [-22.09, -70.2], ruta: [[-22.09, -70.2], [-22.15, -69.7], [-22.25, -69.3], [-22.35, -68.9]], // trazado referencial
    inversion_usd: 1000000000, inversion_nota: "Monto informado por la prensa.",
    avance_pct: 100, estado: "Terminado, en puesta en marcha",
    descripcion: "Planta desalinizadora de ósmosis inversa en la costa del Pacífico y un sistema de impulsión de 160 km y 48 pulgadas que sube el agua a más de 3.000 m de altura para abastecer a tres operaciones de Codelco. Fue ejecutado por Techint E&C para el consorcio Aguas Horizonte.",
    datos: [{ valor: "160 km", etiqueta: "ducto de impulsión, 48 pulgadas" }, { valor: "840 l/s", etiqueta: "capacidad inicial (ampliable a 1.956)" },
            { valor: "3.000 m", etiqueta: "altura máxima de impulsión" }, { valor: "7.000+", etiqueta: "trabajadores en el pico de obra" }],
    colaboradores: ["Techint Ingeniería y Construcción (ingeniería y construcción)", "Aguas Horizonte (consorcio contratante)", "Codelco: Radomiro Tomic, Chuquicamata y Ministro Hales (usuarios finales)"],
    hitos: [{ fecha: "2017", texto: "Comienzan los estudios del proyecto." }, { fecha: "Etapa final", texto: "Avance de 85 %, luego 96 %, con unos 6.500 trabajadores." }, { fecha: "Hito", texto: "El agua desalinizada llega a Radomiro Tomic." }, { fecha: "Cierre", texto: "Obra terminada y puesta en marcha del sistema." }],
    fotos: [],
    fuentes: [{ texto: "Más Energía: el agua llegó a Radomiro Tomic", url: "https://mase.lmneuquen.com/mineria/techint-agua-desalinizada-codelco-chile" },
              { texto: "Más Energía: avance del 96 %", url: "https://mase.lmneuquen.com/techint-desalinizacion-chile-atacama/amp" },
              { texto: "EconoJournal: Techint construye en Chile", url: "https://econojournal.com.ar/energia/techint-construye-en-chile-la-primera-planta-desalinizadora/" }]
  },
  {
    id: "centinela", nombre: "Centinela · Segunda concentradora", tipo: "Minería", pais: "Chile",
    ubicacion: "Sierra Gorda, región de Antofagasta",
    coordenadas: [-22.9, -69.1], // aprox.
    inversion_usd: 4400000000, inversion_nota: "Inversión total del proyecto, la mayor en la historia de Antofagasta Minerals.",
    avance_pct: 40, estado: "En construcción, puesta en marcha en 2027",
    descripcion: "Nueva planta concentradora de cobre de Minera Centinela (Antofagasta Minerals) con capacidad para 95.000 toneladas diarias. Suma una correa overland de más de 6 km, el nuevo rajo Encuentro Sulfuros con camiones autónomos y extiende la vida útil de la mina más de 30 años. No encontré fuentes públicas que confirmen los contratistas de la obra.",
    datos: [{ valor: "95.000", etiqueta: "toneladas por día de procesamiento" }, { valor: "+144.000", etiqueta: "toneladas de cobre por año" },
            { valor: "9.400", etiqueta: "trabajadores en el distrito" }, { valor: "US$ 2.500 M", etiqueta: "de financiamiento bancario" }],
    colaboradores: ["Minera Centinela, Antofagasta Minerals (Grupo Luksic)", "Prestamistas internacionales (financiamiento por US$ 2.500 M)", "Consorcio internacional de suministro de agua"],
    hitos: [{ fecha: "Marzo 2024", texto: "Se cierra el financiamiento de la segunda concentradora." }, { fecha: "Julio 2025", texto: "Se aprueba el desarrollo del rajo Encuentro Sulfuros (US$ 1.000 M)." }, { fecha: "2027 (previsto)", texto: "Puesta en marcha de la nueva planta." }],
    fotos: [],
    fuentes: [{ texto: "Guía Minera: la mayor inversión de la compañía", url: "https://www.guiaminera.cl/?p=56267" },
              { texto: "La Tercera: préstamo por US$ 2.500 M", url: "https://www.latercera.com/pulso/noticia/cuatro-prestamistas-y-seis-bancos-internacionales-entregaran-financiamiento-a-minera-del-grupo-luksic-por-us2500-millones/C27LYJJJRBHJZGZAQAENX2VJB4/" },
              { texto: "MCH: Centinela cumple 12 años", url: "https://www.mch.cl/minera-centinela-cumple-12-anos-y-avanza-hacia-una-nueva/" }]
  },
  {
  id: "los-azules",
  nombre: "Los Azules",
  tipo: "Minería",
  pais: "Argentina",

  ubicacion: "Calingasta, San Juan",
  coordenadas: [-31.13, -69.89],

  inversion_usd: 2500000000,
  inversion_nota: "Estimaciones de desarrollo publicadas por la compañía.",

  avance_pct: 15,
  estado: "En desarrollo",

  descripcion: "Proyecto cuprífero de gran escala ubicado en la provincia de San Juan, considerado uno de los principales desarrollos de cobre de Argentina.",

  datos: [
    { valor: "Cobre", etiqueta: "Mineral principal" },
    { valor: "San Juan", etiqueta: "Provincia" },
    { valor: "Clase mundial", etiqueta: "Categoría del yacimiento" },
    { valor: "RIGI", etiqueta: "Evaluado para incentivos" }
  ],

  colaboradores: [
    "McEwen Copper",
    "Inversores internacionales"
  ],

  hitos: [
    { fecha: "2023", texto: "Actualización de estudios económicos." },
    { fecha: "2025", texto: "Presentación del proyecto bajo RIGI." },
    { fecha: "2026", texto: "Avances de ingeniería y permisos." }
  ],

  fotos: [],

  fuentes: []
},{
  id: "el-pachon",
  nombre: "El Pachón",
  tipo: "Minería",
  pais: "Argentina",

  ubicacion: "Calingasta, San Juan",
  coordenadas: [-31.95, -70.42],

  inversion_usd: 5500000000,
  inversion_nota: "Estimación histórica del desarrollo integral del proyecto.",

  avance_pct: 5,
  estado: "En desarrollo",

  descripcion: "Uno de los mayores depósitos de cobre no desarrollados de América Latina, ubicado en la Cordillera de los Andes.",

  datos: [
    { valor: "Cobre", etiqueta: "Mineral principal" },
    { valor: "San Juan", etiqueta: "Provincia" },
    { valor: "Clase mundial", etiqueta: "Categoría del yacimiento" },
    { valor: "Miles de puestos", etiqueta: "Impacto laboral estimado" }
  ],

  colaboradores: [
    "Glencore"
  ],

  hitos: [
    { fecha: "2018", texto: "Actualización de estudios técnicos." },
    { fecha: "2024", texto: "Reactivación de actividades exploratorias." },
    { fecha: "2026", texto: "Evaluación de etapas futuras." }
  ],

  fotos: [],

  fuentes: []
},
{
  id: "c20-plus",
  nombre: "C20+ Collahuasi",
  tipo: "Minería",
  pais: "Chile",

  ubicacion: "Región de Tarapacá",
  coordenadas: [-20.99, -69.05],

  inversion_usd: 1500000000,
  inversion_nota: "Monto no identificado públicamente con precisión.",

  avance_pct: 40,
  estado: "En construcción",

  descripcion: "Sistema de captación e impulsión de agua de mar destinado a extender la vida útil de la operación minera Collahuasi.",

  datos: [
    { valor: "20 años", etiqueta: "Extensión de vida útil proyectada" },
    { valor: "Agua de mar", etiqueta: "Fuente principal" },
    { valor: "Tarapacá", etiqueta: "Ubicación" },
    { valor: "Techint E&C", etiqueta: "Contratista principal" }
  ],

  colaboradores: [
    "Compañía Minera Doña Inés de Collahuasi",
    "Techint Ingeniería y Construcción"
  ],

  hitos: [
    { fecha: "2024", texto: "Inicio de ejecución." },
    { fecha: "2025", texto: "Avances de construcción." },
    { fecha: "2027", texto: "Puesta en marcha estimada." }
  ],

  fotos: [],

  fuentes: [
    {
      texto: "Techint - C20+",
      url: "https://www.techint.com/es/nuestros-proyectos"
    }
  ]
},
{
  id: "dos-bocas",
  nombre: "Refinería Dos Bocas",
  tipo: "Petróleo y gas",
  pais: "México",

  ubicacion: "Paraíso, Tabasco",
  coordenadas: [18.40, -93.20],

  inversion_usd: 16000000000,

  avance_pct: 100,
  estado: "Operativa",

  descripcion: "Refinería de gran escala construida para incrementar la capacidad de refinación de combustibles de México. Techint participó en distintas etapas de ingeniería y construcción.",

  datos: [
    { valor: "340.000 bpd", etiqueta: "Capacidad de refinación" },
    { valor: "Tabasco", etiqueta: "Ubicación" },
    { valor: "2022", etiqueta: "Inicio de operación inicial" },
    { valor: "México", etiqueta: "Proyecto estratégico nacional" }
  ],

  colaboradores: [
    "PEMEX",
    "Techint Ingeniería y Construcción"
  ],

  hitos: [
    { fecha: "2019", texto: "Inicio de construcción." },
    { fecha: "2022", texto: "Inicio de operaciones." },
    { fecha: "2024", texto: "Incremento gradual de capacidad." }
  ],

  fotos: [],

  fuentes: [
    {
      texto: "Techint - Proyectos",
      url: "https://www.techint.com/es/nuestros-proyectos"
    }
  ]
},

  {
    id: "pesqueria", nombre: "Pesquería · Centro Industrial Ternium", tipo: "Acero e industria", pais: "México",
    ubicacion: "Pesquería, Nuevo León",
    coordenadas: [25.79, -100.05], // aprox.
    inversion_usd: 7570000000, inversion_nota: "Inversión acumulada desde 2010 en el Centro Industrial.",
    avance_pct: 80, estado: "En expansión (tercera fase)",
    descripcion: "Complejo siderúrgico de Ternium, del Grupo Techint, con laminación en caliente (operativa desde 2021) y nuevas líneas de laminación en frío y galvanizado que arrancaron en febrero de 2026. Es la base del plan de expansión que incluye una nueva acería.",
    datos: [{ valor: "US$ 7.570 M", etiqueta: "invertidos desde 2010" }, { valor: "2.500+", etiqueta: "empleos directos" },
            { valor: "4,1 Mt/año", etiqueta: "de laminado en caliente (capacidad prevista)" }, { valor: "2021", etiqueta: "arranque del laminador en caliente" }],
    colaboradores: ["Ternium México (Grupo Techint)"],
    hitos: [{ fecha: "2021", texto: "Comienza a operar el nuevo laminador en caliente." }, { fecha: "Febrero 2026", texto: "Arrancan el laminador en frío y la línea de galvanizado." }, { fecha: "Fines de 2026 (previsto)", texto: "Nueva acería lista, según la Secretaría de Economía." }],
    fotos: [],
    fuentes: [{ texto: "Cluster Industrial: arranque de las nuevas líneas", url: "https://clusterindustrial.com.mx/ternium-arranca-laminado-en-frio-y-galvanizado-en-nuevo-leon-con-inversion-de-4-000-mdd/" },
              { texto: "Crónica: recorrido de Ebrard", url: "https://www.cronica.com.mx/nacional/2026/04/28/ebrard-recorre-inversiones-de-ternium-en-nuevo-leon-por-4-mil-millones-de-dolares/" }]
  },
  {
    id: "ternium-aceria", nombre: "Ternium · Nueva acería", tipo: "Acero e industria", pais: "México",
    ubicacion: "Centro Industrial Pesquería, Nuevo León",
    coordenadas: [25.74, -99.97], // aprox., separado del punto del complejo
    inversion_usd: 4000000000, inversion_nota: "Tercera fase de expansión: acería, laminado en frío y galvanizado (la acería sola, US$ 2.200 M).",
    avance_pct: 75, estado: "En construcción, lista hacia fines de 2026",
    descripcion: "Acería de planchones de última generación que Ternium eligió construir en Pesquería, junto a su laminador en caliente. Usará solo aguas residuales tratadas en el proceso. En abril de 2026 la Secretaría de Economía informó que su avance iba conforme a lo programado.",
    datos: [{ valor: "2,6 Mt/año", etiqueta: "de capacidad estimada" }, { valor: "US$ 2.200 M", etiqueta: "solo para la acería" },
            { valor: "100 %", etiqueta: "del agua de proceso, residual tratada" }, { valor: "US$ 4.000 M", etiqueta: "en la tercera fase" }],
    colaboradores: ["Ternium (Grupo Techint)", "Secretaría de Economía de México (seguimiento)"],
    hitos: [{ fecha: "Junio 2023", texto: "Ternium elige Pesquería para la nueva planta." }, { fecha: "Diciembre 2023", texto: "Inicio de construcción previsto." }, { fecha: "Abril 2026", texto: "Recorrido oficial: avance conforme a lo programado." }],
    fotos: [],
    fuentes: [{ texto: "Ámbito: Ternium elige México", url: "https://www.ambito.com/ternium-eligio-mexico-levantar-su-nueva-planta-planchones-n5751494" },
              { texto: "Forbes México: inversión de US$ 3.200 M", url: "https://forbes.com.mx/?p=1114077" },
              { texto: "Cluster Industrial: capacidad de la acería", url: "https://clusterindustrial.com.mx/ternium-arranca-laminado-en-frio-y-galvanizado-en-nuevo-leon-con-inversion-de-4-000-mdd/" }]
  },
  {
    id: "malvinas", nombre: "Malvinas · Planta de gas de Camisea", tipo: "Petróleo y gas", pais: "Perú",
    ubicacion: "Megantoni, Cusco (selva del río Urubamba)",
    coordenadas: [-11.84, -72.83], // aprox.
    inversion_usd: 250000000, inversion_nota: "Ampliación proyectada por Pluspetrol, según un informe técnico.",
    avance_pct: 10, estado: "Ampliación proyectada",
    descripcion: "Planta de separación y procesamiento de gas del proyecto Camisea, operada por Pluspetrol, desde donde sale el gas por ductos hacia Pisco y Lima. La ampliación prevista suma dos trenes de compresión para sostener el caudal desde los pozos Cashiriari. Techint construyó los ductos de Camisea y participa en el consorcio TGP. No encontré su rol en esta ampliación.",
    datos: [{ valor: "450 MMcfd", etiqueta: "capacidad de la planta original" }, { valor: "2", etiqueta: "trenes de compresión a instalar" },
            { valor: "+500 km", etiqueta: "de ducto hasta la costa de Pisco" }, { valor: "23,4 %", etiqueta: "de Techint en el consorcio TGP (original)" }],
    colaboradores: ["Pluspetrol Perú Corporation (operadora)", "TGP, consorcio de ductos con participación de Techint", "Socios históricos de Camisea: Hunt Oil, SK, Sonatrach, Tecpetrol"],
    hitos: [{ fecha: "Inicio de Camisea", texto: "Se inaugura la planta Malvinas, los ductos y la planta de Pisco." }, { fecha: "Actualidad", texto: "Pluspetrol planea invertir US$ 250 M en dos trenes de compresión (Lote 88)." }],
    fotos: [],
    fuentes: [{ texto: "ProActivo: US$ 250 M en la planta Malvinas", url: "https://proactivo.com.pe/85343-2/" },
              { texto: "Oil & Gas Journal: puesta en marcha de Camisea", url: "https://www.ogj.com/pipelines-transportation/article/17231389/camisea-plants-pipelines-start-up" },
              { texto: "Offshore Technology: proyecto Camisea", url: "https://www.offshore-technology.com/projects/camisea/" }]
  },
  {
    id: "usiminas", nombre: "Usiminas · Planta de Ipatinga", tipo: "Acero e industria", pais: "Brasil",
    ubicacion: "Ipatinga, Minas Gerais",
    coordenadas: [-19.47, -42.54],
    inversion_usd: 546000000, inversion_nota: "Reforma del Alto Horno 3 (R$ 2.700 M, unos US$ 546 M). Aparte hay R$ 971 M de inversión en 2026.",
    avance_pct: 25, estado: "En modernización (2026 a 2029)",
    descripcion: "Planta siderúrgica de Usiminas con unos 4,5 millones de toneladas de acero por año. El grupo Techint participa como accionista a través de Ternium y Tenaris. Tras reformar el Alto Horno 3, la empresa avanza con cuatro proyectos hasta 2029: reparación y reconstrucción de baterías de la Coquería 2, una planta de molienda e inyección de PCI y un nuevo gasómetro.",
    datos: [{ valor: "4,5 Mt/año", etiqueta: "de acero en Ipatinga" }, { valor: "R$ 2.700 M", etiqueta: "reforma del Alto Horno 3" },
            { valor: "R$ 971 M", etiqueta: "de inversión prevista en 2026" }, { valor: "R$ 1.700 M", etiqueta: "reconstrucción de la batería 4" }],
    colaboradores: ["Usiminas (propietaria y operadora)", "Ternium y Tenaris (accionistas del grupo de control, Grupo Techint)"],
    hitos: [{ fecha: "2011", texto: "El grupo Techint entra al capital de Usiminas." }, { fecha: "Junio 2026", texto: "Planta de molienda e inyección de PCI casi terminada, con operación plena prevista." }, { fecha: "Abril 2028 / enero 2029", texto: "Fin previsto de la batería 3 y de la batería 4 de la Coquería 2." }],
    fotos: [],
    fuentes: [{ texto: "Diário do Comércio: R$ 971 M en 2026", url: "https://diariodocomercio.com.br/economia/usiminas-preve-quase-r-1-bilhao-investimentos-ipatinga/" },
              { texto: "Brasil 61: cuatro proyectos hasta 2029", url: "https://brasil61.com/n/usiminas-planeja-investir-quase-r-1-bilhao-em-quatro-projetos-em-2026-mine261037" },
              { texto: "Global Energy Monitor: planta de Ipatinga", url: "https://gem.wiki/Usiminas_Ipatinga_steel_plant" }]
  }
];
