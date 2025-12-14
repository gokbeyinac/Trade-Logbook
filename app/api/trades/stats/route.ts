import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const sessionId = await getSession();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const stats = await storage.getTradeStatisticsByUser(sessionId);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate statistics' },
      { status: 500 }
    );
  }
}

