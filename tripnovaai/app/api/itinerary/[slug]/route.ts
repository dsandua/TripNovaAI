import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const { data: itinerary } = await supabase
      .from('itineraries')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!itinerary) {
      return NextResponse.json(
        { success: false, error: 'Itinerary not found' },
        { status: 404 }
      )
    }

    const { data: days } = await supabase
      .from('itinerary_days')
      .select('*')
      .eq('itinerary_id', itinerary.id)
      .order('day_number')

    const daysWithItems = await Promise.all(
      (days || []).map(async (day) => {
        const { data: items } = await supabase
          .from('itinerary_items')
          .select('*')
          .eq('day_id', day.id)
          .order('order_index')
        return { ...day, items: items || [] }
      })
    )

    return NextResponse.json({
      success: true,
      ...itinerary,
      days: daysWithItems,
    })
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch itinerary' },
      { status: 500 }
    )
  }
}
