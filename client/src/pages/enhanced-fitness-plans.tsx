import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient-demo";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Target, Zap, Activity, TrendingUp, CheckCircle, Clock, Plus, Filter } from "lucide-react";

interface Workout {
  id: string;
  name: string;
  description: string;
  workoutType: string;
  difficulty: string;
  duration: number;
  methodology?: string;
}

interface PlanGenerationRequest {
  name: string;
  methodology: string;
  difficulty: string;
  duration: number;
  workoutsPerWeek: number;
  targetIssues: string[];
  selectedWorkouts: string[];
  customNotes?: string;
}

export default function EnhancedFitnessPlans() {
  const [currentStep, setCurrentStep] = useState(1);
  const [planRequest, setPlanRequest] = useState<PlanGenerationRequest>({
    name: "",
    methodology: "",
    difficulty: "beginner",
    duration: 4,
    workoutsPerWeek: 3,
    targetIssues: [],
    selectedWorkouts: [],
    customNotes: "",
  });
  const [showWorkouts, setShowWorkouts] = useState(false);
  const [workoutFilter, setWorkoutFilter] = useState("all");
  const { toast } = useToast();

  // Fetch available workouts
  const { data: workouts = [], isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ["/api/workouts"],
  }) as { data: Workout[], isLoading: boolean };

  // Generate enhanced fitness plan
  const generatePlanMutation = useMutation({
    mutationFn: async (request: PlanGenerationRequest) => {
      return await apiRequest("POST", "/api/enhanced-fitness-plans/generate", request);
    },
    onSuccess: (data) => {
      toast({
        title: "Plan Generated Successfully!",
        description: `Your custom ${planRequest.methodology} training plan has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fitness-plans"] });
      setCurrentStep(1);
      setPlanRequest({
        name: "",
        methodology: "",
        difficulty: "beginner",
        duration: 4,
        workoutsPerWeek: 3,
        targetIssues: [],
        selectedWorkouts: [],
        customNotes: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate fitness plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const methodologies = [
    {
      id: "goata",
      name: "GOATA",
      description: "Revolutionary movement system focusing on posterior chain and spiral patterns",
      icon: <Activity className="w-8 h-8" />,
      color: "gradient-blue"
    },
    {
      id: "soviet",
      name: "Soviet Training",
      description: "Classic periodization system for maximum strength and power development",
      icon: <Target className="w-8 h-8" />,
      color: "gradient-orange"
    },
    {
      id: "nba",
      name: "NBA Training",
      description: "Professional basketball conditioning and skill development protocols",
      icon: <Zap className="w-8 h-8" />,
      color: "gradient-blue"
    }
  ];

  const targetIssues = [
    "Posterior chain weakness",
    "Poor movement patterns", 
    "Lack of explosive power",
    "Basketball skill gaps",
    "Conditioning deficits",
    "Injury prevention",
    "Strength imbalances",
    "Recovery optimization"
  ];

  const filteredWorkouts = workouts.filter(workout => {
    if (workoutFilter === "all") return true;
    if (workoutFilter === "methodology") return workout.methodology === planRequest.methodology;
    return workout.workoutType === workoutFilter;
  });

  const handleMethodologySelect = (methodology: string) => {
    setPlanRequest({ ...planRequest, methodology });
    setCurrentStep(2);
  };

  const handleTargetIssueToggle = (issue: string) => {
    const updatedIssues = planRequest.targetIssues.includes(issue)
      ? planRequest.targetIssues.filter(i => i !== issue)
      : [...planRequest.targetIssues, issue];
    setPlanRequest({ ...planRequest, targetIssues: updatedIssues });
  };

  const handleWorkoutToggle = (workoutId: string) => {
    const updatedWorkouts = planRequest.selectedWorkouts.includes(workoutId)
      ? planRequest.selectedWorkouts.filter(id => id !== workoutId)
      : [...planRequest.selectedWorkouts, workoutId];
    setPlanRequest({ ...planRequest, selectedWorkouts: updatedWorkouts });
  };

  const handleGeneratePlan = () => {
    generatePlanMutation.mutate(planRequest);
  };

  const getMethodologyIcon = (methodology: string) => {
    const method = methodologies.find(m => m.id === methodology);
    return method?.icon || <TrendingUp className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-8" data-testid="enhanced-fitness-plans-page">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Your Custom Training Plan
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build a personalized fitness plan tailored to your methodology, goals, and target issues
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'gradient-blue text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 4 && <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Methodology Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Choose Your Training Methodology</h2>
              <p className="text-muted-foreground">Select the training system that aligns with your goals</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {methodologies.map((methodology) => (
                <Card 
                  key={methodology.id} 
                  className={`glass cursor-pointer hover:border-primary/50 transition-all ${
                    planRequest.methodology === methodology.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleMethodologySelect(methodology.id)}
                  data-testid={`methodology-${methodology.id}`}
                >
                  <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center text-primary">
                      {methodology.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{methodology.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {methodology.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Plan Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Configure Your Plan</h2>
              <p className="text-muted-foreground">Set your training parameters and target issues</p>
            </div>

            <Card className="glass max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {getMethodologyIcon(planRequest.methodology)}
                  <CardTitle>Plan Configuration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Name */}
                <div className="space-y-2">
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    placeholder="e.g., My Basketball Power Plan"
                    value={planRequest.name}
                    onChange={(e) => setPlanRequest({ ...planRequest, name: e.target.value })}
                    data-testid="input-plan-name"
                  />
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <Label>Difficulty Level</Label>
                  <RadioGroup
                    value={planRequest.difficulty}
                    onValueChange={(value) => setPlanRequest({ ...planRequest, difficulty: value })}
                  >
                    {["beginner", "intermediate", "advanced", "pro"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem value={level} id={level} />
                        <Label htmlFor={level} className="capitalize">{level}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Duration and Frequency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (weeks)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="2"
                      max="16"
                      value={planRequest.duration}
                      onChange={(e) => setPlanRequest({ ...planRequest, duration: parseInt(e.target.value) || 4 })}
                      data-testid="input-duration"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Workouts per week</Label>
                    <Input
                      id="frequency"
                      type="number"
                      min="1"
                      max="7"
                      value={planRequest.workoutsPerWeek}
                      onChange={(e) => setPlanRequest({ ...planRequest, workoutsPerWeek: parseInt(e.target.value) || 3 })}
                      data-testid="input-frequency"
                    />
                  </div>
                </div>

                {/* Target Issues */}
                <div className="space-y-3">
                  <Label>Target Issues (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {targetIssues.map((issue) => (
                      <div key={issue} className="flex items-center space-x-2">
                        <Checkbox
                          id={issue}
                          checked={planRequest.targetIssues.includes(issue)}
                          onCheckedChange={() => handleTargetIssueToggle(issue)}
                        />
                        <Label htmlFor={issue} className="text-sm">{issue}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={!planRequest.name.trim()}
                    className="gradient-blue"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Workout Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Select Workouts</h2>
              <p className="text-muted-foreground">Choose specific workouts that match your methodology and goals</p>
            </div>

            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="flex items-center space-x-4">
                <Label className="font-medium">Filter workouts:</Label>
                <RadioGroup
                  value={workoutFilter}
                  onValueChange={setWorkoutFilter}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="methodology" id="methodology" />
                    <Label htmlFor="methodology">My Methodology</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strength" id="strength" />
                    <Label htmlFor="strength">Strength</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skills" id="skills" />
                    <Label htmlFor="skills">Skills</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cardio" id="cardio" />
                    <Label htmlFor="cardio">Cardio</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Workout Grid */}
              {isLoadingWorkouts ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="glass animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-16 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWorkouts.map((workout) => (
                    <Card 
                      key={workout.id} 
                      className={`glass cursor-pointer hover:border-primary/50 transition-all ${
                        planRequest.selectedWorkouts.includes(workout.id) ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleWorkoutToggle(workout.id)}
                      data-testid={`workout-${workout.id}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{workout.name}</CardTitle>
                          {planRequest.selectedWorkouts.includes(workout.id) && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{workout.difficulty}</Badge>
                          <Badge variant="outline">{workout.workoutType}</Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{workout.duration}m</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {workout.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {planRequest.selectedWorkouts.length} workouts selected
                  </span>
                  <Button 
                    onClick={() => setCurrentStep(4)}
                    disabled={planRequest.selectedWorkouts.length === 0}
                    className="gradient-blue"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Generate */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Review & Generate</h2>
              <p className="text-muted-foreground">Review your plan configuration and add any custom notes</p>
            </div>

            <Card className="glass max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Plan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Plan Name</Label>
                    <p className="text-sm">{planRequest.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Methodology</Label>
                    <p className="text-sm capitalize">{planRequest.methodology}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Difficulty</Label>
                    <p className="text-sm capitalize">{planRequest.difficulty}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="text-sm">{planRequest.duration} weeks, {planRequest.workoutsPerWeek}x/week</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Target Issues</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {planRequest.targetIssues.map((issue) => (
                      <Badge key={issue} variant="outline" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Selected Workouts</Label>
                  <p className="text-sm">{planRequest.selectedWorkouts.length} workouts selected</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-notes">Custom Notes (Optional)</Label>
                  <Textarea
                    id="custom-notes"
                    placeholder="Add any specific requirements or preferences..."
                    value={planRequest.customNotes}
                    onChange={(e) => setPlanRequest({ ...planRequest, customNotes: e.target.value })}
                    data-testid="textarea-custom-notes"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleGeneratePlan}
                    disabled={generatePlanMutation.isPending}
                    className="gradient-orange"
                  >
                    {generatePlanMutation.isPending ? "Generating..." : "Generate Plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <MobileNav />
    </div>
  );
}