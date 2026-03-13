import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useLanguage } from '@/lib/i18n'

interface TimelineItemProps {
  item: {
    id: string
    type: 'activity' | 'restaurant' | 'route' | 'hotel'
    name: string
    description: string
    detailedDescription?: string
    time: string
    duration: string
    cost?: number
    imageSearchTerm?: string
    rating?: number
  }
  index: number
  destination?: string
}

export default function TimelineItem({ item, index, destination }: TimelineItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useLanguage()
  
  const typeColors = {
    activity: 'secondary',
    restaurant: 'warning',
    route: 'success',
    hotel: 'primary',
  }

  const getLabel = (type: string) => {
    switch(type) {
      case 'activity': return 'VISITA';
      case 'restaurant': return 'GASTRONOMÍA';
      case 'hotel': return 'ALOJAMIENTO';
      case 'route': return 'PASEO';
      default: return type.toUpperCase();
    }
  }

  const getSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash % 20000);
  };

  const seed = getSeed(item.name);
  const searchTerm = item.imageSearchTerm || `${item.name} ${destination || ''}`.trim();
  const imageUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(searchTerm.replace(/\s+/g, ','))},architecture,travel&sig=${seed}`;

  return (
    <div className="relative pl-12 pb-10 last:pb-0 group">
      <div 
        className={`absolute left-2.5 top-1.5 size-3 rounded-full border-4 border-white dark:border-slate-900 ring-4 z-10 transition-transform group-hover:scale-125 ${
          item.type === 'activity' ? 'bg-primary ring-primary/20' :
          item.type === 'restaurant' ? 'bg-orange-500 ring-orange-500/20' :
          item.type === 'route' ? 'bg-emerald-500 ring-emerald-500/20' :
          'bg-primary ring-primary/20'
        }`}
      />
      {index < 20 && <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />}
      
      <div className="flex flex-col md:flex-row gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-primary/20 transition-all">
        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 shadow-inner bg-slate-200">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://source.unsplash.com/featured/800x600/?city,travel&sig=${seed}`;
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{item.name}</h3>
            <Badge variant={typeColors[item.type] as any}>
              {getLabel(item.type)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {item.time}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">hourglass_empty</span>
              {item.duration}
            </span>
            {item.rating && (
              <span className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded text-yellow-700 dark:text-yellow-400 font-bold">
                <span className="material-symbols-outlined text-xs">star</span>
                {item.rating}
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex gap-2">
            {item.type === 'activity' && (
              <Button size="sm" variant="outline" className="text-xs">
                Info
              </Button>
            )}
            {item.type === 'restaurant' && (
              <Button size="sm" variant="secondary" className="text-xs">
                Reserva
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-primary/10 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </Button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={item.name}
      >
        <div className="space-y-6">
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
            <img 
              src={imageUrl.replace('800x600', '1200x800')} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <Badge variant={typeColors[item.type] as any}>{item.type.toUpperCase()}</Badge>
               <span className="text-slate-500 flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">schedule</span>
                 {item.time}
               </span>
               <span className="text-slate-500 flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">payments</span>
                 {item.cost ? `€${item.cost}` : 'Gratis'}
               </span>
            </div>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {item.description}
            </p>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
              <p className="whitespace-pre-wrap leading-relaxed">
                {item.detailedDescription || t('iti_loading')}
              </p>
            </div>
            
            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Button className="flex-1 rounded-xl h-12 text-lg font-bold">
                {t('iti_info_btn') || 'Saber Más'}
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl h-12 text-lg font-bold">
                {t('iti_book_btn') || 'Reservar'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
