import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin in Prisma database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

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

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin in Prisma database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

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
