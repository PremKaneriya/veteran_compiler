import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { codeSnippets } from '@/drizzle/schema';

export async function POST(request: NextRequest) {
  try {
    const { title, code, output } = await request.json();
    
    const newSnippet = await db.insert(codeSnippets).values({
      title,
      code,
      output,
    }).returning();

    return NextResponse.json(newSnippet[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save code snippet' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snippets = await db.select().from(codeSnippets).orderBy(codeSnippets.createdAt);
    return NextResponse.json(snippets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch code snippets' }, 
      { status: 500 }
    );
  }
}