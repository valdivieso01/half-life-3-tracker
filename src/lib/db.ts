import { Pool } from 'pg';
import { Plegaria, RespuestaPlegariasPaginadas } from '@/types/hl3';

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

/**
 * Obtiene una página de plegarias usando LIMIT y OFFSET en SQL
 */
export async function obtenerPlegariasPaginadasDB(
  pagina = 1,
  porPagina = 5
): Promise<RespuestaPlegariasPaginadas> {
  await asegurarTablasPostgres();

  const paginaSegura = Math.max(1, pagina);
  const offset = (paginaSegura - 1) * porPagina;

  const conteoRes = await pool.query('SELECT COUNT(*)::int AS total FROM plegarias_hl3');
  const total = conteoRes.rows[0].total;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  const res = await pool.query(
    `
    SELECT id, autor, mensaje, fecha, amenes, ip_autor, ips_amen
    FROM plegarias_hl3
    ORDER BY id DESC
    LIMIT $1 OFFSET $2;
    `,
    [porPagina, offset]
  );

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
  porPagina = 5
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

  return obtenerPlegariasPaginadasDB(paginaActual, porPagina);
}
