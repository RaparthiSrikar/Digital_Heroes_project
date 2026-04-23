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

    const scores = await prisma.score.findMany({
      where: { userId: authUser.id },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Fetch scores error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { score, date } = await req.json();

    if (!score || !date) {
      return NextResponse.json({ error: 'Score and date are required' }, { status: 400 });
    }

    const numScore = parseInt(score, 10);
    if (isNaN(numScore) || numScore < 1 || numScore > 45) {
      return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
    }

    const scoreDate = new Date(date);
    // Remove time portion for comparison
    scoreDate.setHours(0, 0, 0, 0);

    // Check for duplicate date
    const existingScores = await prisma.score.findMany({
      where: { userId: authUser.id },
      orderBy: { date: 'asc' },
    });

    const hasDuplicateDate = existingScores.some((s: { date: Date }) => {
      const existingDate = new Date(s.date);
      existingDate.setHours(0, 0, 0, 0);
      return existingDate.getTime() === scoreDate.getTime();
    });

    if (hasDuplicateDate) {
      return NextResponse.json({ error: 'A score for this date already exists' }, { status: 400 });
    }

    // Add new score
    await prisma.score.create({
      data: {
        userId: authUser.id,
        score: numScore,
        date: scoreDate,
      },
    });

    // Enforce max 5 scores (delete oldest)
    if (existingScores.length >= 5) {
      const allScores = await prisma.score.findMany({
        where: { userId: authUser.id },
        orderBy: { date: 'asc' },
      });

      if (allScores.length > 5) {
        const scoresToDelete = allScores.slice(0, allScores.length - 5);
        for (const s of scoresToDelete) {
          await prisma.score.delete({ where: { id: s.id } });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Score added successfully' });
  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
