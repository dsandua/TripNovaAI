
import { NextRequest, NextResponse } from 'next/server';
import { translateItinerary } from '@/lib/translator';

export async function POST(request: NextRequest) {
  try {
    const { itinerary, targetLang } = await request.json();
    
    if (!itinerary || !targetLang) {
      return NextResponse.json({ success: false, error: 'Missing logic' }, { status: 400 });
    }

    // Skip redundant processing if language matches (safety catch)
    if (itinerary.originalLanguage === targetLang) {
      return NextResponse.json({ success: true, ...itinerary });
    }

    const translated = await translateItinerary(itinerary, targetLang);
    
    return NextResponse.json({
      success: true,
      ...translated,
      originalLanguage: targetLang, // Update originalLanguage to the NEW one to avoid re-calls
    });
  } catch (error: any) {
    console.error('API Translation Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
