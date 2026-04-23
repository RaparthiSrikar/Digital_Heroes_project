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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        charityId: true,
        charityPercentage: true,
        charity: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSubscription = user.subscriptions[0] || null;
    const isSubscribed = currentSubscription?.status === 'active' && new Date(currentSubscription.expiryDate) > new Date();

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        charityId: user.charityId,
        charityPercentage: user.charityPercentage,
        charity: user.charity,
        subscription: currentSubscription,
        isSubscribed
      }
    });
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
