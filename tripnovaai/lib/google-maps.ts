const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface GooglePlace {
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  place_id: string;
  photo_reference?: string;
}

export function getPlacePhoto(photoReference: string): string {
  if (!GOOGLE_MAPS_API_KEY) return '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}

export async function searchPlaces(query: string, location?: string, language: string = 'es'): Promise<GooglePlace[]> {
  if (!GOOGLE_MAPS_API_KEY) throw new Error('Missing Google Maps API Key');

  const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const url = `${baseUrl}?query=${encodeURIComponent(query)}${location ? `&location=${location}` : ''}&key=${GOOGLE_MAPS_API_KEY}&language=${language}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK') {
    console.error('Google Places Error:', data.status, data.error_message);
    return [];
  }

  return data.results.map((item: any) => ({
    name: item.name,
    address: item.formatted_address,
    rating: item.rating,
    user_ratings_total: item.user_ratings_total,
    types: item.types,
    location: item.geometry.location,
    place_id: item.place_id,
    photo_reference: item.photos?.[0]?.photo_reference,
  }));
}

export interface PlaceRichDetails {
  phone?: string;
  website?: string;
  opening_hours?: string[];
  isOpenNow?: boolean;
  editorial_summary?: string;
}

export async function getPlaceRichDetails(placeId: string, language: string = 'es'): Promise<PlaceRichDetails | null> {
  if (!GOOGLE_MAPS_API_KEY) throw new Error('Missing Google Maps API Key');

  const fields = 'formatted_phone_number,website,opening_hours,editorial_summary';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}&language=${language}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      console.warn('Google Place Details Status:', data.status);
      return null;
    }

    const result = data.result;
    return {
      phone: result.formatted_phone_number,
      website: result.website,
      opening_hours: result.opening_hours?.weekday_text,
      isOpenNow: result.opening_hours?.open_now,
      editorial_summary: result.editorial_summary?.overview,
    };
  } catch (error) {
    console.error('Fetch Error (Place Details):', error);
    return null;
  }
}

export async function getRouteDetails(origin: string, destination: string, mode: 'driving' | 'walking' | 'transit' = 'driving') {
  if (!GOOGLE_MAPS_API_KEY) throw new Error('Missing Google Maps API Key');

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK') return null;

  const route = data.routes[0].legs[0];
  return {
    distance: route.distance.text,
    duration: route.duration.text,
    durationValue: route.duration.value, // in seconds
    steps: route.steps,
  };
}
