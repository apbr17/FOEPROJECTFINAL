import { ArrowRight, Users, Ticket, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroBannerProps {
  onExplore: () => void;
}

export const HeroBanner = ({ onExplore }: HeroBannerProps) => {
  return (
    <section className="relative overflow-hidden hero-animated-bg py-16 md:py-28">
      {/* Floating colour orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb-1 absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="orb-2 absolute bottom-[-100px] right-[-60px] w-[480px] h-[480px] rounded-full bg-accent/15 blur-[120px]" />
        <div className="orb-3 absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[90px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Animated tag */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/70 text-sm">Discover · Book · Experience</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Experience Events
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(90deg, #e63946, #f4a261, #e63946)',
                backgroundSize: '200% auto',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              Together
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
            Discover movies, concerts, sports, and more. Find your perfect companion
            to share unforgettable moments.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <Button variant="hero" size="xl" onClick={onExplore} className="gap-2 shadow-lg shadow-primary/30">
              Explore Events
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
              onClick={onExplore}
            >
              How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-sm">
            {[
              { icon: Ticket, value: '500+', label: 'Events' },
              { icon: Users,  value: '50K+', label: 'Users' },
              { icon: Heart,  value: '10K+', label: 'Matches' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-accent group-hover:scale-125 transition-transform duration-300" />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-white/40 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
