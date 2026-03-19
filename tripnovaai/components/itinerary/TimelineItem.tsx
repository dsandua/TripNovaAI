'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useLanguage } from '@/lib/i18n'

interface TimelineItemProps {
  item: {
    id: string
    type: 'activity' | 'restaurant' | 'route' | 'hotel' | 'transport'
    name: string
    description: string
    detailedDescription?: string
    time: string
    duration: string
    imageUrl?: string
    imageSearchTerm?: string
    rating?: number
    address?: string
    phone?: string
    website?: string
    openingHours?: string[]
    isOpenNow?: boolean
    editorialSummary?: string
  }
  index: number
  destination?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function TimelineItem({ item, index, destination, onMouseEnter, onMouseLeave }: TimelineItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImageError, setIsImageError] = useState(false)
  const { t } = useLanguage()
  
  const typeColors = {
    activity: 'secondary',
    restaurant: 'warning',
    route: 'success',
    hotel: 'primary',
    transport: 'default',
  }

  // Premium Pastel Palette for markers and accents
  const pastelStyles = {
    activity: 'bg-soft-sky border-sky-200 text-sky-600',
    restaurant: 'bg-soft-rose border-rose-200 text-rose-600',
    route: 'bg-soft-mint border-emerald-200 text-emerald-600',
    hotel: 'bg-soft-indigo border-indigo-200 text-indigo-600',
    transport: 'bg-slate-50 border-slate-200 text-slate-500',
  }

  const markerColors = {
    activity: 'bg-sky-400',
    restaurant: 'bg-rose-400',
    route: 'bg-emerald-400',
    hotel: 'bg-indigo-400',
    transport: 'bg-slate-300',
  }

  const getLabel = (type: string, time: string) => {
    switch(type) {
      case 'activity': return t('type_visit') || 'VISITA';
      case 'restaurant': {
        const hour = parseInt(time.split(':')[0]);
        return hour < 17 ? t('type_lunch') : t('type_dinner');
      }
      case 'hotel': return t('type_lodging') || 'ALOJAMIENTO';
      case 'route': return t('type_walk') || 'PASEO';
      case 'transport': return t('type_transport') || 'TRANSPORTE';
      default: return type.toUpperCase();
    }
  }

  const fallbacks: Record<string, string> = {
    activity: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80', // Scenic
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42399?auto=format&fit=crop&w=800&q=80', // Dining
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', // Bed/Room
    route: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'  // Scenic path
  };
  
  const finalImageUrl = (!isImageError && item.imageUrl && item.imageUrl.trim() !== '' && !item.imageUrl.includes('placeholder')) 
    ? item.imageUrl 
    : (fallbacks[item.type] || fallbacks.activity);

  const handleInfo = () => {
    const query = encodeURIComponent(`${item.name} ${destination || ''}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleReserve = () => {
    const query = encodeURIComponent(`${item.name} ${destination || ''} reservation`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const isTransport = item.type === 'transport';

  return (
    <div 
      className={`relative pl-12 ${isTransport ? 'pb-8' : 'pb-14'} last:pb-0 group`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Connector Line */}
      <div className={`absolute left-[1.125rem] top-3 bottom-0 w-[1.5px] ${isTransport ? 'bg-slate-200/50 dashed' : 'bg-slate-100 dark:bg-slate-800'} group-last:hidden`} />
      
      {/* Marker pin - Larger and teardrop shaped */}
       <div 
        className={`absolute left-[0.125rem] ${isTransport ? 'top-1 size-5' : 'top-1 size-10'} z-10 transition-all duration-700 group-hover:scale-110 flex items-center justify-center`}
      >
        {!isTransport ? (
          <div className={`relative size-full flex items-center justify-center`}>
            {/* The Pin Body */}
            <div className={`absolute inset-0 rounded-full rounded-bl-none rotate-[225deg] shadow-premium ${markerColors[item.type]} border-2 border-white dark:border-slate-800`} />
            {/* The Number */}
            <span className="relative z-20 text-[13px] font-black text-white drop-shadow-sm">{index + 1}</span>
          </div>
        ) : (
          <div className={`size-5 rounded-full border-[3px] border-white dark:border-slate-900 shadow-lg ${markerColors[item.type]} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-[10px] text-white">navigation</span>
          </div>
        )}
      </div>
      
