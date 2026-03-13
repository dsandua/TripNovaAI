import { NextRequest, NextResponse } from 'next/server'
import { discoverTrips } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()
    
    const trips = await discoverTrips(params)
    
    return NextResponse.json({
      success: true,
      trips,
    })
  } catch (error) {
    console.error('Error discovering trips:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to discover trips' },
      { status: 500 }
    )
  }
}
