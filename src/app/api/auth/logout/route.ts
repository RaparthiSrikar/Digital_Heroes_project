import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  await supabase.auth.signOut();
  
  return NextResponse.json({ message: 'Logged out successfully' });
}
