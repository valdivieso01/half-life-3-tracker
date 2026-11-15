import { Pool } from 'pg';
import { Plegaria, RespuestaPlegariasPaginadas, RecordFichero } from '@/types/hl3';

/**
 * CAPA DE BASE DE DATOS POSTGRESQL (src/lib/db.ts)
 * - En local: lee DATABASE_URL desde Docker o `.env.local`
 * - En Vercel: lee DATABASE_URL inyectado por Vercel (Neon Postgres)
 */
const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
// Neon en Vercel inyecta "?sslmode=require". Lo normalizamos a "sslmode=verify-full"
// para mantener la máxima seguridad SSL y evitar el warning de pg-connection-string.
const connectionString = rawUrl.replace('sslmode=require', 'sslmode=verify-full');

const pool = new Pool({
  connectionString,
});

export const PLEGARIAS_FALLBACK_DEFAULT: Plegaria[] = [
  {
    id: 1793581961810,
    autor: 'Tyler',
    mensaje:
      'I bought the Orange Box on physical DVD back in high school. My hair is gray now Gabe, please just let Freeman finish what he started',
    fecha: 'Nov 2, 2026',
    amenes: 1,
    ipAutor: 'seed',
    ipsAmen: [],
  },
  {
    id: 1793062323336,
    autor: 'Javier',
    mensaje: 'Largalo gordo antes de que me jubile, tengo la palanca lista desde 2007.',
    fecha: '26 de oct de 2026',
    amenes: 2,
    ipAutor: 'seed',
    ipsAmen: [],
  },
];

export const RECORDS_ARCADE_DEFAULT: RecordFichero[] = [
  { id: 1, tag: 'GABEN', puntos: 15200, fecha: 'VALVE' },
  { id: 2, tag: 'FREEM', puntos: 12400, fecha: 'HEV-4' },
  { id: 3, tag: 'BARNY', puntos: 9800, fecha: 'SEC-C' },
  { id: 4, tag: 'ALYXV', puntos: 7600, fecha: 'CIT17' },
  { id: 5, tag: 'G-MAN', puntos: 5500, fecha: 'STASIS' },
];

let tablasInicializadas = false;

