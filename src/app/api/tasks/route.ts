import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tasks = await db.task.findMany({
      where: { userId: 'cmfj0vqgm0000kz0xxt2k1076' }, // Use the actual user ID
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, priority, category, dueDate } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const task = await db.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        category,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: 'cmfj0vqgm0000kz0xxt2k1076', // Use the actual user ID
      },
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}