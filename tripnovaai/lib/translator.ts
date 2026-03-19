
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function translateItinerary(itinerary: any, targetLang: 'en' | 'es') {
  const targetLabel = targetLang === 'en' ? 'English' : 'Spanish';

  // We only want to translate user-facing text: title, day titles/descriptions, 
  // item names/descriptions/detailedDescriptions/editorialSummary/openingHours labels.
  // To avoid breaking the structure or tokens, we'll send a focused prompt.
  
  const systemPrompt = `You are a professional translator specializing in travel and tourism. 
  Your task is to translate the provided JSON itinerary into ${targetLabel}.
  RULES:
  1. Translate ALL human-readable strings (names, descriptions, titles, notes, tips).
  2. DO NOT translate technical IDs, URLs, coordinates (lat/lng), ratings (numbers), or cost numbers.
  3. Keep the EXACT same JSON structure and keys.
  4. Ensure the tone is premium, evocative, and consistent with a high-end travel guide.
  5. Translate days correctly ("Día 1" -> "Day 1" or vice-versa).
  6. Return ONLY the JSON object. No preamble.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(itinerary) }
      ],
      model: 'llama-3.3-70b-specdec', // Fast and accurate
      temperature: 0, // Direct translation
      response_format: { type: 'json_object' }
    });

    const translated = JSON.parse(completion.choices[0].message.content || '{}');
    return translated;
  } catch (error) {
    console.error('Translation Error:', error);
    throw error;
  }
}
