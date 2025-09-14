import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const notes = await db.note.findMany({
      where: { userId: 'cmfj0vqgm0000kz0xxt2k1076' }, // Use the actual user ID
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
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const note = await db.note.create({
      data: {
        title,
        content,
        tags: tags || null,
        userId: 'cmfj0vqgm0000kz0xxt2k1076', // Use the actual user ID
      },
    });
    
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}