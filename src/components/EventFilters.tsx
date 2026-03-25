import { Filter, X, TrendingUp, Star, Clock, IndianRupee, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest',       label: 'Newest First'   },
  { value: 'best-selling', label: 'Best Selling'   },
  { value: 'rating',       label: 'Top Rated'      },
  { value: 'price-low',    label: 'Price: Low→High' },
  { value: 'price-high',   label: 'Price: High→Low' },
];

export const EventFilters = ({
  selectedDate, onDateChange, selectedLanguage, onLanguageChange,
  sortBy, onSortChange, priceRange, onPriceRangeChange,
}: EventFiltersProps) => {
  const [showSort,  setShowSort]  = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [localMin,  setLocalMin]  = useState(priceRange[0].toString());
  const [localMax,  setLocalMax]  = useState(priceRange[1].toString());

  const hasActiveFilters = selectedDate || selectedLanguage !== 'All' ||
    sortBy !== 'default' || priceRange[0] > 0 || priceRange[1] < 5000;

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
    setShowPrice(false);
  };

  const activeSortLabel = sortOptions.find(s => s.value === sortBy)?.label;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap md:flex-nowrap">

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => { setShowSort(!showSort); setShowPrice(false); }}
            className={`filter-chip flex items-center gap-2 flex-shrink-0 ${sortBy !== 'default' ? 'active' : ''}`}
          >
            <Filter className="w-4 h-4" />
            {activeSortLabel ?? 'Sort By'}
          </button>
          {showSort && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 w-48 p-1">
              {sortOptions.map(opt => (
                <button key={opt.value}
                  onClick={() => { onSortChange(opt.value); setShowSort(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${sortBy === opt.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="relative">
          <button
            onClick={() => { setShowPrice(!showPrice); setShowSort(false); }}
            className={`filter-chip flex items-center gap-2 flex-shrink-0 ${(priceRange[0] > 0 || priceRange[1] < 5000) ? 'active' : ''}`}
          >
            <IndianRupee className="w-4 h-4" />
            {priceRange[0] > 0 || priceRange[1] < 5000 ? `₹${priceRange[0]}–₹${priceRange[1]}` : 'Price Range'}
          </button>
          {showPrice && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 w-64 p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Price Range</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Min (₹)</label>
                  <input type="number" value={localMin} onChange={e => setLocalMin(e.target.value)}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <span className="text-muted-foreground mt-5">—</span>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Max (₹)</label>
                  <input type="number" value={localMax} onChange={e => setLocalMax(e.target.value)}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[[0,500],[500,1500],[1500,3000],[3000,5000]].map(([mn,mx]) => (
                  <button key={`${mn}-${mx}`}
                    onClick={() => { setLocalMin(String(mn)); setLocalMax(String(mx)); }}
                    className="text-xs px-2 py-1 bg-muted rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
                    ₹{mn}–₹{mx}
                  </button>
                ))}
              </div>
              <Button variant="hero" size="sm" className="w-full" onClick={applyPrice}>Apply</Button>
            </div>
          )}
        </div>

        {/* Date — simple native input, no heavy library */}
        <div className="flex-shrink-0">
          <label className={`filter-chip flex items-center gap-2 cursor-pointer ${selectedDate ? 'active' : ''}`}>
            <Calendar className="w-4 h-4" />
            {selectedDate
              ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : 'Any Date'}
            <input
              type="date"
              className="sr-only"
              onChange={e => onDateChange(e.target.value ? new Date(e.target.value) : undefined)}
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            />
          </label>
        </div>

        {/* Languages */}
        {languages.map(lang => (
          <button key={lang} onClick={() => onLanguageChange(lang)}
            className={`filter-chip flex-shrink-0 ${selectedLanguage === lang ? 'active' : ''}`}>
            {lang}
          </button>
        ))}

        {hasActiveFilters && (
          <button onClick={clearAll}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors flex-shrink-0">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};
