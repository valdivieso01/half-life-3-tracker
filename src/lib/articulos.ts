export interface ArticuloI18n {
  titulo: string;
  subtitulo: string;
  tiempoLectura: string;
  categoria: string;
  resumen: string;
  contenido: {
    seccion: string;
    parrafos: string[];
  }[];
}

export interface ArticuloHL3 {
  slug: string;
  fecha: string;
  autor: string;
  es: ArticuloI18n;
  en: ArticuloI18n;
}

export const ARTICULOS_EDITORIALES: ArticuloHL3[] = [
  {
    slug: 'que-es-project-white-sands-filtracion-valve',
    fecha: 'Noviembre de 2026',
    autor: 'Radar Black Mesa',
    es: {
      titulo: '¿Qué es "Project White Sands"? Todo sobre la mayor filtración de Valve en años',
      subtitulo: 'Análisis detallado del nombre en clave descubierto en los portafolios de actores de doblaje y su conexión directa con Black Mesa.',
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
    en: {
      titulo: 'What is "Project White Sands"? Everything About Valve’s Biggest Leak in Years',
      subtitulo: 'A detailed breakdown of the codename spotted in voice actor portfolios and its unmistakable ties to Black Mesa.',
      tiempoLectura: '4 min read',
      categoria: 'Leaks & Datamining',
      resumen:
        'In mid-2024, one of the most substantial Half-Life leaks in recent memory surfaced: an explicit reference to an unannounced Valve project codenamed "Project White Sands". Here is why that name points directly to New Mexico and Gordon Freeman.',
      contenido: [
        {
          seccion: 'The Origin: Natasha Chandel’s Portfolio',
          parrafos: [
            'The leak originated on the personal website of voice actress Natasha Chandel, whose resume listed ongoing work for Valve Corporation on an unannounced title codenamed "Project White Sands".',
            'Shortly after Reddit communities and investigative creators like Tyler McVicker circulated screenshots, the credit was swiftly scrubbed and the portfolio placed behind a password, a standard reflex when Valve non-disclosure agreements (NDAs) are triggered.',
          ],
        },
        {
          seccion: 'The Geographic Connection: White Sands and Black Mesa',
          parrafos: [
            'In the Half-Life universe penned by Marc Laidlaw and Gabe Newell, the Black Mesa Research Facility is situated deep in the remote desert of New Mexico, USA.',
            'In real-world New Mexico lies the White Sands National Park and the White Sands Missile Range, just miles from Los Alamos. Using "White Sands" as an internal project codename follows Valve’s longstanding custom of assigning code monikers based on setting and lore roots.',
          ],
        },
        {
          seccion: 'Is it Half-Life 3 or a Spin-Off?',
          parrafos: [
            'Concurrently with White Sands, dataminers inspecting Counter-Strike 2 and Dota 2 updates identified recurrent code strings referencing an internal project dubbed "HLX".',
            'The binaries describe single-player first-person systems including HEV suit protection, legacy weapon slots, custom gravity parameters, and Source 2 AI behaviors. Everything strongly suggests White Sands and HLX represent the same initiative: the continuation of Gordon Freeman’s journey.',
          ],
        },
      ],
    },
  },
  {
    slug: 'filtraciones-source-2-hlx-codigo-cs2-deadlock',
    fecha: 'Noviembre de 2026',
    autor: 'Radar Black Mesa',
    es: {
      titulo: 'El misterio de "HLX": Las pistas de Half-Life 3 escondidas en Source 2',
      subtitulo: 'Cómo los dataminers de Counter-Strike 2 y Deadlock descubrieron el desarrollo activo del próximo título de Valve.',
      tiempoLectura: '5 min de lectura',
      categoria: 'Código y Datamining',
      resumen:
        'A diferencia de los rumores infundados de hace una década, los últimos indicios sobre la continuación de Half-Life provienen de binarios reales de compilación en parches de Source 2 analizados por expertos.',
      contenido: [
        {
          seccion: '¿Cómo llega código secreto a los juegos públicos de Valve?',
          parrafos: [
            'Valve Corporation utiliza una arquitectura de código unificada para su motor propietario Source 2. Cuando el equipo de ingeniería actualiza el motor para juegos masivos como Counter-Strike 2, Dota 2 o Deadlock, con frecuencia se incluyen cabeceras compartidas de proyectos en desarrollo que aún no han sido anunciados.',
            'Dataminers como Gabe Follower y la comunidad de SteamDB monitorean los cambios binarios de cada actualización buscando nuevos strings, nombres de entidades y sistemas de físicas.',
          ],
        },
        {
          seccion: 'Las pruebas irrefutables: HEV, Xen y gravedad',
          parrafos: [
            'Durante los últimos meses se han hallado parámetros como "hlx_gravity", referencias directas a xen_flora, mecánicas de armadura de traje de protección ambiental y animaciones específicas para criaturas no humanoides.',
            'A diferencia de Half-Life: Alyx, que estaba fuertemente diseñado alrededor de la realidad virtual y los mandos de movimiento, las entidades de HLX señalan compatibilidad total con teclado y mouse, desplazamiento estándar en primera persona y renderizado para pantallas tradicionales.',
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
    en: {
      titulo: 'The "HLX" Mystery: Half-Life 3 Clues Hidden Inside Source 2',
      subtitulo: 'How dataminers inspecting Counter-Strike 2 and Deadlock patches uncovered active development on Valve’s next flagship.',
      tiempoLectura: '5 min read',
      categoria: 'Code & Datamining',
      resumen:
        'Unlike baseless rumors from a decade ago, the latest clues pointing toward Half-Life’s next chapter stem from tangible compiled engine strings inside public Source 2 patches.',
      contenido: [
        {
          seccion: 'How Does Secret Code Slip Into Public Builds?',
          parrafos: [
            'Valve utilizes a shared codebase across its internal Source 2 repository. When engineers roll out engine revisions for live service games like Counter-Strike 2, Dota 2, or Deadlock, code headers and shared libraries from in-development projects often carry over unnoticed.',
            'Dedicated dataminers such as Gabe Follower and the SteamDB community continuously audit binary changes, cataloging novel entity definitions and physics properties.',
          ],
        },
        {
          seccion: 'The Evidence: HEV Suits, Xen Flora, and Gravity',
          parrafos: [
            'Recent updates revealed properties including "hlx_gravity", direct references to Xen biological flora, classic armor charge absorption logic, and distinct animation sets for non-humanoid fauna.',
            'Crucially, unlike Half-Life: Alyx which was built strictly around VR motion controls, HLX entities specify standard first-person locomotion, full keyboard-and-mouse mappings, and flat-screen rendering pipelines.',
          ],
        },
        {
          seccion: 'Conclusion: The Valve Engine is Running',
          parrafos: [
            'While Valve maintains its characteristic silence regarding announcements, the recurring stream of commits attached to the HLX branch underscores that the studio is actively advancing a major single-player campaign on modern Source 2.',
          ],
        },
      ],
    },
  },
  {
    slug: 'que-paso-con-borealis-el-barco-de-aperture-science',
    fecha: 'Noviembre de 2026',
    autor: 'Radar Black Mesa',
    es: {
      titulo: 'El Borealis y Aperture Science: La clave del final de Half-Life 2',
      subtitulo: 'Repasamos la historia del legendario barco de investigación y por qué es el eje central del conflicto pendiente.',
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
    en: {
      titulo: 'The Borealis and Aperture Science: The Crux of Half-Life 2’s Climax',
      subtitulo: 'A complete retrospective on the vanished research vessel and why it remains the central conflict of the saga.',
      tiempoLectura: '6 min read',
      categoria: 'Lore & Story',
      resumen:
        'Ever since the final moments of Episode Two, tracking down the icebreaker ship Borealis in the Arctic has driven the human resistance. What technology lies inside, and why did Eli Vance demand its immediate destruction?',
      contenido: [
        {
          seccion: 'Origins at Aperture Laboratories',
          parrafos: [
            'The Borealis was an icebreaking research vessel operated by Aperture Science, Black Mesa’s historic corporate rival in the shared Half-Life/Portal universe. Clues in Portal 2 reveal that Aperture engineers were experimenting with massive-scale spatial portal teleportation aboard the ship.',
            'During an early demonstration, a catastrophic containment breach caused the entire vessel and its drydock in Michigan to vanish, re-materializing decades later wedged deep within Arctic shelf ice.',
          ],
        },
        {
          seccion: 'The Resistance Dilemma: Weapon or Threat?',
          parrafos: [
            'In Episode Two’s final act, Dr. Judith Mossman broadcasts an emergency transmission showing the Borealis surrounded by Combine forces.',
            'This sparks a heated philosophical clash among resistance leadership: Dr. Isaac Kleiner argues the tech should be harnessed to break the Combine occupation, while Eli Vance insists with dread that its power is uncontrollable and must be obliterated to prevent another Black Mesa incident.',
          ],
        },
        {
          seccion: 'An Unresolved Fate',
          parrafos: [
            'The ending of Episode Two left Gordon and Alyx poised to depart for the Arctic. Following the retconned conclusion introduced in Half-Life: Alyx, the destination remains the premier unresolved frontier in gaming history.',
          ],
        },
      ],
    },
  },
  {
    slug: 'cronologia-completa-18-anos-esperando-half-life-3',
    fecha: 'Noviembre de 2026',
    autor: 'Radar Black Mesa',
    es: {
      titulo: '18 años de silencio: Cronología de la espera más larga en la historia del PC',
      subtitulo: 'Un repaso año por año desde el lanzamiento de Episode Two en 2007 hasta las filtraciones actuales en 2026.',
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
    en: {
      titulo: '18 Years of Silence: A Timeline of PC Gaming’s Longest Wait',
      subtitulo: 'A retrospective look from Episode Two’s 2007 release to the modern 2026 datamined leaks.',
      tiempoLectura: '5 min read',
      categoria: 'Special Retrospective',
      resumen:
        'On October 10, 2007, Valve anticipated delivering the final chapter of its episodic trilogy for Christmas that year. Almost two decades later, we explore how the industry shifted while fans kept Freeman’s crowbar ready.',
      contenido: [
        {
          seccion: 'The Episodic Ambition (2006-2008)',
          parrafos: [
            'Following Half-Life 2’s critical acclaim in 2004, Valve announced it would circumvent lengthy multi-year dev cycles by releasing short episodic installments every few months.',
            'Episode One arrived in 2006 and Episode Two in 2007 within The Orange Box. However, ambitious feature creep for Episode Three and the explosive explosion of the Steam storefront diverted Valve’s engineering focus toward digital distribution and hardware.',
          ],
        },
        {
          seccion: 'The Meme Era and "Epistle 3" (2010-2019)',
          parrafos: [
            'Throughout the 2010s, "Half-Life 3 Confirmed" cemented itself as an immortal internet meme. In 2017, lead writer Marc Laidlaw posted a thinly veiled plot outline entitled "Epistle 3", widely interpreted as closure on the original Episode Three vision.',
            'Yet the 2020 release of Half-Life: Alyx proved that Valve’s storytelling ambition was far from extinguished, dynamically reopening the series timeline.',
          ],
        },
        {
          seccion: '2026: Reignition',
          parrafos: [
            'Bolstered by the success of the Steam Deck, ongoing Source 2 iterations, and frequent strings linked to project HLX, the prospects of Freeman’s return are more tangible today than at any point in the past eighteen years.',
          ],
        },
      ],
    },
  },
];
