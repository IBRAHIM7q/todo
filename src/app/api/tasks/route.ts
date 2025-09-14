import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // For demo purposes, we'll use the user ID from localStorage
    // In a real app with authentication, this would come from the session
    const userId = req.headers.get('x-user-id') || 'demo-user';
    
    const tasks = await db.task.findMany({
      where: { userId: userId },
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
        userId: user.id,
      },
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, description, completed, priority, category, dueDate } = await request.json();
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    // First, check if the task belongs to the user
    const task = await db.task.findUnique({
      where: { id: params.id },
    });
    
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    const updatedTask = await db.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        completed,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    // First, check if the task belongs to the user
    const task = await db.task.findUnique({
      where: { id: params.id },
    });
    
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    await db.task.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}