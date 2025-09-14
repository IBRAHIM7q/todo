import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First, check if the note belongs to the user
    const existingNote = await db.note.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });
    
    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    
    await db.note.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}