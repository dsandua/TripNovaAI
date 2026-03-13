import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY,
})

export interface ItineraryDay {
  day: number
  title: string
  description: string
  items: ItineraryItem[]
}

export interface ItineraryItem {
  id: string
  type: 'activity' | 'restaurant' | 'route' | 'hotel'
  name: string
  description: string
  detailedDescription: string // Comprehensive explanation for historical/popular places
  time: string
  duration: string
  cost?: number
  imageSearchTerm: string // New field for specific search
  location?: {
    lat: number
    lng: number
  }
  rating?: number
}

export interface GeneratedItinerary {
  title: string
  slug: string
  destination: string
  origin: string
  duration: number
  travelType: string
  transportType: string
  budget: string
  interests: string[]
  route?: Array<{ name: string; lat: number; lng: number }>
  days: ItineraryDay[]
  totalCost: number
  summary: string
  tips: string[]
}

function getDurationDays(duration: string): number {
  const map: Record<string, number> = {
    'weekend': 3,
    '3-5': 4,
    '1_week': 7,
    '2_weeks': 14,
    'custom': 5,
  }
  return map[duration] || 4
}

function getBudgetRange(budget: string): { min: number; max: number } {
  const map: Record<string, { min: number; max: number }> = {
    '0-500': { min: 0, max: 500 },
    '500-1000': { min: 500, max: 1000 },
    '1000-2000': { min: 1000, max: 2000 },
    '2000-3000': { min: 2000, max: 3000 },
    '3000+': { min: 3000, max: 10000 },
  }
  return map[budget] || { min: 1000, max: 2000 }
}

export async function generateItinerary(formData: {
  origin: string
  destination: string
  transportType: 'plane' | 'car'
  travelers: string
  duration: string
  budget: string
  travelType: string
  interests: string[]
  language?: string
}): Promise<GeneratedItinerary> {
  const durationDays = getDurationDays(formData.duration)
  const budget = getBudgetRange(formData.budget)
  const language = formData.language === 'en' ? 'English' : 'Spanish'
  
  const prompt = `
Generate a professional travel itinerary for ${formData.destination} starting from ${formData.origin}.
ALL CONTENT MUST BE IN ${language.toUpperCase()}.

TRANSPORT CONTEXT:
- Mode: ${formData.transportType}. 
- Special: If 'car', the journey MUST progress logically through real stops.

JSON REQUIREMENTS:
- "days": exactly ${durationDays} days.
- "items": at least 4 items per day.
- "detailedDescription": Professional travel content (2-3 paragraphs).
- "location": REAL global coordinates.
- "imageSearchTerm": CRITICAL: ONLY 2-3 ENGLISH NOUNS (e.g. "Colosseum,Rome"). NO VERBS, NO SPANISH, NO PUNCTUATION.

Format the response as JSON:
{
  "title": "Trip to ${formData.destination}",
  "slug": "${formData.destination.toLowerCase()}-trip",
  "destination": "${formData.destination}",
  "origin": "${formData.origin}",
  "duration": ${durationDays},
  "travelType": "${formData.travelType}",
  "transportType": "${formData.transportType}",
  "budget": "€${budget.min} - €${budget.max}",
  "interests": ${JSON.stringify(formData.interests)},
  "route": [
    { "name": "${formData.origin}", "lat": 48.8566, "lng": 2.3522 },
    { "name": "${formData.destination}", "lat": 50.8503, "lng": 4.3517 }
  ],
  "days": [
    {
      "day": 1,
      "title": "Welcome",
      "description": "Start of the journey",
      "items": [
        {
          "id": "1",
          "type": "activity",
          "name": "Grand Place",
          "description": "The central square of Brussels.",
          "detailedDescription": "The Grand Place or Grote Markt is the central square of Brussels. It is surrounded by opulent guildhalls and two larger edifice...",
          "time": "09:00",
          "duration": "2 hours",
          "cost": 0,
          "rating": 4.9,
          "imageSearchTerm": "Grand,Place,Brussels",
          "location": { "lat": 50.8467, "lng": 4.3524 }
        }
      ]
    }
  ],
  "totalCost": 1500,
  "summary": "Full trip summary in ${language}.",
  "tips": ["Local tip 1", "Local tip 2"]
}
`

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are an expert travel planner. Generate detailed, realistic travel itineraries with real places only. Provide comprehensive content for the 'detailedDescription' field (historical facts, visitor info, architecture, etc.). Respond always in JSON format. ALL content MUST be in ${language}.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0]?.message?.content || ''
  
  try {
    const itinerary = JSON.parse(response) as GeneratedItinerary
    return itinerary
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    throw new Error('Failed to generate valid itinerary')
  }
}

export async function discoverTrips(params: {
  origin: string
  budget: string
  days: number
  language?: string
}): Promise<Array<{
  destination: string
  country: string
  image: string
  estimatedCost: number
  highlights: string[]
  accommodation: string
  activities: string
  rating: number
}>> {
  const budget = getBudgetRange(params.budget)
  const language = params.language === 'en' ? 'English' : 'Spanish'
  
  const prompt = `
Suggest 3 destinations from ${params.origin} that can be visited within €${budget.min} - €${budget.max} for ${params.days} days.
ALL CONTENT MUST BE IN ${language.toUpperCase()}.

For each destination provide:
- Destination name and country
- Estimated total cost
- Top 3 highlights/attractions
- Type of accommodation recommended
- Main activities

Respond ONLY as JSON array:
[
  {
    "destination": "Name",
    "country": "Country",
    "image": "unsplash_url",
    "estimatedCost": 1200,
    "highlights": ["H1", "H2", "H3"],
    "accommodation": "Description",
    "activities": "Description",
    "rating": 4.8
  }
]
`

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a travel expert. Suggest destinations based on budget and preferences. Respond always in JSON format. ALL content MUST be in ${language}.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0]?.message?.content || ''
  
  try {
    const data = JSON.parse(response)
    // Handle both array response and object { trips: [] } response
    return Array.isArray(data) ? data : (data.trips || [])
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    throw new Error('Failed to discover trips')
  }
}
