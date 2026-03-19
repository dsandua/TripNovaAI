import { NextRequest, NextResponse } from 'next/server'
import { generateSmartItinerary } from '@/lib/planner'
import { generateItinerary } from '@/lib/ai'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

function generateSearchHash(data: Record<string, unknown>): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Normalize interests for stable hashing
    const sortedInterests = Array.isArray(formData.interests) 
      ? [...formData.interests].sort() 
      : [];

    // Generate search hash for caching
    const searchHash = generateSearchHash({
      origin: formData.origin,
      destination: formData.destination,
      duration: formData.duration,
      budget: formData.budget,
      travelType: formData.travelType,
      transportType: formData.transportType,
      interests: sortedInterests,
      language: formData.language || 'es',
      _v: 'v17.0', // Updated after photo-fix and interest-sorting
    })

    console.log('--- Generating New Itinerary ---');
    console.log('Destination:', formData.destination);
    console.log('Hash:', searchHash);

    // Check cache first (using anon key for reading)
    const { data: cached, error: cacheErr } = await supabase
      .from('itinerary_cache')
      .select('response_json')
      .eq('search_hash', searchHash)
      .single()

    if (cacheErr && cacheErr.code !== 'PGRST116') {
      console.warn('Cache Check Warning:', cacheErr.message);
    }

    if (cached) {
      console.log('Cache match found!');
      return NextResponse.json({
        success: true,
        ...cached.response_json,
        cached: true,
      })
    }

    // Generate new itinerary with Smart Data (Real Places + AI)
    console.log('No cache found. Calling planner...');
    const itinerary = await generateSmartItinerary(formData)
    console.log('Planner finished successfully.');

    // Generate slug
    const slug = `${itinerary.destination.toLowerCase().replace(/\s+/g, '-')}-${itinerary.duration}-days`

    // Save to database (using admin key for writing)
    console.log('Saving to Supabase...');
    const { data: savedItinerary, error: saveErr } = await supabaseAdmin
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

    if (saveErr) {
      console.error('Supabase Save Error (Itinerary):', saveErr);
    } else {
      console.log('Itinerary saved with ID:', savedItinerary.id);
    }

    // Optimize Supabase Save with Bulk Inserts
    if (savedItinerary) {
      const daysToSave = itinerary.days.map(day => ({
        itinerary_id: savedItinerary.id,
        day_number: day.day,
      }));

      const { data: savedDays, error: daysErr } = await supabaseAdmin
        .from('itinerary_days')
        .insert(daysToSave)
        .select();

      if (daysErr) {
        console.error('Error bulk saving days:', daysErr.message);
      } else if (savedDays) {
        const allItemsToSave = [];
        
        for (const day of itinerary.days) {
          const savedDay = savedDays.find(sd => sd.day_number === day.day);
          if (savedDay) {
            allItemsToSave.push(...day.items.map((item: any, idx: number) => ({
              day_id: savedDay.id,
              place_type: item.type,
              place_name: item.name,
              order_index: idx,
              start_time: item.time,
              notes: item.description,
              cost: item.cost,
            })));
          }
        }

        if (allItemsToSave.length > 0) {
          const { error: itemsErr } = await supabaseAdmin
            .from('itinerary_items')
            .insert(allItemsToSave);
          
          if (itemsErr) {
            console.error('Error bulk saving items:', itemsErr.message);
          }
        }
      }
    }

    // Cache the result
    console.log('Caching final result...');
    await supabaseAdmin
      .from('itinerary_cache')
      .insert({
        search_hash: searchHash,
        response_json: {
          ...itinerary,
          slug,
          originalLanguage: formData.language || 'es',
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })

    console.log('Generation Complete!');
    return NextResponse.json({
      success: true,
      ...itinerary,
      slug,
    })
  } catch (error: any) {
    console.error('CRITICAL ERROR during generation:', error);
    return NextResponse.json(
      { success: false, error: `Error: ${error.message || 'Failed to generate itinerary'}` },
      { status: 500 }
    )
  }
}
