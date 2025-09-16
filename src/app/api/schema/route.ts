import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get the Prisma client to access the database directly
    const { Prisma } = require('@prisma/client');
    
    // Test if we can query the database schema
    const result = await db.$queryRaw`PRAGMA table_info(Task);`;
    
    return NextResponse.json({ 
      success: true, 
      schema: result 
    });
  } catch (error: any) {
    console.error('Schema query failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}