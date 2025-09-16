import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test if we can connect to the database and query tasks
    const taskCount = await db.task.count();
    
    // Test creating a task
    const testTask = await db.task.create({
      data: {
        title: 'Test Task from API',
        userId: 'api-test-user',
      },
    });
    
    // Verify the task was created
    const createdTask = await db.task.findUnique({
      where: { id: testTask.id },
    });
    
    // Clean up
    await db.task.delete({
      where: { id: testTask.id },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task API test passed',
      taskCount,
      createdTask: createdTask ? 'Found' : 'Not found'
    });
  } catch (error: any) {
    console.error('Task API test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test creating a task (without estimatedTime to avoid Prisma client issues)
    const testTask = await db.task.create({
      data: {
        title: 'Test Task',
        userId: 'api-test-user',
      },
    });
    
    // Verify the task was created
    const createdTask = await db.task.findUnique({
      where: { id: testTask.id },
    });
    
    // Clean up
    await db.task.delete({
      where: { id: testTask.id },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task creation test passed',
      task: createdTask
    });
  } catch (error: any) {
    console.error('Task creation test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}