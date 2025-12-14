import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getSession } from '@/lib/session';
import { insertTradeSchema } from '@shared/schema';
import { z } from 'zod';

export async function GET() {
  try {
    const sessionId = await getSession();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const trades = await storage.getTradesByUser(sessionId);
    return NextResponse.json(trades);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSession();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = insertTradeSchema.parse({ ...body, userId: sessionId });
    const trade = await storage.createTrade(validatedData);
    
    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}

