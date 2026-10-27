import { Pool } from 'pg';
import { Plegaria } from '@/types/hl3';

/**
 * CAPA DE BASE DE DATOS POSTGRESQL (src/lib/db.ts)
 * - En local: lee DATABASE_URL desde tu `.env.local` (conectándose a tu Docker en localhost:5432)
 * - En Vercel: lee DATABASE_URL inyectado por Vercel (conectándose a Neon Postgres en la nube)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
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

export async function obtenerPlegariasDB(): Promise<Plegaria[]> {
  await asegurarTablasPostgres();
  const res = await pool.query(`
    SELECT id, autor, mensaje, fecha, amenes, ip_autor, ips_amen
    FROM plegarias_hl3
    ORDER BY id DESC;
  `);

  return res.rows.map((f) => ({
    id: Number(f.id),
    autor: f.autor,
    mensaje: f.mensaje,
    fecha: f.fecha,
    amenes: Number(f.amenes),
    ipAutor: f.ip_autor,
    ipsAmen: Array.isArray(f.ips_amen) ? f.ips_amen : [],
  }));
}

export async function crearPlegariaDB(nueva: Plegaria): Promise<Plegaria[]> {
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

  return obtenerPlegariasDB();
}

export async function registrarAmenDB(
  id: number,
  nuevosAmenes: number,
  nuevasIpsAmen: string[]
): Promise<Plegaria[]> {
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

  return obtenerPlegariasDB();
}
