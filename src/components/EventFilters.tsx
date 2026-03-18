import { Calendar, Filter, X, TrendingUp, Star, Clock, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useState } from 'react';

export type SortOption = 'default' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'best-selling';

interface EventFiltersProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

const languages = ['All', 'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Bengali', 'Punjabi'];

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'newest',       label: 'Newest First',   icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'best-selling', label: 'Best Selling',   icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'rating',       label: 'Top Rated',      icon: <Star className="w-3.5 h-3.5" /> },
  { value: 'price-low',    label: 'Price: Low→High', icon: <IndianRupee className="w-3.5 h-3.5" /> },
  { value: 'price-high',   label: 'Price: High→Low', icon: <IndianRupee className="w-3.5 h-3.5" /> },
];

export const EventFilters = ({
  selectedDate,
  onDateChange,
  selectedLanguage,
  onLanguageChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
}: EventFiltersProps) => {
  const [isCalendarOpen, setIsCalendarOpen]   = useState(false);
  const [isSortOpen,     setIsSortOpen]       = useState(false);
  const [isPriceOpen,    setIsPriceOpen]      = useState(false);
  const [localMin,       setLocalMin]         = useState(priceRange[0].toString());
  const [localMax,       setLocalMax]         = useState(priceRange[1].toString());

  const hasActiveFilters =
    selectedDate ||
    selectedLanguage !== 'All' ||
    sortBy !== 'default' ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000;

  const clearAll = () => {
    onDateChange(undefined);
    onLanguageChange('All');
    onSortChange('default');
    onPriceRangeChange([0, 5000]);
    setLocalMin('0');
    setLocalMax('5000');
  };

  const applyPrice = () => {
    const min = Math.max(0, parseInt(localMin) || 0);
    const max = Math.min(10000, parseInt(localMax) || 5000);
    onPriceRangeChange([min, Math.max(min, max)]);
    setIsPriceOpen(false);
  };

  const activeSortLabel = sortOptions.find(s => s.value === sortBy)?.label;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-wrap md:flex-nowrap">

        {/* Sort dropdown */}
        <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
          <PopoverTrigger asChild>
            <button className={`filter-chip flex items-center gap-2 flex-shrink-0 ${sortBy !== 'default' ? 'active' : ''}`}>
              <Filter className="w-4 h-4" />
              {activeSortLabel ?? 'Sort By'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="start">
            <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">Sort Events By</p>
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onSortChange(opt.value); setIsSortOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors
                  ${sortBy === opt.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'}`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Price range */}
        <Popover open={isPriceOpen} onOpenChange={setIsPriceOpen}>
          <PopoverTrigger asChild>
            <button className={`filter-chip flex items-center gap-2 flex-shrink-0 ${(priceRange[0] > 0 || priceRange[1] < 5000) ? 'active' : ''}`}>
              <IndianRupee className="w-4 h-4" />
              {priceRange[0] > 0 || priceRange[1] < 5000
                ? `₹${priceRange[0]}–₹${priceRange[1]}`
                : 'Price Range'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="start">
            <p className="text-sm font-semibold text-foreground mb-3">Price Range</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Min (₹)</label>
                <input
                  type="number"
                  value={localMin}
                  onChange={e => setLocalMin(e.target.value)}
                  placeholder="0"
                  min={0}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground border-0
                    focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <span className="text-muted-foreground mt-5">—</span>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Max (₹)</label>
                <input
                  type="number"
                  value={localMax}
                  onChange={e => setLocalMax(e.target.value)}
                  placeholder="5000"
                  min={0}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground border-0
                    focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[[0,500],[500,1500],[1500,3000],[3000,5000]].map(([min,max]) => (
                <button
                  key={`${min}-${max}`}
                  onClick={() => { setLocalMin(String(min)); setLocalMax(String(max)); }}
                  className="text-xs px-2 py-1 bg-muted rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  ₹{min}–₹{max}
                </button>
              ))}
            </div>
            <Button variant="hero" size="sm" className="w-full" onClick={applyPrice}>
              Apply
            </Button>
          </PopoverContent>
        </Popover>

        {/* Date filter */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button className={`filter-chip flex items-center gap-2 flex-shrink-0 ${selectedDate ? 'active' : ''}`}>
              <Calendar className="w-4 h-4" />
              {selectedDate
                ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'Any Date'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={date => { onDateChange(date); setIsCalendarOpen(false); }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Language filters */}
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`filter-chip flex-shrink-0 ${selectedLanguage === lang ? 'active' : ''}`}
          >
            {lang}
          </button>
        ))}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors flex-shrink-0 ml-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
