import { NextRequest, NextResponse } from 'next/server';
import { executeJavaScript } from '@/lib/executor';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid code provided' }, { status: 400 });
    }

    const result = await executeJavaScript(code);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute code' }, 
      { status: 500 }
    );
  }
}