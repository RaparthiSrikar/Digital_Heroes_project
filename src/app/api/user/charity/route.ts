import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { charityId, charityPercentage } = await req.json();

    if (!charityId) {
      return NextResponse.json({ error: 'Charity ID is required' }, { status: 400 });
    }

    if (charityPercentage < 0.1 || charityPercentage > 1.0) {
      return NextResponse.json({ error: 'Percentage must be between 10% and 100%' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        charityId,
        charityPercentage
      },
      include: {
        charity: true
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update charity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
