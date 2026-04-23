import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json(); // "monthly" or "yearly"
    
    if (plan !== 'monthly' && plan !== 'yearly') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Simulate Stripe Payment Delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Calculate expiry date
    const expiryDate = new Date();
    if (plan === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Upsert subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: decoded.id },
    });

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan,
          status: 'active',
          expiryDate,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: decoded.id,
          plan,
          status: 'active',
          expiryDate,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Subscription activated' });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
