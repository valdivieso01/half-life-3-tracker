import { NextResponse } from 'next/server';
import { obtenerCachetadasDB, incrementarCachetadasDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const total = await obtenerCachetadasDB();
    return NextResponse.json({ total });
  } catch (err) {
    console.error('Error obteniendo cachetadas:', err);
    return NextResponse.json({ total: 0 }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cantidad = typeof body.cantidad === 'number' ? body.cantidad : 1;
    const nuevoTotal = await incrementarCachetadasDB(cantidad);
    return NextResponse.json({ total: nuevoTotal });
  } catch (err) {
    console.error('Error incrementando cachetadas:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

