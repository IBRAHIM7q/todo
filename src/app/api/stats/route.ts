import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // For demo purposes, we'll use the user ID from localStorage
    // In a real app with authentication, this would come from the session
    const userId = req.headers.get('x-user-id') || 'demo-user';
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get tasks
    const tasks = await db.task.findMany({
      where: { userId: userId },
    });
    
    // Get today's focus sessions
    const focusSessions = await db.focusSession.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    // Get notes
    const notes = await db.note.findMany({
      where: { userId: userId },
    });
    
    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const totalFocusTime = focusSessions
      .filter(session => session.type === 'FOCUS')
      .reduce((total, session) => total + session.duration, 0);
    
    const totalBreakTime = focusSessions
      .filter(session => session.type === 'BREAK')
      .reduce((total, session) => total + session.duration, 0);
    
    // Count focus and break sessions
    const focusSessionsCount = focusSessions.filter(session => session.type === 'FOCUS').length;
    const breakSessionsCount = focusSessions.filter(session => session.type === 'BREAK').length;
    
    // Get recent notes (last 3)
    const recentNotes = notes.slice(0, 3).map(note => ({
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
    }));
    
    // Count tasks by priority
    const highPriorityTasks = tasks.filter(task => task.priority === 'HIGH' && !task.completed).length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'MEDIUM' && !task.completed).length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'LOW' && !task.completed).length;
    
    const stats = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        byPriority: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks,
        },
      },
      focus: {
        totalTime: totalFocusTime,
        breakTime: totalBreakTime,
        sessions: focusSessions.length,
        focusSessions: focusSessionsCount,
        breakSessions: breakSessionsCount,
      },
      notes: {
        total: notes.length,
        recent: recentNotes,
      },
      today: {
        date: today.toISOString(),
        isComplete: pendingTasks === 0 && totalTasks > 0,
      },
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}