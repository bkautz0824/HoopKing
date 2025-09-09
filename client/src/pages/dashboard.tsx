import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import HeroSection from "@/components/dashboard/hero-section";
import PerformanceMetrics from "@/components/dashboard/performance-metrics";
import AIWorkoutGenerator from "@/components/dashboard/ai-workout-generator";
import SocialFeatures from "@/components/dashboard/social-features";
import Achievements from "@/components/dashboard/achievements";
import TrainingAnalytics from "@/components/dashboard/training-analytics";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background court-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <PerformanceMetrics />
        <AIWorkoutGenerator />
        <SocialFeatures />
        <Achievements />
        <TrainingAnalytics />
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 gradient-orange animate-pulse-glow"
        size="icon"
        data-testid="button-quick-workout"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </Button>

      <MobileNav />
    </div>
  );
}