async function asegurarTablasPostgres() {
  if (tablasInicializadas) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contador_hl3 (
      id INT PRIMARY KEY,
      total INT NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    INSERT INTO contador_hl3 (id, total)
    VALUES (1, 1)
    ON CONFLICT (id) DO NOTHING;
  `);

  // Tabla para el contador global de cachetadas a Gabe
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cachetadas_gabe (
      id INT PRIMARY KEY,
      total INT NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    INSERT INTO cachetadas_gabe (id, total)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS plegarias_hl3 (
      id BIGINT PRIMARY KEY,
      autor TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      fecha TEXT NOT NULL,
      amenes INT NOT NULL DEFAULT 0,
      ip_autor TEXT,
      ips_amen JSONB NOT NULL DEFAULT '[]'::jsonb
    );
  `);

  const res = await pool.query('SELECT COUNT(*)::int AS cantidad FROM plegarias_hl3');
  if (res.rows[0].cantidad === 0) {
    await pool.query(`
      INSERT INTO plegarias_hl3 (id, autor, mensaje, fecha, amenes, ip_autor, ips_amen)
      VALUES (
        1793062323336,
        'Javier',
        'Largalo gordo antes de que me jubile, tengo la palanca lista desde 2007.',
        '26 de oct de 2026',
        2,
        'seed',
        '[]'::jsonb
      )
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  // Tabla para el Hall of Fame de Fichines / Récords globales del minijuego
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records_arcade (
      id SERIAL PRIMARY KEY,
      tag VARCHAR(5) NOT NULL,
      puntos INT NOT NULL,
      fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Migrar columna existente de VARCHAR(3) a VARCHAR(5) si la tabla ya existía
  await pool.query(`
    ALTER TABLE records_arcade ALTER COLUMN tag TYPE VARCHAR(5);
  `);

  const resRecords = await pool.query('SELECT COUNT(*)::int AS cantidad FROM records_arcade');
  if (resRecords.rows[0].cantidad === 0) {
    await pool.query(`
      INSERT INTO records_arcade (tag, puntos)
      VALUES 
        ('GABEN', 15200),
        ('FREEM', 12400),
        ('BARNY', 9800),
        ('ALYXV', 7600),
        ('G-MAN', 5500);
    `);
  } else {
    // Actualizar tags semilla antiguos de 3 letras a 5 letras y limpiar registro de prueba
    await pool.query(`
      UPDATE records_arcade SET tag = 'GABEN' WHERE tag = 'GAB';
      UPDATE records_arcade SET tag = 'FREEM' WHERE tag = 'GFM';
      UPDATE records_arcade SET tag = 'BARNY' WHERE tag = 'BAR';
      UPDATE records_arcade SET tag = 'ALYXV' WHERE tag = 'ALY';
      UPDATE records_arcade SET tag = 'G-MAN' WHERE tag = 'GMN';
      DELETE FROM records_arcade WHERE tag = 'FRE' AND puntos = 13500;
    `);
  }

  tablasInicializadas = true;
}

export async function incrementarContadorDB(): Promise<number> {
  await asegurarTablasPostgres();
  const res = await pool.query(`
    UPDATE contador_hl3
    SET total = total + 1
    WHERE id = 1
    RETURNING total;
  `);
  return res.rows[0].total;
}

export async function obtenerCachetadasDB(): Promise<number> {
  await asegurarTablasPostgres();
  const res = await pool.query(`
    SELECT total FROM cachetadas_gabe WHERE id = 1;
  `);
  return res.rows[0]?.total ?? 0;
}

export async function incrementarCachetadasDB(cantidad = 1): Promise<number> {
  await asegurarTablasPostgres();
  const incremento = Math.max(1, Math.min(cantidad, 50)); // Tope de seguridad por lote
  const res = await pool.query(`
    UPDATE cachetadas_gabe
    SET total = total + $1
    WHERE id = 1
    RETURNING total;
  `, [incremento]);
  return res.rows[0].total;
}

/**
 * Obtiene una página de plegarias usando LIMIT y OFFSET en SQL,
 * con filtro opcional por nombre de usuario (autor) usando ILIKE.
 */
export async function obtenerPlegariasPaginadasDB(
  pagina = 1,
  porPagina = 5,
  busquedaAutor = ''
): Promise<RespuestaPlegariasPaginadas> {
  const paginaSegura = Math.max(1, pagina);
  const offset = (paginaSegura - 1) * porPagina;
  const filtroLimpio = busquedaAutor.trim();

  try {
    await asegurarTablasPostgres();

    let total = 0;
    let res;

    if (filtroLimpio) {
      const patron = `%${filtroLimpio}%`;
      const conteoRes = await pool.query(
        'SELECT COUNT(*)::int AS total FROM plegarias_hl3 WHERE autor ILIKE $1',
        [patron]
      );
      total = conteoRes.rows[0].total;

      res = await pool.query(
        `
        SELECT id, autor, mensaje, fecha, amenes, ip_autor, ips_amen
        FROM plegarias_hl3
        WHERE autor ILIKE $1
        ORDER BY id DESC
        LIMIT $2 OFFSET $3;
        `,
        [patron, porPagina, offset]
      );
    } else {
      const conteoRes = await pool.query('SELECT COUNT(*)::int AS total FROM plegarias_hl3');
      total = conteoRes.rows[0].total;

      res = await pool.query(
        `
        SELECT id, autor, mensaje, fecha, amenes, ip_autor, ips_amen
        FROM plegarias_hl3
        ORDER BY id DESC
        LIMIT $1 OFFSET $2;
        `,
        [porPagina, offset]
      );
    }

    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

    const plegarias: Plegaria[] = res.rows.map((f) => ({
      id: Number(f.id),
      autor: f.autor,
      mensaje: f.mensaje,
      fecha: f.fecha,
      amenes: Number(f.amenes),
      ipAutor: f.ip_autor,
      ipsAmen: Array.isArray(f.ips_amen) ? f.ips_amen : [],
    }));

    return {
      plegarias,
      total,
      paginaActual: paginaSegura,
      totalPaginas,
    };
  } catch (error) {
    console.warn('⚠️ Error al consultar Postgres en obtenerPlegariasPaginadasDB, usando datos de contingencia:', error);
    const filtradas = filtroLimpio
      ? PLEGARIAS_FALLBACK_DEFAULT.filter((p) =>
          p.autor.toLowerCase().includes(filtroLimpio.toLowerCase())
        )
      : PLEGARIAS_FALLBACK_DEFAULT;
    const total = filtradas.length;
    const paginadas = filtradas.slice(offset, offset + porPagina);
    return {
      plegarias: paginadas,
      total,
      paginaActual: paginaSegura,
      totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    };
  }
}

export async function existePlegariaDeIpDB(ip: string): Promise<boolean> {
  await asegurarTablasPostgres();
  const res = await pool.query(
    'SELECT 1 FROM plegarias_hl3 WHERE ip_autor = $1 LIMIT 1',
    [ip]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function obtenerPlegariaPorIdDB(id: number): Promise<Plegaria | null> {
  await asegurarTablasPostgres();
  const res = await pool.query(
    `
    SELECT id, autor, mensaje, fecha, amenes, ip_autor, ips_amen
    FROM plegarias_hl3
    WHERE id = $1
    LIMIT 1;
    `,
    [id]
  );

  if (res.rowCount === 0) return null;
  const f = res.rows[0];
  return {
    id: Number(f.id),
    autor: f.autor,
    mensaje: f.mensaje,
    fecha: f.fecha,
    amenes: Number(f.amenes),
    ipAutor: f.ip_autor,
    ipsAmen: Array.isArray(f.ips_amen) ? f.ips_amen : [],
  };
}

export async function crearPlegariaDB(
  nueva: Plegaria,
  porPagina = 5
): Promise<RespuestaPlegariasPaginadas> {
  await asegurarTablasPostgres();
  await pool.query(
    `
    INSERT INTO plegarias_hl3 (id, autor, mensaje, fecha, amenes, ip_autor, ips_amen)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb);
    `,
    [
      nueva.id,
      nueva.autor,
      nueva.mensaje,
      nueva.fecha,
      nueva.amenes || 0,
      nueva.ipAutor || '',
      JSON.stringify(nueva.ipsAmen || []),
    ]
  );

  // Al crear una nueva plegaria, devolvemos la página 1 (donde aparece primera)
  return obtenerPlegariasPaginadasDB(1, porPagina);
}

export async function registrarAmenDB(
  id: number,
  nuevosAmenes: number,
  nuevasIpsAmen: string[],
  paginaActual = 1,
  porPagina = 5,
  busquedaAutor = ''
): Promise<RespuestaPlegariasPaginadas> {
  await asegurarTablasPostgres();
  await pool.query(
    `
    UPDATE plegarias_hl3
    SET amenes = $1,
        ips_amen = $2::jsonb
    WHERE id = $3;
    `,
    [nuevosAmenes, JSON.stringify(nuevasIpsAmen), id]
  );

  return obtenerPlegariasPaginadasDB(paginaActual, porPagina, busquedaAutor);
}

/**
 * Obtiene los mejores récords de fichines del minijuego desde Postgres.
 */
export async function obtenerRecordsArcadeDB(limite = 10): Promise<RecordFichero[]> {
  try {
    await asegurarTablasPostgres();
    const res = await pool.query(
      `
      SELECT id, tag, puntos, TO_CHAR(fecha, 'DD/MM/YYYY') as fecha
      FROM records_arcade
      ORDER BY puntos DESC, id ASC
      LIMIT $1;
      `,
      [limite]
    );

    return res.rows.map((r) => ({
      id: Number(r.id),
      tag: String(r.tag).toUpperCase(),
      puntos: Number(r.puntos),
      fecha: r.fecha,
    }));
  } catch (error) {
    console.warn('⚠️ Error al consultar records_arcade en Postgres, usando fallback:', error);
    return RECORDS_ARCADE_DEFAULT;
  }
}

/**
 * Guarda un nuevo puntaje en el Hall of Fame de Fichines en Postgres
 * y retorna la lista actualizada de los mejores récords.
 */
export async function guardarRecordArcadeDB(tag: string, puntos: number): Promise<RecordFichero[]> {
  const tagLimpio = (tag.trim() || 'FREEM').toUpperCase().slice(0, 5);
  const puntosSeguros = Math.max(0, Math.min(Math.floor(puntos), 999999));

  try {
    await asegurarTablasPostgres();
    await pool.query(
      `
      INSERT INTO records_arcade (tag, puntos)
      VALUES ($1, $2);
      `,
      [tagLimpio, puntosSeguros]
    );

    return obtenerRecordsArcadeDB(10);
  } catch (error) {
    console.warn('⚠️ Error al guardar record en Postgres:', error);
    const nuevo: RecordFichero = {
      tag: tagLimpio,
      puntos: puntosSeguros,
      fecha: 'HOY',
    };
    return [...RECORDS_ARCADE_DEFAULT, nuevo]
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 10);
  }
}
