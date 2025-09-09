import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  const { user } = useAuth();
  const userName = (user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'Athlete';

  return (
    <section className="mb-12">
      <div className="relative overflow-hidden rounded-2xl glass p-8 basketball-mesh border-primary/20">
        <div className="absolute inset-0 gradient-court opacity-5"></div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <p className="text-accent font-medium tracking-wide">Good morning, {userName}!</p>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                Make sense of your
                <span className="bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent block animate-scale-bounce">
                  wearable data
                </span>
                and training
              </h2>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Process workouts from your wearables, build personalized training plans, and fill gaps with AI-powered assistance.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="gradient-orange text-lg px-8 py-4 h-14 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/workout-management'}
                data-testid="button-process-wearable-data"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"/>
                </svg>
                Process Wearable Data
              </Button>
              <Button 
                variant="secondary"
                className="text-lg px-8 py-4 h-14 rounded-xl font-medium glass border-accent/20 hover:border-accent/40 transition-all duration-300"
                onClick={() => window.location.href = '/workout-management?tab=schedule'}
                data-testid="button-plan-workouts"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Plan Workouts
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] glass rounded-2xl flex items-center justify-center relative overflow-hidden border border-primary/10">
              <div className="absolute inset-0 gradient-court opacity-10"></div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                  <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 2a10 10 0 0 0 0 20M12 2a10 10 0 0 1 0 20M2 12h20" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>
                <p className="text-foreground text-sm font-medium mb-1">Basketball Analytics</p>
                <p className="text-xs text-muted-foreground">Powered by AI insights</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 glass rounded-xl p-4 animate-slide-in-right border border-green-500/20">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-400">AI Coach Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
