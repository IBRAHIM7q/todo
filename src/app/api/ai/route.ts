import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  // Declare variables outside try block for fallback access
  let tasks: any[] = [];
  let completedTasks = 0;
  let pendingTasks = 0;
  let totalFocusTime = 0;
  let query = '';
  
  try {
    const body = await request.json();
    query = body.query;
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Get user's tasks for context
    tasks = await db.task.findMany({
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
    
    totalFocusTime = focusSessions
      .filter(session => session.type === 'FOCUS')
      .reduce((total, session) => total + session.duration, 0);
    
    completedTasks = tasks.filter(task => task.completed).length;
    pendingTasks = tasks.filter(task => !task.completed).length;
    
    // Use Google Generative AI with the correct model
    const API_KEY = process.env.GOOGLE_AI_API_KEY || 'AIzaSyDWgy8LQFNH5Xg0YN6fGWo_OIvjtUodQXI';
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Format tasks for the AI prompt with estimated time information
    const tasksInfo = tasks.map(task => 
      `- ${task.title} (${task.priority} priority${task.dueDate ? `, due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}${task.estimatedTime ? `, est. ${task.estimatedTime} min` : ''}${task.completed ? ', completed' : ', pending'})`
    ).join('\n');
    
    const prompt = `You are a productivity assistant integrated into a task management application. 
    Your primary role is to help users with their tasks, time management, and productivity.
    
User's current productivity data:
- Total tasks: ${tasks.length} (${completedTasks} completed, ${pendingTasks} pending)
- Focus time today: ${totalFocusTime} minutes

User's tasks:
${tasksInfo || 'No tasks yet'}

User's question: "${query}"

Please provide a helpful but concise response focused on productivity and task management. 
Keep your response under 200 words and focus on the most important advice.

You can:
1. Help prioritize tasks based on importance, deadlines, and estimated time
2. Suggest time estimates for tasks
3. Recommend scheduling strategies based on available focus time
4. Provide productivity tips
5. Help break down complex tasks
6. Identify which tasks are most important based on priority and deadlines

When analyzing tasks, consider:
- High priority tasks should be addressed first
- Tasks with closer deadlines are more urgent
- Estimated time can help with scheduling
- Completed tasks don't need attention

Format your response in a friendly, conversational tone with clear actionable advice.
Use bullet points or numbered lists when providing steps or suggestions.
Be concise and avoid lengthy explanations.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error processing AI request:', error);
    
    // Fallback to mock response if AI fails
    const mockResponse = `I'm your productivity assistant!

📊 **Your Productivity Snapshot:**
- Total tasks: ${tasks.length} (${completedTasks} completed, ${pendingTasks} pending)
- Focus time today: ${totalFocusTime} minutes

💡 **Quick Advice:**
1. Focus on high-priority tasks first (${pendingTasks} remaining)
2. Take breaks every 25-30 minutes (you've focused ${totalFocusTime} min today)
3. Break large tasks into smaller steps

Use the estimated time feature to better plan your day!`;
    
    return NextResponse.json({ response: mockResponse });
  }
}