import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  const { user } = useAuth();
  const userName = user?.firstName || user?.email?.split('@')[0] || 'Athlete';

  return (
    <section className="mb-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800/80 via-primary/10 to-accent/10 p-8 court-pattern">
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-accent font-medium">Good morning, {userName}!</p>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Ready to
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                  dominate
                </span>
                the court?
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Your AI coach has prepared a personalized training session based on your progress and recovery metrics.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="gradient-orange text-lg px-8 py-4 animate-pulse-glow"
                data-testid="button-start-todays-workout"
              >
                Start Today's Workout
              </Button>
              <Button 
                variant="secondary"
                className="text-lg px-8 py-4 hover:bg-secondary/80"
                data-testid="button-view-ai-insights"
              >
                View AI Insights
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">Training visualization</p>
                <p className="text-xs text-muted-foreground">Powered by advanced analytics</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 glass rounded-xl p-4 animate-slide-up">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI Coach Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
