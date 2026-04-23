import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const supabaseUser = authData.user;
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Invalid login' }, { status: 401 });
    }

    // 2. Fetch user data from Prisma database
    const user = await prisma.user.findUnique({
      where: { id: supabaseUser.id }
    });

    if (!user) {
      // This should ideally not happen if synced correctly, but we can fallback
      return NextResponse.json({
        user: { id: supabaseUser.id, name: supabaseUser.user_metadata.name || 'User', email: supabaseUser.email, role: 'user' }
      });
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
