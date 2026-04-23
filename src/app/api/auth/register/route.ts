import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const supabaseUser = authData.user;
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Failed to create user in auth' }, { status: 500 });
    }

    // 2. Create user in Prisma database (synced with Supabase Auth ID)
    try {
      const user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          name,
          email,
          role: 'user',
        },
      });

      return NextResponse.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (prismaError: any) {
      // If prisma fails, we might want to delete the auth user, but for now we'll just log it
      console.error('Prisma user creation error:', prismaError);
      return NextResponse.json({ error: 'User created in Auth but failed in Database' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
