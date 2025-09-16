import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { title, estimatedTime } = await request.json();
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
    
    // Test creating a task with estimatedTime
    const task = await db.task.create({
      data: {
        title: title || 'Test Task',
        userId: user.id,
        estimatedTime: estimatedTime || null,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      task 
    });
  } catch (error) {
    console.error('Test task creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}