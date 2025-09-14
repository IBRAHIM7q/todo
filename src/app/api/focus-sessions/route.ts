import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // For demo purposes, we'll use the user ID from localStorage
    // In a real app with authentication, this would come from the session
    const userId = req.headers.get('x-user-id') || 'demo-user';
    
    const sessions = await db.focusSession.findMany({
      where: { userId: userId },
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
    
    if (!duration || !type) {
      return NextResponse.json({ error: 'Duration and type are required' }, { status: 400 });
    }
    
    const sessionRecord = await db.focusSession.create({
      data: {
        duration,
        type,
        userId: user.id,
      },
    });
    
    return NextResponse.json(sessionRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating focus session:', error);
    return NextResponse.json({ error: 'Failed to create focus session' }, { status: 500 });
  }
}