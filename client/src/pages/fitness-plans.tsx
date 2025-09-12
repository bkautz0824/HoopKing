import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient-demo";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Target, Zap, Users, Award, ChevronRight, PlayCircle, Plus } from "lucide-react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

export default function FitnessPlans() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const { toast } = useToast();

  // Fetch fitness plans
  const { data: fitnessPlans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ["/api/fitness-plans"],
  }) as { data: any[], isLoading: boolean };

  // Generate new fitness plan
  const generatePlanMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-fitness-plan", { preferences });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Fitness Plan Generated!",
        description: `Your personalized ${data.methodology} plan is ready.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fitness-plans"] });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate fitness plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate workout for a plan
  const generateWorkoutMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-workout", { preferences });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedWorkout(data);
      toast({
        title: "Workout Generated!",
        description: "Your personalized workout is ready to view.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePlan = (methodology: string) => {
    generatePlanMutation.mutate({
      planType: methodology.toLowerCase(),
      methodology: methodology,
      duration: 8,
      workoutsPerWeek: 4,
      focusArea: "basketball performance",
    });
  };

  if (isLoadingPlans) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-8" data-testid="fitness-plans-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Fitness Plans
          </h1>
          <p className="text-muted-foreground">
            Structured training programs with proven methodologies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleGeneratePlan("GOATA")}
            disabled={generatePlanMutation.isPending}
            className="gradient-orange"
            data-testid="button-generate-goata"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate GOATA Plan
          </Button>
          <Button
            onClick={() => handleGeneratePlan("Soviet")}
            disabled={generatePlanMutation.isPending}
            variant="outline"
            data-testid="button-generate-soviet"
          >
            <Target className="w-4 h-4 mr-2" />
            Generate Soviet Plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" data-testid="tab-browse">Browse Plans</TabsTrigger>
          <TabsTrigger value="methodologies" data-testid="tab-methodologies">Methodologies</TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">Create Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {fitnessPlans.length === 0 ? (
            <Card className="glass">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Fitness Plans Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first structured training plan to get started
                </p>
                <Button 
                  onClick={() => handleGeneratePlan("GOATA")}
                  disabled={generatePlanMutation.isPending}
                  className="gradient-orange"
                  data-testid="button-generate-first-plan"
                >
                  Generate Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {fitnessPlans.map((plan: any) => (
                <Card 
                  key={plan.id} 
                  className="glass hover-elevate cursor-pointer"
                  onClick={() => setSelectedPlan(plan)}
                  data-testid={`card-plan-${plan.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {plan.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" data-testid={`badge-methodology-${plan.methodology}`}>
                        {plan.methodology}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {plan.duration} weeks
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {plan.workoutsPerWeek}/week
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={plan.difficulty === 'advanced' ? 'default' : 'outline'}
                          data-testid={`badge-difficulty-${plan.difficulty}`}
                        >
                          {plan.difficulty}
                        </Badge>
                        <Button size="sm" variant="ghost" data-testid="button-view-plan">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="methodologies" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  GOATA Method
                </CardTitle>
                <CardDescription>
                  Revolutionary movement methodology focusing on spiral patterns and athletic optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Focus:</strong> Movement quality, spiral mechanics, injury prevention</p>
                  <p><strong>Best for:</strong> Athletes seeking movement optimization and longevity</p>
                  <p><strong>Duration:</strong> 8-12 weeks for foundation, ongoing for mastery</p>
                  <a 
                    href="https://goatamovement.com/methodology" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400 text-xs underline"
                  >
                    Learn more about GOATA →
                  </a>
                </div>
                <Button 
                  onClick={() => handleGeneratePlan("GOATA")}
                  disabled={generatePlanMutation.isPending}
                  className="w-full gradient-orange"
                  data-testid="button-generate-goata-detailed"
                >
                  Generate GOATA Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  Soviet Method
                </CardTitle>
                <CardDescription>
                  Time-tested systematic approach to strength and conditioning development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Focus:</strong> Systematic strength, periodization, work capacity</p>
                  <p><strong>Best for:</strong> Athletes seeking structured strength development</p>
                  <p><strong>Duration:</strong> 12-16 weeks with clear periodization phases</p>
                  <p className="text-xs text-muted-foreground">
                    Based on time-tested Eastern European training methods emphasizing systematic progression and work capacity development.
                  </p>
                </div>
                <Button 
                  onClick={() => handleGeneratePlan("Soviet")}
                  disabled={generatePlanMutation.isPending}
                  className="w-full"
                  variant="outline"
                  data-testid="button-generate-soviet-detailed"
                >
                  Generate Soviet Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  NBA Method
                </CardTitle>
                <CardDescription>
                  Professional basketball-specific training protocols
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Focus:</strong> Basketball skills, game conditioning, performance</p>
                  <p><strong>Best for:</strong> Basketball players at all levels</p>
                  <p><strong>Duration:</strong> Season-long with phases for different periods</p>
                  <a 
                    href="https://nba.com/resources/training" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400 text-xs underline"
                  >
                    NBA Training Resources →
                  </a>
                </div>
                <Button 
                  onClick={() => handleGeneratePlan("NBA")}
                  disabled={generatePlanMutation.isPending}
                  className="w-full"
                  variant="outline"
                  data-testid="button-generate-nba"
                >
                  Generate NBA Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Hypertrophy Method
                </CardTitle>
                <CardDescription>
                  Muscle building focused training with basketball applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Focus:</strong> Muscle growth, strength endurance, size gains</p>
                  <p><strong>Best for:</strong> Athletes looking to add functional muscle mass</p>
                  <p><strong>Duration:</strong> 8-12 weeks with progressive overload</p>
                  <p className="text-xs text-muted-foreground">
                    Science-based muscle building approach with 8-12 rep ranges, progressive overload, and adequate recovery periods.
                  </p>
                </div>
                <Button 
                  onClick={() => handleGeneratePlan("Hypertrophy")}
                  disabled={generatePlanMutation.isPending}
                  className="w-full"
                  variant="outline"
                  data-testid="button-generate-hypertrophy"
                >
                  Generate Hypertrophy Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="glass">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Custom Plan Builder</h3>
              <p className="text-muted-foreground mb-4">
                Advanced plan creation tools coming soon. For now, generate AI plans and customize them.
              </p>
              <Button variant="outline" disabled data-testid="button-custom-builder-coming-soon">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Detail Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlan?.name}
              <Badge variant="secondary">{selectedPlan?.methodology}</Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedPlan?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedPlan.duration}</div>
                  <div className="text-sm text-muted-foreground">Weeks</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedPlan.workoutsPerWeek}</div>
                  <div className="text-sm text-muted-foreground">Per Week</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold capitalize">{selectedPlan.difficulty}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Sample Workout</h4>
                <Button 
                  onClick={() => generateWorkoutMutation.mutate({
                    planType: selectedPlan.methodology,
                    focusArea: "basketball",
                    intensity: selectedPlan.difficulty,
                  })}
                  disabled={generateWorkoutMutation.isPending}
                  className="gradient-orange"
                  data-testid="button-generate-sample-workout"
                >
                  {generateWorkoutMutation.isPending ? "Generating..." : "Generate Sample Workout"}
                </Button>
              </div>

              {selectedWorkout && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>{selectedWorkout.name}</CardTitle>
                    <CardDescription>{selectedWorkout.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedWorkout.phases?.map((phase: any, index: number) => (
                      <div key={index} className="mb-4">
                        <h5 className="font-medium mb-2">{phase.name}</h5>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {phase.exercises?.map((exercise: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span>{exercise.name}</span>
                              <span>{exercise.sets}x{exercise.reps}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
      
      <MobileNav />
    </div>
  );
}