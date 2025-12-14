import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getSession } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tradeId = parseInt(id, 10);
    const sessionId = await getSession();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (isNaN(tradeId)) {
      return NextResponse.json(
        { error: 'Invalid trade ID' },
        { status: 400 }
      );
    }
    
    const existingTrade = await storage.getTrade(tradeId);
    if (!existingTrade || existingTrade.userId !== sessionId) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { hidden } = body;
    
    if (typeof hidden !== 'boolean') {
      return NextResponse.json(
        { error: 'Hidden must be a boolean' },
        { status: 400 }
      );
    }
    
    const trade = await storage.toggleTradeHidden(tradeId, hidden);
    return NextResponse.json(trade);
  } catch (error) {
    console.error('Toggle hidden error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle trade visibility' },
      { status: 500 }
    );
  }
}
