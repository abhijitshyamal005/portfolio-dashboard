import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Validate URL
    let apiUrl: URL;
    try {
      apiUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Security: Only allow HTTPS (or HTTP for localhost)
    if (apiUrl.protocol !== 'https:' && apiUrl.hostname !== 'localhost' && !apiUrl.hostname.startsWith('127.0.0.1')) {
      return NextResponse.json(
        { error: 'Only HTTPS URLs are allowed (or localhost for development)' },
        { status: 400 }
      );
    }

    // Fetch from the API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Finance-Dashboard/1.0',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Widget proxy error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - API took too long to respond' },
        { status: 408 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data from API';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
