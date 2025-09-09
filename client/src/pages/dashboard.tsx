import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import HeroSection from "@/components/dashboard/hero-section";
import PerformanceMetrics from "@/components/dashboard/performance-metrics";
import AIWorkoutGenerator from "@/components/dashboard/ai-workout-generator";
import WorkoutInbox from "@/components/dashboard/workout-inbox";
import SocialFeatures from "@/components/dashboard/social-features";
import Achievements from "@/components/dashboard/achievements";
import TrainingAnalytics from "@/components/dashboard/training-analytics";
import FloatingAIHelper from "@/components/ai-helper/floating-ai-helper";
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
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-slide-up">
          <HeroSection />
        </div>
        <div className="animate-slide-up stagger-1">
          <PerformanceMetrics />
        </div>
        <div className="animate-slide-up stagger-2">
          <AIWorkoutGenerator />
        </div>
        <div className="animate-slide-up stagger-3">
          <WorkoutInbox />
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="animate-slide-in-left stagger-4">
            <SocialFeatures />
          </div>
          <div className="animate-slide-in-right stagger-4">
            <Achievements />
          </div>
        </div>
        <div className="animate-slide-up stagger-5">
          <TrainingAnalytics />
        </div>
      </main>

      {/* AI Helper Assistant */}
      <FloatingAIHelper />

      <MobileNav />
    </div>
  );
}
