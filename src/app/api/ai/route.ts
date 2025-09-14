import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Get user's tasks for context
    const tasks = await db.task.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Get today's focus sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const focusSessions = await db.focusSession.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    const totalFocusTime = focusSessions
      .filter(session => session.type === 'FOCUS')
      .reduce((total, session) => total + session.duration, 0);
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;
    
    // Create context for AI
    const context = `
User's current productivity data:
- Total tasks: ${tasks.length}
- Completed tasks: ${completedTasks}
- Pending tasks: ${pendingTasks}
- Focus time today: ${totalFocusTime} minutes

User's question: ${query}

Please provide a helpful response based on this productivity data.
`;
    
    // For now, we'll return a mock response since we don't have a real ZAI API key
    // In a real implementation, you would call the ZAI API here
    const mockResponse = `Based on your productivity data:
- You have ${tasks.length} total tasks (${completedTasks} completed, ${pendingTasks} pending)
- You've focused for ${totalFocusTime} minutes today

To help with your question "${query}", I recommend focusing on your most important pending tasks first.`;
    
    return NextResponse.json({ response: mockResponse });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}