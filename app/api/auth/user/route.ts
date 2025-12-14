import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const sessionId = await getSession();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = await storage.getUser(sessionId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      id: user.id, 
      username: user.username 
    });
  } catch (error) {
    console.error('Error in /api/auth/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

