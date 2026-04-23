import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const winnings = await prisma.winner.findMany({
      where: { userId: decoded.id },
      include: {
        draw: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ winnings });
  } catch (error) {
    console.error('Fetch winnings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
