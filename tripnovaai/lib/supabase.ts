import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          continent: string | null
          region: string | null
          lat: number | null
          lng: number | null
          image_url: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          continent?: string | null
          region?: string | null
          lat?: number | null
          lng?: number | null
          image_url?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          continent?: string | null
          region?: string | null
          lat?: number | null
          lng?: number | null
          image_url?: string | null
          description?: string | null
          created_at?: string
        }
      }
      itineraries: {
        Row: {
          id: string
          user_id: string | null
          slug: string
          title: string
          origin: string | null
          destination: string
          transport_type: string | null
          duration_days: number
          budget_range: string | null
          travel_type: string | null
          interests: string[] | null
          total_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          slug: string
          title: string
          origin?: string | null
          destination: string
          transport_type?: string | null
          duration_days: number
          budget_range?: string | null
          travel_type?: string | null
          interests?: string[] | null
          total_cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          slug?: string
          title?: string
          origin?: string | null
          destination?: string
          transport_type?: string | null
          duration_days?: number
          budget_range?: string | null
          travel_type?: string | null
          interests?: string[] | null
          total_cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      itinerary_days: {
        Row: {
          id: string
          itinerary_id: string
          day_number: number
          date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          day_number: number
          date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          day_number?: number
          date?: string | null
          created_at?: string
        }
      }
      itinerary_items: {
        Row: {
          id: string
          day_id: string
          place_id: string | null
          place_type: string | null
          place_name: string | null
          order_index: number
          start_time: string | null
          end_time: string | null
          notes: string | null
          cost: number | null
          created_at: string
        }
        Insert: {
          id?: string
          day_id: string
          place_id?: string | null
          place_type?: string | null
          place_name?: string | null
          order_index: number
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          cost?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          place_id?: string | null
          place_type?: string | null
          place_name?: string | null
          order_index?: number
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          cost?: number | null
          created_at?: string
        }
      }
      itinerary_cache: {
        Row: {
          id: string
          search_hash: string
          response_json: Record<string, unknown>
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          search_hash: string
          response_json: Record<string, unknown>
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          search_hash?: string
          response_json?: Record<string, unknown>
          created_at?: string
          expires_at?: string | null
        }
      }
    }
  }
}
