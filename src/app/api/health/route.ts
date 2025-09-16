import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test if we can connect to the database
    const userCount = await db.user.count();
    
    // Test creating a task without estimatedTime
    const testTask1 = await db.task.create({
      data: {
        title: 'Test Task Without Estimated Time',
        userId: 'health-check-user',
      },
    });
    
    // Clean up
    await db.task.delete({
      where: { id: testTask1.id },
    });
    
    // Test creating a task with estimatedTime
    const testTask2 = await db.task.create({
      data: {
        title: 'Test Task With Estimated Time',
        userId: 'health-check-user',
        estimatedTime: 30,
      },
    });
    
    // Clean up
    await db.task.delete({
      where: { id: testTask2.id },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database health check passed',
      userCount 
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}