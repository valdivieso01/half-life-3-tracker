import { NextResponse } from 'next/server';
import { Plegaria } from '@/types/hl3';
import {
  obtenerPlegariasPaginadasDB,
  existePlegariaDeIpDB,
  obtenerPlegariaPorIdDB,
  crearPlegariaDB,
  registrarAmenDB,
} from '@/lib/db';

const POR_PAGINA_DEFAULT = 4;

function obtenerIpCliente(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagina = Number(searchParams.get('page')) || 1;
  const porPagina = Number(searchParams.get('limit')) || POR_PAGINA_DEFAULT;
  const busquedaAutor = searchParams.get('autor') || '';

  const resultado = await obtenerPlegariasPaginadasDB(pagina, porPagina, busquedaAutor);
  return NextResponse.json(resultado);
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

    const yaComentoEstaIp = await existePlegariaDeIpDB(ip);
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

    const actualizadas = await crearPlegariaDB(nuevaPlegaria, POR_PAGINA_DEFAULT);
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
    const { id, pagina, busquedaAutor } = await request.json();

    const plegariaObjetivo = await obtenerPlegariaPorIdDB(Number(id));
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

    const actualizadas = await registrarAmenDB(
      Number(id),
      nuevosAmenes,
      nuevasIps,
      Number(pagina) || 1,
      POR_PAGINA_DEFAULT,
      busquedaAutor || ''
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
