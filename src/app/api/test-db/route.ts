import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test if we can access the Task model with estimatedTime field
    const tasks = await db.task.findMany({
      take: 1,
      select: {
        id: true,
        title: true,
        estimatedTime: true,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      sampleTask: tasks[0] || null
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}