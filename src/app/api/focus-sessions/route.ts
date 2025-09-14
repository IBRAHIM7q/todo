import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await db.focusSession.findMany({
      where: { userId: 'cmfj0vqgm0000kz0xxt2k1076' }, // Use the actual user ID
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch focus sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { duration, type } = await request.json();
    
    if (!duration || !type) {
      return NextResponse.json({ error: 'Duration and type are required' }, { status: 400 });
    }
    
    const session = await db.focusSession.create({
      data: {
        duration,
        type,
        userId: 'cmfj0vqgm0000kz0xxt2k1076', // Use the actual user ID
      },
    });
    
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating focus session:', error);
    return NextResponse.json({ error: 'Failed to create focus session' }, { status: 500 });
  }
}