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
import { Card, CardContent } from "@/components/ui/card";

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
        
        {/* Workout Management Link */}
        <div className="animate-slide-up stagger-2-5">
          <Card className="glass rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Workout Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Schedule workouts, review wearable data, and manage your training history
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = '/workout-management'}
                  className="gradient-court"
                  data-testid="button-workout-management"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Manage Workouts
                </Button>
              </div>
            </CardContent>
          </Card>
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
