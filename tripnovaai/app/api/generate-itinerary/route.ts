import { NextRequest, NextResponse } from 'next/server'
import { generateItinerary } from '@/lib/ai'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

function generateSearchHash(data: Record<string, unknown>): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Generate search hash for caching
    const searchHash = generateSearchHash({
      origin: formData.origin,
      destination: formData.destination,
      duration: formData.duration,
      budget: formData.budget,
      travelType: formData.travelType,
      transportType: formData.transportType,
      interests: formData.interests,
      language: formData.language || 'es',
      _v: 'v8', // Ultimate reset for Unsplash HD and real content
    })

    // Check cache first (using anon key for reading)
    const { data: cached } = await supabase
      .from('itinerary_cache')
      .select('response_json')
      .eq('search_hash', searchHash)
      .single()

    if (cached) {
      return NextResponse.json({
        success: true,
        ...cached.response_json,
        cached: true,
      })
    }

    // Generate new itinerary with AI
    const itinerary = await generateItinerary(formData)

    // Generate slug
    const slug = `${itinerary.destination.toLowerCase().replace(/\s+/g, '-')}-${itinerary.duration}-days`

    // Save to database (using admin key for writing)
    const { data: savedItinerary, error } = await supabaseAdmin
      .from('itineraries')
      .insert({
        slug,
        title: itinerary.title,
        origin: formData.origin,
        destination: formData.destination,
        transport_type: formData.transportType,
        duration_days: itinerary.duration,
        budget_range: formData.budget,
        travel_type: formData.travelType,
        interests: formData.interests,
        total_cost: itinerary.totalCost,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving itinerary:', error)
    }

    // Save itinerary days and items
    if (savedItinerary) {
      for (const day of itinerary.days) {
        const { data: savedDay } = await supabaseAdmin
          .from('itinerary_days')
          .insert({
            itinerary_id: savedItinerary.id,
            day_number: day.day,
          })
          .select()
          .single()

        if (savedDay) {
          for (const item of day.items) {
            await supabaseAdmin
              .from('itinerary_items')
              .insert({
                day_id: savedDay.id,
                place_type: item.type,
                place_name: item.name,
                order_index: day.items.indexOf(item),
                start_time: item.time,
                notes: item.description,
                cost: item.cost,
              })
          }
        }
      }
    }

    // Cache the result
    await supabaseAdmin
      .from('itinerary_cache')
      .insert({
        search_hash: searchHash,
        response_json: {
          ...itinerary,
          slug,
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })

    return NextResponse.json({
      success: true,
      ...itinerary,
      slug,
    })
  } catch (error) {
    console.error('Error generating itinerary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate itinerary' },
      { status: 500 }
    )
  }
}
