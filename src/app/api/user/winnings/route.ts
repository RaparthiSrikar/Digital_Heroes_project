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

    const winnings = await prisma.winner.findMany({
      where: { userId: authUser.id },
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
