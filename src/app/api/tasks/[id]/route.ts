import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, description, completed, priority, category, dueDate } = await request.json();
    
    // First, check if the task belongs to the user
    const existingTask = await db.task.findUnique({
      where: { id: params.id },
    });
    
    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    const task = await db.task.update({
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
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First, check if the task belongs to the user
    const existingTask = await db.task.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });
    
    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    await db.task.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}