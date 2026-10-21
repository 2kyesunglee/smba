import { NextResponse } from 'next/server';

// Server-side shared state for multi-device sync (smartphone mobile <-> PC admin web)
let serverSharedState: any = null;

export async function GET() {
  return NextResponse.json({
    success: true,
    data: serverSharedState,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body && typeof body === 'object') {
      serverSharedState = {
        ...serverSharedState,
        ...body,
        lastUpdatedAt: new Date().toISOString(),
      };
    }
    return NextResponse.json({
      success: true,
      data: serverSharedState,
      message: 'Server sync completed successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
