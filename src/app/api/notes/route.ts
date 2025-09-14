import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // For demo purposes, we'll use the user ID from localStorage
    // In a real app with authentication, this would come from the session
    const userId = req.headers.get('x-user-id') || 'demo-user';
    
    const notes = await db.note.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, tags } = await request.json();
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    // Ensure user exists
    let user = await db.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      user = await db.user.create({
        data: {
          id: userId,
          name: `User ${userId.substring(0, 8)}`,
        },
      });
    }
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const note = await db.note.create({
      data: {
        title,
        content,
        tags: tags || null,
        userId: user.id,
      },
    });
    
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    // First, check if the note belongs to the user
    const note = await db.note.findUnique({
      where: { id: params.id },
    });
    
    if (!note || note.userId !== userId) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    
    await db.note.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}