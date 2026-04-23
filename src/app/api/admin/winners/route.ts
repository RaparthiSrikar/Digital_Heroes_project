import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// GET: All winners (admin view for verification)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const winners = await prisma.winner.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        draw: { select: { month: true, winningNumbers: true } },
      },
    });

    return NextResponse.json({ winners });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Approve or reject a winner's claim
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { winnerId, action } = await req.json(); // action: "approve" | "reject"

    if (!winnerId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const winner = await prisma.winner.findUnique({ where: { id: winnerId } });
    if (!winner) return NextResponse.json({ error: 'Winner not found' }, { status: 404 });
    if (winner.status !== 'submitted') {
      return NextResponse.json({ error: 'Winner is not in submitted state' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'paid' : 'rejected';

    const updated = await prisma.winner.update({
      where: { id: winnerId },
      data: { status: newStatus },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, winner: updated });
  } catch (error) {
    console.error('Winner approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
