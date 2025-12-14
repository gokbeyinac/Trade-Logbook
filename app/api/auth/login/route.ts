import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { loginSchema } from '@shared/schema';
import { z } from 'zod';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user || user.pin !== validatedData.pin) {
      return NextResponse.json(
        { error: 'Invalid username or PIN' },
        { status: 401 }
      );
    }
    
    await setSession(user.id);
    
    return NextResponse.json({ 
      id: user.id, 
      username: user.username 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to login';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

