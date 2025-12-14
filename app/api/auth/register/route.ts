import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertUserSchema.parse(body);
    
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }
    
    const user = await storage.createUser(validatedData);
    await setSession(user.id);
    
    return NextResponse.json(
      { 
        id: user.id, 
        username: user.username 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Register error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to register';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

