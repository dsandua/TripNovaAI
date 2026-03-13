-- TripNovaAI Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DESTINATIONS
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT,
  region TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PLACES (points of interest)
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  description TEXT,
  visit_duration INTEGER, -- in minutes
  entrance_fee DECIMAL(10,2),
  opening_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RESTAURANTS
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine TEXT,
  price_range INTEGER, -- 1-4 ($-$$$$)
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  avg_cost DECIMAL(10,2),
  rating DECIMAL(2,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HOTELS
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stars INTEGER, -- 1-5
  price_per_night DECIMAL(10,2),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OUTDOOR ROUTES
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hiking' or 'cycling'
  name TEXT NOT NULL,
  distance DECIMAL(10,2), -- in km
  elevation_gain INTEGER, -- in meters
  difficulty TEXT, -- 'easy', 'moderate', 'hard'
  gpx_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ITINERARIES
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  origin TEXT,
  destination TEXT NOT NULL,
  transport_type TEXT,
  duration_days INTEGER NOT NULL,
  budget_range TEXT,
  travel_type TEXT,
  interests TEXT[],
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ITINERARY DAYS
CREATE TABLE public.itinerary_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ITINERARY ITEMS
CREATE TABLE public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  place_type TEXT, -- 'activity', 'restaurant', 'hotel', 'route'
  place_name TEXT,
  order_index INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ITINERARY CACHE
CREATE TABLE public.itinerary_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_hash TEXT UNIQUE NOT NULL,
  response_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- INDEXES
CREATE INDEX idx_destinations_name ON public.destinations(name);
CREATE INDEX idx_destinations_country ON public.destinations(country);
CREATE INDEX idx_places_destination ON public.places(destination_id);
CREATE INDEX idx_restaurants_destination ON public.restaurants(destination_id);
CREATE INDEX idx_hotels_destination ON public.hotels(destination_id);
CREATE INDEX idx_routes_destination ON public.routes(destination_id);
CREATE INDEX idx_itineraries_slug ON public.itineraries(slug);
CREATE INDEX idx_itineraries_user ON public.itineraries(user_id);
CREATE INDEX idx_itinerary_days_itinerary ON public.itinerary_days(itinerary_id);
CREATE INDEX idx_itinerary_items_day ON public.itinerary_items(day_id);
CREATE INDEX idx_cache_search_hash ON public.itinerary_cache(search_hash);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for destinations, places, restaurants, hotels, routes
CREATE POLICY "Public destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public places are viewable by everyone" ON public.places FOR SELECT USING (true);
CREATE POLICY "Public restaurants are viewable by everyone" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public hotels are viewable by everyone" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Public routes are viewable by everyone" ON public.routes FOR SELECT USING (true);

-- Itineraries policies
CREATE POLICY "Users can view their own itineraries" ON public.itineraries FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert their own itineraries" ON public.itineraries FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own itineraries" ON public.itineraries FOR UPDATE USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Cache is public for reading
CREATE POLICY "Cache is viewable by everyone" ON public.itinerary_cache FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cache" ON public.itinerary_cache FOR INSERT WITH CHECK (true);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
