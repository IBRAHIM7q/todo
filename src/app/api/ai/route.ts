import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Get user's tasks for context
    const tasks = await db.task.findMany({
      where: { userId: 'cmfj0vqgm0000kz0xxt2k1076' }, // Use the actual user ID
      orderBy: { createdAt: 'desc' },
    });
    
    // Get today's focus sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const focusSessions = await db.focusSession.findMany({
      where: {
        userId: 'cmfj0vqgm0000kz0xxt2k1076', // Use the actual user ID
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
- Today's focus time: ${Math.floor(totalFocusTime / 60)} hours ${totalFocusTime % 60} minutes
- High priority tasks: ${tasks.filter(task => task.priority === 'HIGH' && !task.completed).length}
- Medium priority tasks: ${tasks.filter(task => task.priority === 'MEDIUM' && !task.completed).length}
- Low priority tasks: ${tasks.filter(task => task.priority === 'LOW' && !task.completed).length}

Recent tasks:
${tasks.slice(0, 5).map(task => `- ${task.title} (${task.priority} priority, ${task.completed ? 'completed' : 'pending'})`).join('\n')}
    `;
    
    // Initialize ZAI
    const zai = await ZAI.create();
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful productivity assistant. Based on the user's current task data and focus time, provide personalized advice, task prioritization, and productivity tips. Be encouraging and practical. Keep responses concise but helpful. Context: ${context}`
        },
        {
          role: 'user',
          content: query
        }
      ],
    });
    
    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";
    
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in AI assistant:', error);
    
    // Fallback response if AI fails
    const fallbackResponses = [
      "Based on your current tasks, I recommend focusing on high-priority items first. You're doing great!",
      "You've been productive today! Consider taking a short break before tackling more tasks.",
      "Great progress on your tasks! Keep up the good work and maintain your focus.",
      "I notice you have several pending tasks. Let's prioritize them by importance and deadline."
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({ 
      response: fallbackResponse,
      fallback: true 
    });
  }
}