import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getSession } from '@/lib/session';
import { updateTradeSchema } from '@shared/schema';
import { z } from 'zod';

export async function GET(
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
    
    const trade = await storage.getTrade(tradeId);
    if (!trade || trade.userId !== sessionId) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(trade);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trade' },
      { status: 500 }
    );
  }
}

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
    const validatedUpdates = updateTradeSchema.parse(body);
    const trade = await storage.updateTrade(tradeId, validatedUpdates);
    
    return NextResponse.json(trade);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    await storage.deleteTrade(tradeId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    );
  }
}

