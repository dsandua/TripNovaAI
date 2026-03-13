'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

export const translations: Translations = {
  // Header
  nav_explore: { en: 'Explore', es: 'Explorar' },
  nav_discover: { en: 'Discover', es: 'Descubrir' },
  nav_my_trips: { en: 'My Trips', es: 'Mis Viajes' },
  btn_login: { en: 'Login', es: 'Iniciar Sesión' },
  btn_signup: { en: 'Sign Up', es: 'Registrarse' },
  
  // Footer
  footer_rights: { en: 'All rights reserved.', es: 'Todos los derechos reservados.' },
  footer_built_with: { en: 'Built with intelligence for the curious traveler.', es: 'Creado con inteligencia para el viajero curioso.' },
  footer_destinations: { en: 'Destinations', es: 'Destinos' },
  footer_budget_trips: { en: 'Budget Trips', es: 'Viajes Económicos' },
  footer_luxury_stays: { en: 'Luxury Stays', es: 'Estancias de Lujo' },
  footer_support: { en: 'Support', es: 'Soporte' },
  
  // Form
  form_origin: { en: 'Origin', es: 'Origen' },
  form_destination: { en: 'Destination', es: 'Destino' },
  form_origin_placeholder: { en: 'City or Airport', es: 'Ciudad o Aeropuerto' },
  form_destination_placeholder: { en: 'Where to?', es: '¿A dónde vas?' },
  form_transport: { en: 'Transport Type', es: 'Tipo de Transporte' },
  form_plane: { en: 'Plane', es: 'Avión' },
  form_car: { en: 'Car', es: 'Coche' },
  form_travelers: { en: 'Travelers', es: 'Viajeros' },
  form_duration: { en: 'Duration', es: 'Duración' },
  form_budget: { en: 'Budget Range', es: 'Rango de Presupuesto' },
  form_style: { en: 'Travel Style', es: 'Estilo de Viaje' },
  form_interests: { en: 'Interests', es: 'Intereses' },
  form_btn_generate: { en: 'Generate Itinerary', es: 'Generar Itinerario' },
  form_loading: { en: 'Generating...', es: 'Generando...' },
  form_error: { en: 'Something went wrong. Please try again.', es: 'Ocurrió un error. Por favor, inténtalo de nuevo.' },
  error_destination: { en: 'Please enter a destination', es: 'Por favor, introduce un destino' },
  
  // Travel Styles
  tour_cultural: { en: 'Cultural Immersion', es: 'Inmersión Cultural' },
  tour_gastronomic: { en: 'Gastronomic Tour', es: 'Tour Gastronómico' },
  tour_nature: { en: 'Nature & Wildlife', es: 'Naturaleza y Fauna' },
  tour_adventure: { en: 'Adventure Sports', es: 'Deportes de Aventura' },
  tour_road_trip: { en: 'Road Trip', es: 'Viaje por Carretera' },
  tour_explorer: { en: 'Explorer', es: 'Explorador' },
  tour_relaxed: { en: 'Relaxed Travel', es: 'Viaje Relajado' },
  tour_weekend: { en: 'Weekend Escape', es: 'Escapada de Fin de Semana' },

  // Durations
  dur_weekend: { en: 'Weekend (2-3 days)', es: 'Fin de Semana (2-3 días)' },
  dur_3_5: { en: '3-5 Days', es: '3-5 Días' },
  dur_1_week: { en: '1 Week', es: '1 Semana' },
  dur_2_weeks: { en: '2+ Weeks', es: '2+ Semanas' },

  // Travelers
  trav_solo: { en: 'Solo Traveler', es: 'Viajero Solitario' },
  trav_couple: { en: 'Couple', es: 'Pareja' },
  trav_family: { en: 'Family (3-5)', es: 'Familia (3-5)' },
  trav_group: { en: 'Group (6+)', es: 'Grupo (6+)' },

  // Budget
  budget_low: { en: 'Economy', es: 'Económico' },
  budget_high: { en: 'Luxury', es: 'Lujo' },

  // Interests (mapping keys from form)
  interest_hiking: { en: 'Hiking', es: 'Senderismo' },
  interest_cycling: { en: 'Cycling', es: 'Ciclismo' },
  interest_photography: { en: 'Photography', es: 'Fotografía' },
  interest_scenic_viewpoints: { en: 'Scenic Viewpoints', es: 'Miradores' },
  interest_historic_towns: { en: 'Historic Towns', es: 'Pueblos Históricos' },
  interest_gastronomy: { en: 'Gastronomy', es: 'Gastronomía' },
  interest_beaches: { en: 'Beaches', es: 'Playas' },
  interest_nature: { en: 'Nature', es: 'Naturaleza' },
  
  // Itinerary Page
  iti_loading: { en: 'Loading itinerary...', es: 'Cargando itinerario...' },
  iti_not_found: { en: 'Itinerary not found', es: 'Itinerario no encontrado' },
  iti_generate_new: { en: 'Please generate a new itinerary', es: 'Por favor, genera un nuevo itinerario' },
  iti_go_home: { en: 'Go Home', es: 'Volver al Inicio' },
  iti_road_trip_msg: { en: 'Road Trip', es: 'Viaje por Carretera' },
  iti_day_label: { en: 'Day', es: 'Día' },
  iti_tips_label: { en: 'Travel Tips', es: 'Consejos de Viaje' },
  iti_hours_label: { en: 'hours', es: 'horas' },
  iti_budget_label: { en: 'Budget Breakdown', es: 'Desglose de Presupuesto' },
  iti_activity: { en: 'Activity', es: 'Actividad' },
  iti_restaurant: { en: 'Restaurant', es: 'Restaurante' },
  iti_hotel: { en: 'Hotel', es: 'Hotel' },
  iti_info_btn: { en: 'Learn More', es: 'Saber Más' },
  iti_book_btn: { en: 'Book Now', es: 'Reservar' },
  
  // Discover Page
  disc_title: { en: 'Where will your budget take you?', es: '¿A dónde te llevará tu presupuesto?' },
  disc_subtitle: { en: 'Enter your details and let our AI curate a surprise journey.', es: 'Introduce tus datos y deja que nuestra IA cree un viaje sorpresa.' },
  disc_origin: { en: 'Origin City', es: 'Ciudad de Origen' },
  disc_origin_placeholder: { en: 'e.g. London, UK', es: 'ej. Madrid, España' },
  disc_budget: { en: 'Budget (€)', es: 'Presupuesto (€)' },
  disc_days: { en: 'Days', es: 'Días' },
  disc_btn_discover: { en: 'Discover', es: 'Descubrir' },
  disc_searching: { en: 'Searching...', es: 'Buscando...' },
  disc_recommended: { en: 'Recommended for You', es: 'Recomendado para ti' },
  disc_generate_full: { en: 'Generate Full Itinerary', es: 'Generar Itinerario Completo' },
  disc_empty: { en: 'Enter details above to discover destinations!', es: '¡Introduce los detalles arriba para descubrir destinos!' },
  disc_mode: { en: 'Discovery Mode', es: 'Modo Descubrimiento' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string) => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
