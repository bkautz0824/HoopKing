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
            {/* AI-First Scheduling Options */}
            <div className="grid gap-6 mb-8">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span>AI-Powered Scheduling</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Let AI help you plan your training schedule</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button 
                      className="h-20 p-4 flex flex-col items-start space-y-2 glass border-accent/20 hover:border-accent/40"
                      variant="outline"
                      data-testid="button-auto-populate-schedule"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className="font-semibold">Auto-Fill from Plans</span>
                      </div>
                      <p className="text-xs text-left text-muted-foreground">
                        Automatically schedule your existing workout plans
                      </p>
                    </Button>

                    <Button 
                      className="h-20 p-4 flex flex-col items-start space-y-2 glass border-primary/20 hover:border-primary/40"
                      variant="outline"
                      data-testid="button-ai-schedule-assist"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                        </svg>
                        <span className="font-semibold">Tell AI Your Plan</span>
                      </div>
                      <p className="text-xs text-left text-muted-foreground">
                        Speak or type what you want to schedule
                      </p>
                    </Button>
                  </div>

                  {/* AI Schedule Input */}
                  <Card className="bg-secondary/20 border-dashed border-2 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">AI Schedule Assistant</span>
                      </div>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Tell me what you want to schedule... (e.g., 'Basketball practice on Tuesday and Thursday')"
                          className="flex-1"
                          data-testid="input-ai-schedule"
                        />
                        <Button size="icon" variant="outline" data-testid="button-voice-schedule">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                          </svg>
                        </Button>
                        <Button className="gradient-orange px-6" data-testid="button-process-ai-schedule">
                          Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Enhanced Calendar */}
              <Card className="lg:col-span-2 glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Training Calendar</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-border/50 p-4 bg-background/50">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-lg"
                      showOutsideDays={false}
                    />
                  </div>
                  
                  {/* Scheduled workouts for selected date */}
                  {selectedDate && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-semibold text-sm">Scheduled for {selectedDate.toLocaleDateString()}</h4>
                      <div className="space-y-2">
                        <Card className="border-accent/20">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">Basketball Training</p>
                                <p className="text-xs text-muted-foreground">6:00 PM • 60 min</p>
                              </div>
                              <Badge variant="outline" className="text-xs">Planned</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manual Entry (Last Resort) */}
              <Card className="glass opacity-75">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                    <span>Manual Entry</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Only if AI assistance doesn't work</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workout-type" className="text-xs">Workout Type</Label>
                    <Select>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basketball_training">Basketball</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                        <SelectItem value="recovery">Recovery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="duration" className="text-xs">Duration</Label>
                      <Input id="duration" type="number" placeholder="60" className="h-8" />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-xs">Time</Label>
                      <Input id="time" type="time" className="h-8" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-xs">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Optional notes..."
                      className="min-h-[60px] text-xs"
                    />
                  </div>

                  <Button 
                    size="sm"
                    variant="outline"
                    className="w-full h-8"
                    onClick={() => scheduleWorkoutMutation.mutate({})}
                    data-testid="button-manual-schedule"
                  >
                    Add Manually
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