import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { Event } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const categoryGradients: Record<string, string> = {
  movies:   'from-red-600 to-rose-500',
  concerts: 'from-purple-600 to-violet-500',
  sports:   'from-green-600 to-emerald-500',
  comedy:   'from-yellow-500 to-amber-400',
  live:     'from-blue-600 to-cyan-500',
};

const categoryGlows: Record<string, string> = {
  movies:   'group-hover:shadow-red-500/30',
  concerts: 'group-hover:shadow-purple-500/30',
  sports:   'group-hover:shadow-green-500/30',
  comedy:   'group-hover:shadow-yellow-500/30',
  live:     'group-hover:shadow-blue-500/30',
};

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const gradient = categoryGradients[event.category] ?? 'from-primary to-accent';
  const glow     = categoryGlows[event.category]     ?? 'group-hover:shadow-primary/30';

  return (
    <div
      onClick={onClick}
      className={`event-card card-shimmer relative cursor-pointer group transition-all duration-300
        shadow-lg ${glow} group-hover:shadow-2xl group-hover:-translate-y-2`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          width={300}
          height={400}
        />

        {/* Gradient overlay — intensifies on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent
          transition-opacity duration-300" />

        {/* Moving colour strip at top */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}
          style={{ backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }}
        />

        {/* Category badge */}
        <Badge
          className={`absolute top-3 left-3 bg-gradient-to-r ${gradient} text-white border-0 text-xs font-medium shadow-md`}
        >
          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
        </Badge>

        {/* Rating */}
        {event.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-white text-xs font-semibold">{event.rating}</span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-display text-lg font-semibold mb-1 line-clamp-2 drop-shadow-lg">
            {event.title}
          </h3>
          {event.genre && <p className="text-white/80 text-sm mb-2">{event.genre}</p>}
          {event.language && (
            <Badge variant="outline" className="text-white border-white/40 text-xs backdrop-blur-sm">
              {event.language}
            </Badge>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{new Date(event.date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}</span>
          <Clock className="w-4 h-4 text-primary ml-1 flex-shrink-0" />
          <span>{event.time}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="line-clamp-1">{event.venue}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-xs text-muted-foreground">Starting from</span>
            <p className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent price-glow`}>
              ₹{event.price}
            </p>
          </div>
          <span className={`text-sm font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent
            group-hover:tracking-wide transition-all duration-300`}>
            Book Now →
          </span>
        </div>
      </div>
    </div>
  );
};
