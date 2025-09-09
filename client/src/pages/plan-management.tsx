import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Calendar, Clock, Target, Zap, Users, Award, PlayCircle, CheckCircle, Activity, TrendingUp } from "lucide-react";

interface UserPlan {
  userPlan: {
    id: string;
    status: string;
    currentWeek: number;
    totalWorkoutsCompleted: number;
    totalWorkoutsInPlan: number;
    completionPercentage: string;
    lastWorkoutDate?: string;
    startDate: string;
  };
  plan: {
    id: string;
    name: string;
    description: string;
    methodology: string;
    duration: number;
    workoutsPerWeek: number;
  };
}

export default function PlanManagement() {
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user's active plans
  const { data: userPlans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ["/api/user-plans"],
  }) as { data: UserPlan[], isLoading: boolean };

  // Fetch available fitness plans to start
  const { data: availablePlans = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ["/api/fitness-plans"],
  }) as { data: any[], isLoading: boolean };

  // Start a new fitness plan
  const startPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("POST", "/api/user-plans/start", { planId });
    },
    onSuccess: () => {
      toast({
        title: "Plan Started!",
        description: "You've successfully started a new fitness plan.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-plans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start fitness plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartPlan = (planId: string) => {
    startPlanMutation.mutate(planId);
  };

  const handleViewProgress = (userPlan: UserPlan) => {
    setSelectedPlan(userPlan);
    setProgressDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'gradient-blue';
      case 'completed':
        return 'gradient-orange';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology?.toLowerCase()) {
      case 'goata':
        return <Activity className="w-5 h-5" />;
      case 'soviet':
        return <Target className="w-5 h-5" />;
      case 'nba':
        return <Zap className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-8" data-testid="plan-management-page">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Plan Management
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your fitness journey, monitor progress, and achieve your basketball training goals
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="active" data-testid="tab-active-plans">
              My Active Plans ({userPlans.length})
            </TabsTrigger>
            <TabsTrigger value="available" data-testid="tab-available-plans">
              Start New Plan
            </TabsTrigger>
          </TabsList>

          {/* Active Plans Tab */}
          <TabsContent value="active" className="space-y-6">
            {isLoadingPlans ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="glass animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userPlans.length === 0 ? (
              <Card className="glass text-center p-8">
                <CardContent>
                  <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Plans</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your fitness journey by selecting a training plan
                  </p>
                  <Button
                    onClick={() => {
                      const tabTrigger = document.querySelector('[data-testid="tab-available-plans"]') as HTMLButtonElement;
                      tabTrigger?.click();
                    }}
                    className="gradient-orange"
                  >
                    Browse Available Plans
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {userPlans.map((userPlan) => (
                  <Card key={userPlan.userPlan.id} className="glass hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getMethodologyIcon(userPlan.plan.methodology)}
                          <CardTitle className="text-lg">{userPlan.plan.name}</CardTitle>
                        </div>
                        <Badge className={`${getStatusColor(userPlan.userPlan.status)} text-white border-0`}>
                          {userPlan.userPlan.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {userPlan.plan.methodology} • {userPlan.plan.duration} weeks • {userPlan.plan.workoutsPerWeek}x/week
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {userPlan.userPlan.totalWorkoutsCompleted} / {userPlan.userPlan.totalWorkoutsInPlan} workouts
                          </span>
                        </div>
                        <Progress 
                          value={parseFloat(userPlan.userPlan.completionPercentage || "0")} 
                          className="h-2" 
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Week {userPlan.userPlan.currentWeek} of {userPlan.plan.duration}</span>
                          <span>{parseFloat(userPlan.userPlan.completionPercentage || "0").toFixed(0)}% Complete</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Started {new Date(userPlan.userPlan.startDate).toLocaleDateString()}</span>
                        </div>
                        {userPlan.userPlan.lastWorkoutDate && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Last: {new Date(userPlan.userPlan.lastWorkoutDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProgress(userPlan)}
                          data-testid={`button-view-progress-${userPlan.userPlan.id}`}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          View Progress
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-blue"
                          data-testid={`button-continue-plan-${userPlan.userPlan.id}`}
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Continue Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Available Plans Tab */}
          <TabsContent value="available" className="space-y-6">
            {isLoadingAvailable ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="glass animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-muted rounded mb-4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className="glass hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getMethodologyIcon(plan.methodology)}
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        <Badge variant="outline">
                          {plan.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>
                        {plan.methodology} • {plan.duration} weeks • {plan.workoutsPerWeek}x/week
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {plan.description}
                      </p>
                      
                      <Button
                        onClick={() => handleStartPlan(plan.id)}
                        disabled={startPlanMutation.isPending}
                        className="w-full gradient-orange"
                        data-testid={`button-start-plan-${plan.id}`}
                      >
                        {startPlanMutation.isPending ? "Starting..." : "Start This Plan"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Plan Progress Dialog */}
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Plan Progress Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed progress tracking for your fitness plan
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlan && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{selectedPlan.plan.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedPlan.plan.methodology} Training • Week {selectedPlan.userPlan.currentWeek} of {selectedPlan.plan.duration}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="text-center p-4">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <div className="text-2xl font-bold text-green-500">
                      {selectedPlan.userPlan.totalWorkoutsCompleted}
                    </div>
                    <div className="text-sm text-muted-foreground">Workouts Complete</div>
                  </Card>
                  <Card className="text-center p-4">
                    <Target className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <div className="text-2xl font-bold text-blue-500">
                      {parseFloat(selectedPlan.userPlan.completionPercentage || "0").toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Plan Complete</div>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedPlan.userPlan.totalWorkoutsCompleted} / {selectedPlan.userPlan.totalWorkoutsInPlan}
                    </span>
                  </div>
                  <Progress 
                    value={parseFloat(selectedPlan.userPlan.completionPercentage || "0")} 
                    className="h-3" 
                  />
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Keep up the great work! You're making excellent progress.
                  </p>
                  <Button className="gradient-blue">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Continue Training
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <MobileNav />
    </div>
  );
}