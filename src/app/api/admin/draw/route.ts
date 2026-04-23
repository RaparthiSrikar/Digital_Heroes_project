import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const monthStr = new Date().toISOString().slice(0, 7); // e.g. "2024-10"

    // Check if draw already ran this month
    const existingDraw = await prisma.draw.findFirst({
      where: { month: monthStr }
    });
    if (existingDraw) {
      return NextResponse.json({ error: 'A draw has already been run for this month.' }, { status: 400 });
    }

    // 1. Generate 5 unique random numbers (1-45)
    const winningNumbersSet = new Set<number>();
    while (winningNumbersSet.size < 5) {
      winningNumbersSet.add(Math.floor(Math.random() * 45) + 1);
    }
    const winningNumbers = Array.from(winningNumbersSet).sort((a, b) => a - b);
    const winningNumbersStr = winningNumbers.join(',');

    // 2. Fetch Active Subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        expiryDate: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            scores: {
              orderBy: { date: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    // 3. Calculate Prize Pools
    // Assuming $15 per subscription for simple math
    const totalPool = activeSubscriptions.length * 15;
    
    // Split the pool
    const pool5 = totalPool * 0.40;
    const pool4 = totalPool * 0.35;
    const pool3 = totalPool * 0.25;

    // 4. Create the Draw record
    const draw = await prisma.draw.create({
      data: {
        month: monthStr,
        winningNumbers: winningNumbersStr,
        pool5,
        pool4,
        pool3
      }
    });

    // 5. Evaluate Winners
    const match5Winners = [];
    const match4Winners = [];
    const match3Winners = [];

    for (const sub of activeSubscriptions) {
      const userScores = sub.user.scores.map(s => s.score);
      if (userScores.length === 5) {
        let matchCount = 0;
        for (const s of userScores) {
          if (winningNumbersSet.has(s)) matchCount++;
        }

        if (matchCount === 5) match5Winners.push(sub.user.id);
        else if (matchCount === 4) match4Winners.push(sub.user.id);
        else if (matchCount === 3) match3Winners.push(sub.user.id);
      }
    }

    // Calculate individual prizes
    const prize5 = match5Winners.length > 0 ? pool5 / match5Winners.length : 0;
    const prize4 = match4Winners.length > 0 ? pool4 / match4Winners.length : 0;
    const prize3 = match3Winners.length > 0 ? pool3 / match3Winners.length : 0;

    const newWinnersData = [];

    for (const userId of match5Winners) {
      newWinnersData.push({ userId, drawId: draw.id, matchType: 5, status: 'pending', prizeAmount: prize5 });
    }
    for (const userId of match4Winners) {
      newWinnersData.push({ userId, drawId: draw.id, matchType: 4, status: 'pending', prizeAmount: prize4 });
    }
    for (const userId of match3Winners) {
      newWinnersData.push({ userId, drawId: draw.id, matchType: 3, status: 'pending', prizeAmount: prize3 });
    }

    if (newWinnersData.length > 0) {
      await prisma.winner.createMany({
        data: newWinnersData
      });
    }

    return NextResponse.json({
      success: true,
      draw,
      winnersCount: newWinnersData.length,
      prizePools: { pool5, pool4, pool3 },
      winners: newWinnersData
    });

  } catch (error) {
    console.error('Run draw error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const draws = await prisma.draw.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        winners: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });
    return NextResponse.json({ draws });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
