export interface ArticuloHL3 {
  slug: string;
  titulo: string;
  subtitulo: string;
  fecha: string;
  autor: string;
  tiempoLectura: string;
  categoria: string;
  resumen: string;
  contenido: {
    seccion: string;
    parrafos: string[];
  }[];
}

export const ARTICULOS_EDITORIALES: ArticuloHL3[] = [
  {
    slug: 'que-es-project-white-sands-filtracion-valve',
    titulo: '¿Qué es "Project White Sands"? Todo sobre la mayor filtración de Valve en años',
    subtitulo: 'Análisis detallado del nombre en clave descubierto en los portafolios de actores de doblaje y su conexión directa con Black Mesa.',
    fecha: 'Noviembre de 2026',
    autor: 'Redacción Radar Black Mesa',
    tiempoLectura: '4 min de lectura',
    categoria: 'Filtraciones y Datamining',
    resumen:
      'A mediados de 2024 surgió una de las filtraciones más sólidas sobre el futuro de Half-Life: una mención explícita a un proyecto secreto de Valve denominado "Project White Sands". Exploramos qué significa este nombre y por qué apunta directamente a Nuevo México y Gordon Freeman.',
    contenido: [
      {
        seccion: 'El origen del leak: El currículum de Natasha Chandel',
        parrafos: [
          'La filtración se produjo en el sitio web profesional de la actriz de voz Natasha Chandel, quien en su historial de proyectos para estudios de videojuegos listó haber trabajado para Valve Corporation en un título bajo el nombre clave "Project White Sands".',
          'Pocas horas después de que la comunidad en Reddit y creadores como Tyler McVicker difundieran la captura de pantalla, la entrada fue eliminada de inmediato y el sitio web de la actriz pasó a modo privado, una reacción habitual cuando se vulneran acuerdos de confidencialidad (NDA) de Valve.',
        ],
      },
      {
        seccion: 'La conexión geográfica: White Sands y el Centro de Investigación de Black Mesa',
        parrafos: [
          'En el universo ficticio de Half-Life creado por Marc Laidlaw y Gabe Newell, las instalaciones del Centro de Investigación de Black Mesa se encuentran ubicadas en algún lugar remoto del desierto de Nuevo México, Estados Unidos.',
          'En la geografía real de Nuevo México se encuentra el Parque Nacional White Sands y el Campo de Pruebas Militar de Misiles White Sands, a escasas millas del laboratorio Los Álamos. El uso de "White Sands" como nombre clave interno sigue el patrón clásico de Valve de bautizar proyectos con topónimos relacionados a la ambientación o el lore de sus sagas.',
        ],
      },
      {
        seccion: '¿Se trata de Half-Life 3 o de un spin-off?',
        parrafos: [
          'Junto a las filtraciones de White Sands, dataminers descubrieron en actualizaciones simultáneas de Counter-Strike 2 y Dota 2 cadenas de texto que hacían referencia a un proyecto titulado "HLX".',
          'Los archivos revelan mecánicas de un juego en primera persona para un solo jugador con traje HEV, armamento clásico, gravedad modificada y enemigos con inteligencia artificial de Source 2. Todo indica que White Sands y HLX son las dos caras de la misma moneda: el regreso de la historia principal de Gordon Freeman.',
        ],
      },
    ],
  },
  {
    slug: 'filtraciones-source-2-hlx-codigo-cs2-deadlock',
    titulo: 'El misterio de "HLX": Las pistas de Half-Life 3 escondidas en Source 2',
    subtitulo: 'Cómo los dataminers de Counter-Strike 2 y Deadlock descubrieron el desarrollo activo del próximo título de Valve.',
    fecha: 'Noviembre de 2026',
    autor: 'Equipo Técnico Radar Black Mesa',
    tiempoLectura: '5 min de lectura',
    categoria: 'Código y Datamining',
    resumen:
      'A diferencia de los rumores infundados de hace una década, los últimos indicios sobre la continuación de Half-Life no provienen de palabras de Gabe Newell, sino de binarios reales de compilación en parches de Source 2 analizados por expertos.',
    contenido: [
      {
        seccion: '¿Cómo llega código secreto a los juegos públicos de Valve?',
        parrafos: [
          'Valve Corporation utiliza una arquitectura de código unificada para su motor propietario Source 2. Cuando el equipo de ingeniería actualiza el motor para juegos masivos como Counter-Strike 2, Dota 2 o su nuevo shooter Deadlock, con frecuencia se incluyen por descuido librerías y cabeceras compartidas de proyectos en desarrollo que aún no han sido anunciados.',
          'Dataminers como Gabe Follower y la comunidad de SteamDB monitorean los cambios binarios de cada actualización buscando nuevos strings, nombres de entidades y sistemas de físicas.',
        ],
      },
      {
        seccion: 'Las pruebas irrefutables: HEV, Xen y gravedad',
        parrafos: [
          'Durante los últimos meses se han hallado parámetros como "hlx_gravity", referencias directas a xen_flora, mecánicas de armadura de traje de protección ambiental y animaciones específicas para criaturas no humanoides.',
          'A diferencia de Half-Life: Alyx, que estaba fuertemente diseñado alrededor de la realidad virtual y los mandos de movimiento, las entidades de HLX señalan compatibilidad total con teclado y mouse, desplazamiento estándar en primera persona y renderizado de escala completa para monitores tradicionales.',
        ],
      },
      {
        seccion: 'Conclusión: La maquinaria de Valve está en marcha',
        parrafos: [
          'Aunque Valve mantiene un silencio hermético respecto a fechas de presentación oficial, la presencia regular de commits y actualizaciones bajo el prefijo HLX confirma que el estudio nunca abandonó la franquicia y se encuentra en una etapa avanzada de desarrollo sobre la última versión de Source 2.',
        ],
      },
    ],
  },
  {
    slug: 'que-paso-con-borealis-el-barco-de-aperture-science',
    titulo: 'El Borealis y Aperture Science: La clave del final de Half-Life 2',
    subtitulo: 'Repasamos la historia del legendario barco de investigación y por qué es el eje central del conflicto pendiente.',
    fecha: 'Noviembre de 2026',
    autor: 'Archivo Histórico Black Mesa',
    tiempoLectura: '6 min de lectura',
    categoria: 'Historia y Lore',
    resumen:
      'Desde el final de Episode Two, la búsqueda del buque rompehielos Borealis en el Ártico se convirtió en el objetivo principal de la resistencia humana. ¿Qué contenía esta nave y por qué Eli Vance exigía destruirla de inmediato?',
    contenido: [
      {
        seccion: 'El origen del barco en Aperture Laboratories',
        parrafos: [
          'El Borealis era un buque de investigación propiedad de Aperture Science, la corporación rival de Black Mesa en el universo compartido de Half-Life y Portal. Según los registros encontrados en Portal 2, la nave contenía tecnología experimental de teleportación y portales a escala masiva.',
          'Durante uno de los experimentos iniciales, se produjo una anomalía espacial catastrófica y el barco completo desapareció de su dique seco en Michigan, reapareciendo décadas más tarde atrapado en una gruesa capa de hielo ártico.',
        ],
      },
      {
        seccion: 'El dilema de la resistencia: ¿Usarlo o destruirlo?',
        parrafos: [
          'En los minutos finales de Half-Life 2: Episode Two, la doctora Judith Mossman envía una transmisión de socorro mostrando las coordenadas del Borealis rodeado por fuerzas de la Alianza (Combine).',
          'Esto desata un debate crucial entre los líderes de la resistencia: mientras el doctor Isaac Kleiner aboga por capturar la nave para usar su poder tecnológico como arma contra la Alianza, Eli Vance advierte aterrado que nada de lo que hay allí debe caer en manos de nadie, exigiendo su destrucción total para evitar una catástrofe similar a la de Black Mesa.',
        ],
      },
      {
        seccion: 'El desenlace pendiente',
        parrafos: [
          'La trágica muerte de Eli Vance a manos de los Consejeros de la Alianza al final del episodio dejó la misión en manos de Gordon Freeman y Alyx Vance. Tras los eventos del epílogo de Half-Life: Alyx, la trama sobre el destino del Borealis permanece abierta, esperando ser narrada en el capítulo definitivo de la saga.',
        ],
      },
    ],
  },
  {
    slug: 'cronologia-completa-18-anos-esperando-half-life-3',
    titulo: '18 años de silencio: Cronología de la espera más larga en la historia del PC',
    subtitulo: 'Un repaso año por año desde el lanzamiento de Episode Two en 2007 hasta las filtraciones actuales en 2026.',
    fecha: 'Noviembre de 2026',
    autor: 'Redacción Radar Black Mesa',
    tiempoLectura: '5 min de lectura',
    categoria: 'Crónica Especial',
    resumen:
      'El 10 de octubre de 2007 Valve prometía lanzar la tercera parte de su trilogía episódica en Navidad de ese mismo año. Casi dos décadas después, analizamos cómo la industria del videojuego cambió mientras la comunidad aún aguarda el retorno de Freeman.',
    contenido: [
      {
        seccion: 'La promesa del modelo episódico (2006-2008)',
        parrafos: [
          'Tras el monumental éxito de Half-Life 2 en 2004, Valve anunció que en lugar de esperar otros seis años para una secuela completa, publicarían tres episodios cortos cada pocos meses.',
          'Episode One llegó en 2006 y Episode Two en 2007 como parte de The Orange Box. Sin embargo, los desafíos técnicos para desarrollar la tecnología requerida por Episode Three y el meteórico auge de la tienda Steam transformaron el modelo de negocio de Valve para siempre.',
        ],
      },
      {
        seccion: 'La era del meme y "Epistle 3" (2010-2019)',
        parrafos: [
          'Durante más de una década, la frase "Half-Life 3 confirmado" se convirtió en el meme por excelencia de internet. En 2017, el retiro de Marc Laidlaw y la publicación de su guion alternativo "Epistle 3" pareció sepultar cualquier esperanza oficial.',
          'Sin embargo, el lanzamiento de Half-Life: Alyx en 2020 demostró que el equipo creativo de Valve aún sentía pasión por el universo de Gordon Freeman y reabrió la puerta a futuras entregas.',
        ],
      },
      {
        seccion: '2026: La esperanza renovada',
        parrafos: [
          'Hoy, con la consolidación de la Steam Deck, el avance de Source 2 y las constantes menciones a proyectos internos de Valve, la posibilidad de ver Half-Life 3 es más real y palpable que en cualquier otro momento de los últimos 18 años.',
        ],
      },
    ],
  },
];
