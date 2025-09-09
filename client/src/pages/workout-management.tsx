import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WorkoutManagement() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedInboxItem, setSelectedInboxItem] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check URL for tab parameter
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get('tab') || 'inbox';

  const { data: inboxItems, isLoading: inboxLoading } = useQuery({
    queryKey: ["/api/workout-inbox"],
  });

  const { data: workoutHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/workouts"],
  });

  const inboxArray = Array.isArray(inboxItems) ? inboxItems : [];
  const historyArray = Array.isArray(workoutHistory) ? workoutHistory : [];

  const acceptWorkoutMutation = useMutation({
    mutationFn: async ({ id, category, notes }: { id: string; category: string; notes?: string }) => {
      return await apiRequest("POST", `/api/workout-inbox/${id}/accept`, { category, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setSelectedInboxItem(null);
      toast({
        title: "Workout Accepted",
        description: "Workout has been added to your training log.",
      });
    },
  });

  const ignoreWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/workout-inbox/${id}/ignore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-inbox"] });
      setSelectedInboxItem(null);
      toast({
        title: "Workout Ignored",
        description: "Workout has been removed from your inbox.",
      });
    },
  });

  const scheduleWorkoutMutation = useMutation({
    mutationFn: async (workoutData: any) => {
      return await apiRequest("POST", "/api/workouts/schedule", workoutData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout Scheduled",
        description: "Your workout has been scheduled successfully.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-back-dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Workout Management</h1>
                <p className="text-sm text-muted-foreground">Schedule, review, and categorize your training data</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="inbox" data-testid="tab-inbox">
              Workout Inbox
              {inboxArray.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {inboxArray.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">Schedule</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          </TabsList>

          {/* Workout Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"/>
                  </svg>
                  <span>Uncategorized Workouts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inboxLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-muted rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : inboxArray.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p>All caught up! No workouts to review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inboxArray.map((item: any, index: number) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedInboxItem?.id === item.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedInboxItem(item)}
                        data-testid={`card-inbox-item-${index}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="text-xs">
                                  {item.autoDetectedType}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {Math.floor(item.confidence * 100)}% confidence
                                </span>
                              </div>
                              <h4 className="font-medium mt-1">{item.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.duration}min • {item.caloriesBurned} cal • ❤️ {item.averageHeartRate} bpm
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">{item.aiSummary}</p>
                            </div>
                            
                            {selectedInboxItem?.id === item.id && (
                              <div className="ml-4 space-y-2 flex-shrink-0">
                                <div className="space-y-2">
                                  <Label className="text-xs">Categorize as:</Label>
                                  <Select defaultValue="basketball_training">
                                    <SelectTrigger className="w-40 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="basketball_training">Basketball Training</SelectItem>
                                      <SelectItem value="cardio">Cardio</SelectItem>
                                      <SelectItem value="strength">Strength Training</SelectItem>
                                      <SelectItem value="skills">Skills Practice</SelectItem>
                                      <SelectItem value="recovery">Recovery</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      acceptWorkoutMutation.mutate({
                                        id: item.id,
                                        category: 'basketball_training',
                                        notes: 'Added from workout inbox'
                                      });
                                    }}
                                    disabled={acceptWorkoutMutation.isPending}
                                    className="h-7 px-3 text-xs gradient-court"
                                    data-testid={`button-accept-${index}`}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      ignoreWorkoutMutation.mutate(item.id);
                                    }}
                                    disabled={ignoreWorkoutMutation.isPending}
                                    className="h-7 px-3 text-xs"
                                    data-testid={`button-ignore-${index}`}
                                  >
                                    Ignore
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Schedule Workout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workout-type">Workout Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workout type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basketball_training">Basketball Training</SelectItem>
                        <SelectItem value="cardio">Cardio Session</SelectItem>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="skills">Skills Practice</SelectItem>
                        <SelectItem value="recovery">Recovery/Mobility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="duration">Duration (min)</Label>
                      <Input id="duration" type="number" placeholder="60" />
                    </div>
                    <div>
                      <Label htmlFor="intensity">Intensity</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Workout goals, focus areas, or reminders..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button 
                    className="w-full gradient-orange"
                    onClick={() => scheduleWorkoutMutation.mutate({})}
                    data-testid="button-schedule-workout"
                  >
                    Schedule Workout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-muted rounded-lg h-16"></div>
                    ))}
                  </div>
                ) : historyArray.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p>No workout history yet. Start logging your workouts!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyArray.map((workout: any, index: number) => (
                      <Card key={workout.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-3">
                                <Badge variant="secondary">{workout.category || 'General'}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(workout.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">
                                {Math.floor(workout.totalDuration / 60)}min • {workout.caloriesBurned || 0} cal
                              </p>
                              {workout.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{workout.notes}</p>
                              )}
                            </div>
                            <Badge variant={workout.status === 'completed' ? 'default' : 'outline'}>
                              {workout.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}