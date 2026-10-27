import { NextResponse } from 'next/server';
import { incrementarContadorDB } from '@/lib/db';

interface DatosCacheSteam {
  fechaDia: string;
  horaConsulta: string;
  salio: boolean;
  mensaje: string;
  loQueSiHayEnSteam: { id: number; nombre: string }[];
}

let cacheDelDia: DatosCacheSteam | null = null;

const ultimaConsultaPorIp: Record<string, number> = {};
const TIEMPO_COOLDOWN_MS = 10 * 1000; // 10 segundos entre consultas por IP

function obtenerIpCliente(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function GET(request: Request) {
  try {
    const ip = obtenerIpCliente(request);
    const ahora = Date.now();

    const ultimoClick = ultimaConsultaPorIp[ip] || 0;
    const tiempoTranscurrido = ahora - ultimoClick;

    if (tiempoTranscurrido < TIEMPO_COOLDOWN_MS) {
      const segundosRestantes = Math.ceil(
        (TIEMPO_COOLDOWN_MS - tiempoTranscurrido) / 1000
      );
      return NextResponse.json(
        {
          error: `⚠️ Calma Freeman: espera ${segundosRestantes}s antes de volver a escanear los servidores.`,
        },
        { status: 429 }
      );
    }

    ultimaConsultaPorIp[ip] = ahora;

    const hoy = new Date().toISOString().split('T')[0];

    // Suma +1 en PostgreSQL (en Vercel) o en contador.json (en local)
    const totalConsultas = await incrementarContadorDB();

    if (cacheDelDia && cacheDelDia.fechaDia === hoy) {
      return NextResponse.json({
        ...cacheDelDia,
        desdeCache: true,
        totalConsultas,
      });
    }

    const respuesta = await fetch(
      'https://store.steampowered.com/api/storesearch/?term=Half-Life+3&l=spanish&cc=US',
      {
        next: { revalidate: 86400 },
      }
    );
    const datosSteam = await respuesta.json();

    const juegosEncontrados = datosSteam.items || [];

    const salioHalfLife3 = juegosEncontrados.some(
      (juego: { name: string }) => juego.name.toLowerCase() === 'half-life 3'
    );

    cacheDelDia = {
      fechaDia: hoy,
      horaConsulta: new Date().toLocaleTimeString(),
      salio: salioHalfLife3,
      mensaje: salioHalfLife3
        ? '🚨 ¡ALERTA MUNDIAL! ¡Half-Life 3 aparece en la tienda de Steam!'
        : 'NO. Gabe Newell sigue sin saber contar hasta 3.',
      loQueSiHayEnSteam: juegosEncontrados
        .slice(0, 3)
        .map((j: { id: number; name: string }) => ({
          id: j.id,
          nombre: j.name,
        })),
    };

    return NextResponse.json({
      ...cacheDelDia,
      desdeCache: false,
      totalConsultas,
    });
  } catch (error) {
    console.error('Error consultando Steam:', error);
    return NextResponse.json(
      { error: 'No se pudo contactar a los servidores de Gabe Newell' },
      { status: 500 }
    );
  }
}
