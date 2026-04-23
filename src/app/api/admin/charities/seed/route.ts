import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const charities = [
      { name: 'Global Water Initiative', description: 'Providing clean water to communities in need.' },
      { name: 'Code for the Future', description: 'Teaching underprivileged youth how to code.' },
      { name: 'Wildlife Defenders', description: 'Protecting endangered species and habitats.' },
      { name: 'Health Without Borders', description: 'Medical aid and supplies globally.' },
      { name: 'Green Earth Foundation', description: 'Combating climate change through reforestation.' },
    ];

    let seededCount = 0;
    for (const charity of charities) {
      const existing = await prisma.charity.findFirst({ where: { name: charity.name } });
      if (!existing) {
        await prisma.charity.create({ data: charity });
        seededCount++;
      }
    }

    return NextResponse.json({ message: `Seeded ${seededCount} charities.` });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