      {isTransport ? (
        /* Transport Card - Slim version */
        <div className="flex items-center gap-6 bg-white/40 dark:bg-slate-800/40 px-6 py-4 rounded-3xl border border-dashed border-slate-200 dark:border-white/20 transition-all duration-700 hover:bg-white dark:hover:bg-slate-800/60">
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-slate-400 text-lg">
               {item.name.toLowerCase().includes('bus') ? 'directions_bus' : 
                item.name.toLowerCase().includes('metro') ? 'subway' : 
                item.name.toLowerCase().includes('train') ? 'train' : 'walking'}
             </span>
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
               {item.name.toLowerCase().includes('walking') || item.name.toLowerCase().includes('walk') 
                 ? (t('type_walk') || 'PASEO') 
                 : (item.name ? item.name.replace(/walking/gi, t('type_walk')).replace(/walk/gi, t('type_walk')) : '')}
             </span>
           </div>
           
           <div className="flex-1 flex items-center gap-4 text-[10px] font-bold text-slate-400">
             <span className="flex items-center gap-1.5 opacity-60">
               <span className="material-symbols-outlined text-[14px]">schedule</span>
               {item.time}
             </span>
             <span className="flex items-center gap-1.5 opacity-60">
               <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                {item.duration.toLowerCase()
                  .replace(/hours?|horas?/gi, t('hours_unit'))
                  .replace(/minutes?|minutos?|min/gi, 'min')}
             </span>
             <span className="italic opacity-50 ml-2">{item.description}</span>
           </div>
        </div>
      ) : (
        /* Standard Full Card */
        <div className="flex flex-col md:flex-row gap-10 bg-white/80 dark:bg-slate-800/80 p-8 rounded-[3rem] border border-white dark:border-white/20 shadow-premium hover:shadow-premium-hover hover:border-sky-100/50 dark:hover:border-white/30 transition-all duration-700 hover:-translate-y-1.5 backdrop-blur-2xl">
          <div className="w-full md:w-80 h-60 rounded-[2rem] overflow-hidden shrink-0 shadow-sm relative group/img bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            {!isImageError ? (
              <img
                key={finalImageUrl}
                src={finalImageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
                onError={() => setIsImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center gap-3 p-6 text-center animate-in fade-in duration-500">
                <span className={`material-symbols-outlined text-4xl opacity-40 ${pastelStyles[item.type]}`}>
                  {item.type === 'restaurant' ? 'restaurant' : 
                   item.type === 'hotel' ? 'bed' : 
                   item.type === 'transport' ? 'directions_car' : 'location_on'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                  {item.name}
                </span>
              </div>
            )}
            {!isImageError && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />}
          </div>

          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter leading-none group-hover:text-sky-600 transition-colors">
                  {item.name}
                </h3>
                <Badge variant={typeColors[item.type] as any} className="rounded-full px-5 py-1 text-[9px] font-black uppercase tracking-[0.2em] border-none shadow-sm">
                  {getLabel(item.type, item.time)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 mb-4">
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-colors ${pastelStyles[item.type]}`}>
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  {item.time}
                </span>
                <span className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border-2 border-transparent">
                  <span className="material-symbols-outlined text-[15px] opacity-60">hourglass_empty</span>
                   {item.duration.toLowerCase()
                     .replace(/hours?|horas?/gi, t('hours_unit'))
                     .replace(/minutes?|minutos?|min/gi, 'min')}
                </span>
                {item.rating && (
                  <span className="flex items-center gap-2 bg-amber-50/50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl text-amber-600 dark:text-amber-400 border-2 border-amber-100/20">
                    <span className="material-symbols-outlined text-[15px] fill-1">star</span>
                    {item.rating}
                  </span>
                )}
              </div>
              
              <p className="text-slate-500/80 dark:text-slate-400 text-sm leading-relaxed mb-6 font-semibold">
                {item.description}
              </p>
            </div>
            
            <div className="flex gap-3 mt-4">
                <Button 
                  size="sm" 
                  variant="primary" 
                  className="rounded-2xl text-[11px] font-black uppercase px-8 h-12 hover:scale-105 transition-all font-sans shadow-lg shadow-sky-500/20 bg-sky-500 text-white border-none"
                  onClick={() => setIsModalOpen(true)}
                >
                  {t('details_btn') || 'Detalles'}
                </Button>
            </div>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={item.name}
      >
        <div className="space-y-6 p-2">
          <div className="h-80 w-full rounded-[2.5rem] overflow-hidden shadow-premium relative bg-slate-100 dark:bg-slate-800">
            <img 
              src={finalImageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setIsImageError(true)}
            />
            <div className="absolute top-5 left-5">
               <Badge className={`rounded-xl px-5 py-2 text-[10px] font-black uppercase backdrop-blur-md border-none shadow-sm ${pastelStyles[item.type]}`}>
                 {getLabel(item.type, item.time)}
               </Badge>
            </div>
          </div>
          
          <div className="space-y-4 px-1">
            <div className="flex items-center gap-8 bg-white/40 dark:bg-slate-800/60 p-4 rounded-[1.5rem] border border-white dark:border-white/20">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t('schedule_label')}</span>
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-black text-sm">
                    <span className="material-symbols-outlined text-sky-400 text-lg">schedule</span>
                    {item.time}
                  </span>
               </div>
               
               {item.rating && (
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">{t('rating_label')}</span>
                    <span className="text-amber-500 flex items-center gap-1 font-black text-lg">
                      {item.rating}
                      <span className="material-symbols-outlined fill-1 text-lg">star</span>
                    </span>
                 </div>
               )}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-2xl text-slate-900 dark:text-white leading-tight font-black tracking-tighter">
                {item.name}
              </h4>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-500 dark:text-slate-400 font-bold text-[14px] leading-relaxed opacity-90">
                {item.detailedDescription || item.description}
              </p>

              {item.editorialSummary && (
                <div className="p-6 bg-white/40 dark:bg-slate-800/40 rounded-[2rem] border border-white dark:border-white/20 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sky-400 text-lg">info</span>
                    <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('place_info') || 'Información'}</h5>
                  </div>
                  <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 font-bold">
                    {item.editorialSummary}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {item.website && (
                  <a 
                    href={item.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:border-sky-500/50 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-lg">language</span>
                    {t('place_website')}
                  </a>
                )}
                {item.phone && (
                  <a 
                    href={`tel:${item.phone}`} 
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:border-sky-500/50 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                    {t('place_call')}
                  </a>
                )}
                <Button 
                  className="flex-1 min-w-[140px] rounded-2xl h-11 text-[10px] font-black uppercase tracking-wider bg-sky-500 hover:bg-sky-600 shadow-sm transition-all border-none text-white gap-2"
                  onClick={handleInfo}
                >
                  <span className="material-symbols-outlined text-lg">directions</span>
                  {t('place_directions') || 'Como llegar'}
                </Button>
              </div>

              {item.address && (
                <div className="p-4 bg-white/40 dark:bg-slate-800/60 rounded-[1.5rem] border border-white dark:border-white/20 flex items-center gap-4">
                  <div className="size-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-sky-400 text-xl">pin_drop</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest block leading-none mb-1">{t('location_label')}</span>
                    <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400 leading-tight">{item.address}</p>
                  </div>
                </div>
              )}

              {item.openingHours && item.openingHours.length > 0 && (
                <div className="p-4 bg-white/40 dark:bg-slate-800/60 rounded-[1.5rem] border border-white dark:border-white/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-indigo-400 text-lg">history_toggle_off</span>
                       <span className="text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">{t('place_hours') || 'Horarios'}</span>
                    </div>
                    {item.isOpenNow !== undefined && (
                      <Badge variant={item.isOpenNow ? "success" : "error"} className="rounded-full px-4 h-6 text-[8px] font-black uppercase tracking-widest">
                        {item.isOpenNow ? (t('place_open') || 'Abierto') : (t('place_closed') || 'Cerrado')}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {item.openingHours.map((h, idx) => (
                      <p key={idx} className="text-[11px] font-bold text-slate-500 dark:text-slate-500 flex justify-between">
                        {h}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
