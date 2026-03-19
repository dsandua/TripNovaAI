import { searchPlaces, getRouteDetails, getPlacePhoto, getPlaceRichDetails } from './google-maps';
import Groq from 'groq-sdk';
import { GeneratedItinerary, ItineraryDay, ItineraryItem } from './ai';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY,
});

function getDurationNumber(duration: string): number {
  const map: Record<string, number> = {
    'weekend': 3,
    '3-5': 4,
    '1_week': 7,
    '2_weeks': 14,
  };
  return map[duration] || 4;
}

export async function generateSmartItinerary(formData: any): Promise<GeneratedItinerary> {
  const { 
    destination, duration, language = 'es'
  } = formData;
  
  console.log('--- Super simplified Planner ---', destination);
  const langLabel = language === 'en' ? 'English' : 'Spanish';
  const durationDays = getDurationNumber(duration);
  
  // 1. Fetch real places from Google Maps
  const queries = [
    `top sights and landmarks in ${destination}`,
    `best local food and restaurants in ${destination}`,
    `popular neighborhoods and local gems in ${destination}`
  ];

  const searchResults = await Promise.all(
    queries.map(q => searchPlaces(q, undefined, language).catch(() => []))
  );

  const realPlaces = searchResults.flat().filter((p, i, a) => p && p.name && a.findIndex(pl => pl.name === p.name) === i).slice(0, 30);
  const placesContext = realPlaces.map(p => {
    return `{"n":"${p.name}","l":${JSON.stringify(p.location)},"a":"${p.address}"}`;
  }).join(',');

  // 2. Build the AI Prompt
  const prompt = `
Context Data (JSON): [${placesContext}]

Task: Generate a COMPLETE, DENSE, and EXCITING daily travel itinerary for ${destination}.

STRICT CONSTRAINTS (MANDATORY):
1. Language: ${langLabel} | Duration: EXACTLY ${durationDays} days. YOU MUST GENERATE ALL ${durationDays} DAYS.
2. FULL DAY DENSITY: Every single day MUST contain a full schedule from 09:00 to 22:00.
   - 09:00 - Morning Activity 1
   - 11:30 - Morning Activity 2
   - 13:30 - Lunch at a specific restaurant
   - 15:30 - Afternoon Activity 3
   - 17:30 - Afternoon Activity 4
   - 20:30 - EVERY DAY ALWAYS ENDS WITH A DINNER. ON THE LAST DAY, FINISH ALWAYS with a DINNER AT AN EMBLEMATIC OR RECOMMENDED PLACE ("Cena en un lugar emblemático o recomendado").
   - NO DAY should ever stop at 15:30 or 17:30. ALL days end at 22:00 after dinner.
   - Correct Transport "type": "transport" items between ALL of these.
3. DESCRIPTIVE: Provide extremely detailed, engaging, and professional descriptions (strictly around 80-100 words per item). Use a story-telling tone and mention unique features.
4. COMPLETENESS: Do NOT stop until all days are fully filled. Every day must be as dense as the first.
5. VARIETY & UNIQUENESS: EVERY place, monument, or restaurant must be UNIQUE in the entire itinerary. You MUST NEVER repeat the same location on different days.
6. FORMAT: Strict JSON matching the schema:
{
  "title": string, "slug": string, "destination": "${destination}",
  "duration": ${durationDays},
  "days": [{
    "day": number, "title": string, "description": string,
    "items": [{
      "type": "activity"|"restaurant"|"hotel"|"transport",
      "name": string, "description": string, "detailedDescription": string,
      "time": "HH:MM", "duration": string,
      "location": {"lat": number, "lng": number},
      "rating": number, "imageUrl": string, "address": string
    }]
  }],
  "summary": string, "tips": string[]
}
`;

  try {
    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a world-class travel director and expert storyteller. You EXCEL at creating dense, high-value itineraries with rich, evocative descriptions. Every day you plan is packed with culture, food, and movement. Your descriptions should be detailed and captivating. You MUST provide at least 6-8 items per day (including meals and transport). If you provide a day with only one item, you have FAILED. EVERY DAY MUST END WITH A DINNER. ON THE LAST DAY, YOU MUST ALWAYS INCLUDE A DINNER AT AN EMBLEMATIC PLACE. Language: ${langLabel}.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      });
    } catch (e: any) {
      if (e.status === 429 || e.message?.includes('rate_limit_exceeded')) {
        console.warn('Rate limit on 70b, falling back to 8b...');
        completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are a world-class travel director. You EXCEL at creating dense, high-value itineraries. Language: ${langLabel}. EVERY DAY MUST END WITH A DINNER.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.3,
          max_tokens: 8192,
          response_format: { type: 'json_object' },
        });
      } else {
        throw e;
      }
    }

    const content = completion.choices[0]?.message?.content || '{}';
    
    let response;
    try {
      // Robust JSON extraction
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const cleanContent = jsonMatch ? jsonMatch[0] : content;
      response = JSON.parse(cleanContent);
    } catch (parseErr) {
      console.error('Critical JSON Parse Error:', parseErr);
      throw new Error('Formato de itinerario inválido. Por favor, reintenta la generación.');
    }
    
    if (!response || !response.days || !Array.isArray(response.days)) {
      throw new Error('La respuesta de la IA no es un itinerario válido.');
    }
    
    // 3. Post-Process: Enrich with real data
    const enrichmentPromises: Promise<void>[] = [];
    
    const fallbacks: Record<string, string> = {
      activity: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80', // Nature/Scenic
      restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42399?auto=format&fit=crop&w=800&q=80', // Modern dining
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' // Neutral hotel room
    };

    response.days.forEach((day: any) => {
      (day.items || []).forEach((item: any) => {
        // Clear previously failed/placeholder images so client can apply fresh logic
        if (!item.imageUrl || item.imageUrl === "" || item.imageUrl.includes('placeholder')) {
           item.imageUrl = ''; 
        }

        enrichmentPromises.push((async () => {
          try {
            const enriched = await searchPlaces(`${item.name} ${destination}`, undefined, language);
            if (enriched && enriched.length > 0) {
              const bestMatch = enriched[0];
              if (bestMatch.photo_reference) {
                const realPhoto = getPlacePhoto(bestMatch.photo_reference);
                if (realPhoto) item.imageUrl = realPhoto;
              }
              if (!item.address) item.address = bestMatch.address;
              if (bestMatch.rating) item.rating = bestMatch.rating;
              if (bestMatch.name) item.name = bestMatch.name;
              if (!item.location || (item.location.lat === 0 && item.location.lng === 0)) {
                item.location = bestMatch.location;
              }

              const rich = await getPlaceRichDetails(bestMatch.place_id, language);
              if (rich) {
                if (rich.phone) item.phone = rich.phone;
                if (rich.website) item.website = rich.website;
                if (rich.opening_hours) item.openingHours = rich.opening_hours;
                if (rich.isOpenNow !== undefined) item.isOpenNow = rich.isOpenNow;
                if (rich.editorial_summary) {
                  item.editorialSummary = rich.editorial_summary;
                  // ONLY overwrite if descriptions are very short, otherwise trust AI language
                  if (!item.description || item.description.length < 20) {
                    item.description = rich.editorial_summary;
                  }
                  if (!item.detailedDescription) {
                    item.detailedDescription = rich.editorial_summary;
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Failed to enrich ${item.name}:`, e);
          }
        })());
      });
    });

    await Promise.all(enrichmentPromises);
    
    return response as GeneratedItinerary;
  } catch (error: any) {
    console.error('Groq/Parser Error:', error.message);
    throw new Error(`AI Generation failed: ${error.message}`);
  }
}
