import { useState, useMemo, useRef } from 'react';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { CategoryTabs } from '@/components/CategoryTabs';
import { EventFilters, SortOption } from '@/components/EventFilters';
import { EventGrid } from '@/components/EventGrid';
import { EventDetails } from '@/pages/EventDetails';
import { Booking } from '@/pages/Booking';
import { Reviews } from '@/components/Reviews';
import { events, Event } from '@/data/mockData';

type View = 'home' | 'details' | 'booking';

const Index = () => {
  const [view,            setView]            = useState<View>('home');
  const [selectedEvent,   setSelectedEvent]   = useState<Event | null>(null);
  const [selectedCity,    setSelectedCity]    = useState('Mumbai');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeCategory,  setActiveCategory]  = useState('all');
  const [selectedDate,    setSelectedDate]    = useState<Date | undefined>(undefined);
  const [selectedLanguage,setSelectedLanguage]= useState('All');
  const [sortBy,          setSortBy]          = useState<SortOption>('default');
  const [priceRange,      setPriceRange]      = useState<[number, number]>([0, 5000]);
  const eventsRef = useRef<HTMLDivElement>(null);

  const filteredEvents = useMemo(() => {
    let list = events.filter(event => {
      if (event.city !== selectedCity)                                        return false;
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeCategory !== 'all' && event.category !== activeCategory)     return false;
      if (selectedDate) {
        const d = new Date(event.date);
        if (d.getDate() !== selectedDate.getDate() ||
            d.getMonth() !== selectedDate.getMonth() ||
            d.getFullYear() !== selectedDate.getFullYear()) return false;
      }
      if (selectedLanguage !== 'All' && event.language !== selectedLanguage) return false;
      if (event.price < priceRange[0] || event.price > priceRange[1])       return false;
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'price-low':    list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-high':   list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating':       list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'newest':       list = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); break;
      case 'best-selling': list = [...list].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)); break;
      default: break;
    }

    return list;
  }, [selectedCity, searchQuery, activeCategory, selectedDate, selectedLanguage, sortBy, priceRange]);

  const handleEventClick  = (event: Event) => { setSelectedEvent(event); setView('details'); };
  const handleBookNow     = () => setView('booking');
  const handleBack        = () => setView(view === 'booking' ? 'details' : 'home');
  const handleExplore     = () => eventsRef.current?.scrollIntoView({ behavior: 'smooth' });

  if (view === 'booking' && selectedEvent) {
    return <Booking event={selectedEvent} onClose={() => setView('details')} />;
  }
  if (view === 'details' && selectedEvent) {
    return <EventDetails event={selectedEvent} onBack={handleBack} onBookNow={handleBookNow} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HeroBanner onExplore={handleExplore} />

      <div ref={eventsRef}>
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        <EventFilters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          sortBy={sortBy}
          onSortChange={setSortBy}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
        />

        {/* Result count */}
        <div className="container mx-auto px-4 pb-2">
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} in {selectedCity}
          </p>
        </div>

        <EventGrid events={filteredEvents} onEventClick={handleEventClick} />
      </div>

      {/* Site Reviews */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Reviews targetType="website" />
      </div>

      {/* Footer */}
      <footer className="gradient-dark py-12 mt-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
              <span className="font-display text-xl font-bold text-white">Companion</span>
            </div>
            <p className="text-white/50 text-sm">© 2026 Companion. Experience events together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
