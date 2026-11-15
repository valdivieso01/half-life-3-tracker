import { NextResponse } from 'next/server';
import { obtenerRecordsArcadeDB, guardarRecordArcadeDB, RECORDS_ARCADE_DEFAULT } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await obtenerRecordsArcadeDB(10);
    return NextResponse.json({ records });
  } catch (err) {
    console.error('Error al obtener récords de fichines:', err);
    return NextResponse.json({ records: RECORDS_ARCADE_DEFAULT }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const tag = typeof body.tag === 'string' ? body.tag.trim().slice(0, 3) : 'FRE';
    const puntos = typeof body.puntos === 'number' ? Math.floor(body.puntos) : 0;

    if (puntos <= 0) {
      return NextResponse.json({ error: 'Puntaje inválido' }, { status: 400 });
    }

    const recordsActualizados = await guardarRecordArcadeDB(tag, puntos);
    return NextResponse.json({ records: recordsActualizados });
  } catch (err) {
    console.error('Error al registrar récord de fichines:', err);
    return NextResponse.json({ records: RECORDS_ARCADE_DEFAULT }, { status: 200 });
  }
}
