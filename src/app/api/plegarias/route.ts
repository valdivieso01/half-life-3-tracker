import { NextResponse } from 'next/server';
import { Plegaria } from '@/types/hl3';
import {
  obtenerPlegariasDB,
  crearPlegariaDB,
  registrarAmenDB,
} from '@/lib/db';

function obtenerIpCliente(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function GET() {
  const plegarias = await obtenerPlegariasDB();
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

    const plegariasActuales = await obtenerPlegariasDB();

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

    const actualizadas = await crearPlegariaDB(nuevaPlegaria);
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
    const plegariasActuales = await obtenerPlegariasDB();

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

    const nuevosAmenes = (plegariaObjetivo.amenes || 0) + 1;
    const nuevasIps = [...ipsQueDieronAmen, ip];

    const actualizadas = await registrarAmenDB(id, nuevosAmenes, nuevasIps);
    return NextResponse.json(actualizadas);
  } catch (error) {
    console.error('Error sumando amén:', error);
    return NextResponse.json(
      { error: 'Error al actualizar plegaria' },
      { status: 500 }
    );
  }
}
