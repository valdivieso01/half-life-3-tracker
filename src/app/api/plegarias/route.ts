import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Plegaria } from '@/types/hl3';

// Archivo original subido a tu repositorio de GitHub (con tus datos iniciales)
const ARCHIVO_SEMILLA_REPO = path.join(process.cwd(), 'plegarias.json');

// Donde se guardan las nuevas plegarias en tiempo de ejecución (/tmp en Vercel, raíz en local)
const CARPETA_ESCRITURA = process.env.VERCEL ? os.tmpdir() : process.cwd();
const ARCHIVO_PLEGARIAS = path.join(CARPETA_ESCRITURA, 'plegarias.json');

function obtenerIpCliente(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

async function leerPlegariasDeDisco(): Promise<Plegaria[]> {
  try {
    // 1. Intentamos leer el archivo activo (/tmp/plegarias.json en Vercel o ./plegarias.json en local)
    const contenido = await fs.readFile(ARCHIVO_PLEGARIAS, 'utf-8');
    return JSON.parse(contenido);
  } catch {
    // 2. Si en Vercel /tmp/plegarias.json aún no existe, leemos el plegarias.json que subiste a GitHub
    try {
      const semilla = await fs.readFile(ARCHIVO_SEMILLA_REPO, 'utf-8');
      await fs.writeFile(ARCHIVO_PLEGARIAS, semilla, 'utf-8');
      return JSON.parse(semilla);
    } catch {
      return [];
    }
  }
}

export async function GET() {
  const plegarias = await leerPlegariasDeDisco();
  return NextResponse.json(plegarias);
}

export async function POST(request: Request) {
  try {
    const ip = obtenerIpCliente(request);
    const body = await request.json();
    const autor = (body.autor || 'Anónimo de Ciudad 17').trim();
    const mensaje = (body.mensaje || '').trim();

    if (!mensaje) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío.' },
        { status: 400 }
      );
    }

    const plegariasActuales = await leerPlegariasDeDisco();

    const yaComentoEstaIp = plegariasActuales.some((p) => p.ipAutor === ip);
    if (yaComentoEstaIp) {
      return NextResponse.json(
        {
          error: `⛔ Ya encendiste tu vela desde esta IP (${ip}). Solo se permite 1 plegaria por persona.`,
        },
        { status: 403 }
      );
    }

    const nuevaPlegaria: Plegaria = {
      id: Date.now(),
      autor,
      mensaje,
      fecha: new Date().toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      amenes: 0,
      ipAutor: ip,
      ipsAmen: [],
    };

    const actualizadas = [nuevaPlegaria, ...plegariasActuales];
    await fs.writeFile(
      ARCHIVO_PLEGARIAS,
      JSON.stringify(actualizadas, null, 2),
      'utf-8'
    );

    return NextResponse.json(actualizadas, { status: 201 });
  } catch (error) {
    console.error('Error guardando plegaria:', error);
    return NextResponse.json(
      { error: 'Error al guardar la plegaria' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const ip = obtenerIpCliente(request);
    const { id } = await request.json();
    const plegariasActuales = await leerPlegariasDeDisco();

    const plegariaObjetivo = plegariasActuales.find((p) => p.id === id);
    if (!plegariaObjetivo) {
      return NextResponse.json(
        { error: 'Plegaria no encontrada' },
        { status: 404 }
      );
    }

    const ipsQueDieronAmen = plegariaObjetivo.ipsAmen || [];
    if (ipsQueDieronAmen.includes(ip)) {
      return NextResponse.json(
        {
          error: `🙏 Ya le diste Amén a la plegaria de "${plegariaObjetivo.autor}".`,
        },
        { status: 403 }
      );
    }

    const actualizadas = plegariasActuales.map((p) =>
      p.id === id
        ? {
            ...p,
            amenes: (p.amenes || 0) + 1,
            ipsAmen: [...(p.ipsAmen || []), ip],
          }
        : p
    );

    await fs.writeFile(
      ARCHIVO_PLEGARIAS,
      JSON.stringify(actualizadas, null, 2),
      'utf-8'
    );

    return NextResponse.json(actualizadas);
  } catch (error) {
    console.error('Error sumando amén:', error);
    return NextResponse.json(
      { error: 'Error al actualizar plegaria' },
      { status: 500 }
    );
  }
}
