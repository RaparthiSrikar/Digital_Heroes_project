import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: winnerId } = await params;

    // Verify ownership
    const winner = await prisma.winner.findUnique({
      where: { id: winnerId },
      include: { draw: true },
    });

    if (!winner) return NextResponse.json({ error: 'Winner record not found' }, { status: 404 });
    if (winner.userId !== authUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (winner.status !== 'pending') {
      return NextResponse.json({ error: 'This prize has already been processed' }, { status: 400 });
    }
    if (winner.proofUrl) {
      return NextResponse.json({ error: 'Proof already submitted. Awaiting admin review.' }, { status: 400 });
    }

    // Handle file upload
    // NOTE: On Vercel, local file storage is ephemeral. 
    // You should use Supabase Storage for production file uploads.
    const formData = await req.formData();
    const file = formData.get('proof') as File | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WebP, or PDF.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to /public/uploads/proofs/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'proofs');
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `proof_${winnerId}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const proofUrl = `/uploads/proofs/${filename}`;

    // Update winner record — status moves to "submitted" awaiting admin
    await prisma.winner.update({
      where: { id: winnerId },
      data: { proofUrl, status: 'submitted' },
    });

    return NextResponse.json({ success: true, proofUrl });
  } catch (error) {
    console.error('Claim prize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
