import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AIWorkoutGenerator() {
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const { toast } = useToast();

  const generateWorkoutMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-workout", { preferences });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedWorkout(data);
      toast({
        title: "Workout Generated!",
        description: "Your personalized AI workout is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <section className="mb-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glass rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">AI-Generated Workout Plan</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-accent">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span>Personalized by Claude AI</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!generatedWorkout ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Generate Your AI Workout</h3>
                  <p className="text-muted-foreground mb-4">
                    Let AI create a personalized workout based on your profile and preferences
                  </p>
                  <Button 
                    onClick={() => generateWorkoutMutation.mutate({})}
                    disabled={generateWorkoutMutation.isPending}
                    className="gradient-orange"
                    data-testid="button-generate-workout"
                  >
                    {generateWorkoutMutation.isPending ? "Generating..." : "Generate AI Workout"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Workout Session Card */}
                  <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg" data-testid="workout-name">
                          {generatedWorkout.name || "Elite Ball Handling Circuit"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {generatedWorkout.description || "Personalized based on your skill level and GOATA movement patterns"}
                        </p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">
                        {generatedWorkout.duration || 45} min
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Intensity Level</span>
                          <span className="font-medium">{generatedWorkout.intensityLevel || 8}/10</span>
                        </div>
                        <Progress value={(generatedWorkout.intensityLevel || 8) * 10} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Expected HR Zone</span>
                          <span className="font-medium">{generatedWorkout.expectedHRZone || "Zone 4-5"}</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-4 h-2 bg-muted rounded"></div>
                          <div className="w-4 h-2 bg-muted rounded"></div>
                          <div className="w-4 h-2 bg-muted rounded"></div>
                          <div className="w-4 h-2 bg-accent rounded"></div>
                          <div className="w-4 h-2 bg-primary rounded"></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {generatedWorkout.phases?.map((phase: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded border border-border">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-primary/20' : 
                              index === 1 ? 'bg-accent/20' : 'bg-green-500/20'
                            }`}>
                              <span className={`font-bold text-sm ${
                                index === 0 ? 'text-primary' : 
                                index === 1 ? 'text-accent' : 'text-green-500'
                              }`}>
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{phase.name}</p>
                              <p className="text-xs text-muted-foreground">{phase.description}</p>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{phase.duration} min</span>
                        </div>
                      )) || (
                        <>
                          <div className="flex items-center justify-between p-3 bg-background rounded border border-border">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">1</span>
                              </div>
                              <div>
                                <p className="font-medium">Dynamic Warm-up</p>
                                <p className="text-xs text-muted-foreground">GOATA movement prep</p>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">8 min</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-background rounded border border-border">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                                <span className="text-accent font-bold text-sm">2</span>
                              </div>
                              <div>
                                <p className="font-medium">Advanced Dribbling Drills</p>
                                <p className="text-xs text-muted-foreground">Chain integration focus</p>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">25 min</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-background rounded border border-border">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-green-500 font-bold text-sm">3</span>
                              </div>
                              <div>
                                <p className="font-medium">Recovery & Mobility</p>
                                <p className="text-xs text-muted-foreground">HRV optimization</p>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">12 min</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex space-x-3 mt-4">
                      <Button className="flex-1 gradient-orange" data-testid="button-start-ai-workout">
                        Start Workout
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => setGeneratedWorkout(null)}
                        data-testid="button-generate-new"
                      >
                        Generate New
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wearable Integration Panel */}
        <div className="space-y-6">
          <Card className="glass rounded-xl">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">Connected Devices</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded border border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-800 rounded border border-slate-600"></div>
                    <div>
                      <p className="font-medium text-sm">Apple Watch</p>
                      <p className="text-xs text-green-500">Connected</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded border border-border opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded"></div>
                    <div>
                      <p className="font-medium text-sm">Garmin</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" className="text-xs">
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Metrics */}
          <LiveMetrics />
        </div>
      </div>
    </section>
  );
}

function LiveMetrics() {
  const { data: liveData } = useQuery({
    queryKey: ["/api/biometrics/live"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const heartRate = (liveData as any)?.heartRate || 148;
  const steps = (liveData as any)?.steps || 2450;
  const calories = (liveData as any)?.calories || 847;

  return (
    <Card className="glass rounded-xl">
      <CardContent className="p-6">
        <h4 className="font-semibold mb-4">Live Metrics</h4>
        <div className="space-y-4">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-muted stroke-current" 
                  strokeWidth="3" 
                  fill="none" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path 
                  className="text-accent stroke-current" 
                  strokeWidth="3" 
                  strokeDasharray={`${(heartRate / 200) * 100}, 100`}
                  strokeLinecap="round" 
                  fill="none" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" data-testid="live-heart-rate">{heartRate}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Heart Rate (BPM)</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary" data-testid="live-steps">{steps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Steps</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-500" data-testid="live-calories">{calories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
