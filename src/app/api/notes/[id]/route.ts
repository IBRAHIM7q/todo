import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    // Await the params
    const { id } = await params;
    
    // First, check if the note belongs to the user
    const existingNote = await db.note.findUnique({
      where: { id: id },
      select: { userId: true },
    });
    
    if (!existingNote || existingNote.userId !== userId) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    
    await db.note.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}