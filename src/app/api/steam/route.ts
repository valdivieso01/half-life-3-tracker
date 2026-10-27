import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

interface DatosCacheSteam {
  fechaDia: string;
  horaConsulta: string;
  salio: boolean;
  mensaje: string;
  loQueSiHayEnSteam: { id: number; nombre: string }[];
}

let cacheDelDia: DatosCacheSteam | null = null;
let contadorEnMemoria = 0;

// Diccionario en memoria para Rate Limit por IP: { "127.0.0.1": 1730000000000 }
const ultimaConsultaPorIp: Record<string, number> = {};
const TIEMPO_COOLDOWN_MS = 10 * 1000; // 10 segundos entre consultas por IP

// Archivo original en el repositorio
const ARCHIVO_SEMILLA_CONTADOR = path.join(process.cwd(), 'contador.json');

// En la nube (Vercel) usamos /tmp porque la raíz es de solo lectura; en local usamos la raíz
const CARPETA_DATOS = process.env.VERCEL ? os.tmpdir() : process.cwd();
const ARCHIVO_CONTADOR = path.join(CARPETA_DATOS, 'contador.json');

function obtenerIpCliente(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

async function sumarConsultaEnArchivo(): Promise<number> {
  let total = 0;

  try {
    const contenido = await fs.readFile(ARCHIVO_CONTADOR, 'utf-8');
    const json = JSON.parse(contenido);
    total = json.totalConsultas || 0;
  } catch {
    try {
      const semilla = await fs.readFile(ARCHIVO_SEMILLA_CONTADOR, 'utf-8');
      const jsonSemilla = JSON.parse(semilla);
      total = jsonSemilla.totalConsultas || 0;
    } catch {
      total = 0;
    }
  }

  const nuevoTotal = Math.max(total, contadorEnMemoria) + 1;
  contadorEnMemoria = nuevoTotal;

  try {
    await fs.writeFile(
      ARCHIVO_CONTADOR,
      JSON.stringify({ totalConsultas: nuevoTotal }, null, 2),
      'utf-8'
    );
  } catch {
    // Si el hosting bloquea escritura en disco, mantenemos contadorEnMemoria
  }

  return nuevoTotal;
}

export async function GET(request: Request) {
  try {
    const ip = obtenerIpCliente(request);
    const ahora = Date.now();

    // 1. PROTECCIÓN ANTI-SPAM (Rate Limit por IP en el Backend)
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
        { status: 429 } // 429 = Too Many Requests
      );
    }

    // Registramos el momento exacto de esta consulta válida para esta IP
    ultimaConsultaPorIp[ip] = ahora;

    const hoy = new Date().toISOString().split('T')[0];
    const totalConsultas = await sumarConsultaEnArchivo();

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
