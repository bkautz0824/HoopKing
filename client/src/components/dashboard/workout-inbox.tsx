import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient-demo";
import { useToast } from "@/hooks/use-toast";

interface WorkoutInboxItem {
  id: string;
  title: string;
  duration: number;
  caloriesBurned: number;
  averageHeartRate: number;
  autoDetectedType: string;
  confidence: number;
  aiSummary: string;
  receivedAt: string;
  status: 'pending' | 'categorized' | 'ignored';
  category?: string;
}

export default function WorkoutInbox() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const { data: inboxItems, isLoading } = useQuery({
    queryKey: ["/api/workout-inbox"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const categorizeWorkoutMutation = useMutation({
    mutationFn: async ({ itemId, category }: { itemId: string; category: string }) => {
      return await apiRequest("POST", `/api/workout-inbox/${itemId}/categorize`, { category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-inbox"] });
      toast({
        title: "Workout Categorized",
        description: "Workout has been successfully categorized and added to your training log.",
      });
      setSelectedItem(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to categorize workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const ignoreWorkoutMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest("POST", `/api/workout-inbox/${itemId}/ignore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-inbox"] });
      toast({
        title: "Workout Ignored",
        description: "Workout has been removed from your inbox.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to ignore workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const workoutCategories = [
    { id: 'basketball_training', name: 'Basketball Training', color: 'bg-primary' },
    { id: 'strength', name: 'Strength Training', color: 'bg-blue-500' },
    { id: 'cardio', name: 'Cardio', color: 'bg-green-500' },
    { id: 'recovery', name: 'Recovery', color: 'bg-purple-500' },
    { id: 'skills', name: 'Skills Practice', color: 'bg-orange-500' },
    { id: 'other', name: 'Other Activity', color: 'bg-gray-500' },
  ];

  const pendingItems = (inboxItems as WorkoutInboxItem[])?.filter(item => item.status === 'pending') || [];

  if (isLoading) {
    return (
      <Card className="glass rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H4"/>
            </svg>
            <span>Workout Inbox</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H4"/>
            </svg>
            <span>Workout Inbox</span>
          </CardTitle>
          {pendingItems.length > 0 && (
            <Badge className="bg-primary text-primary-foreground animate-pulse">
              {pendingItems.length} new
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          New workouts from your wearable devices are ready to be categorized
        </p>
      </CardHeader>
      <CardContent>
        {pendingItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="font-medium mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground">
              No new workouts to categorize. Your wearable data will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item, index) => (
              <div key={item.id} className={`animate-slide-up stagger-${Math.min(index + 1, 5)}`}>
                <div className="bg-background/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium" data-testid={`workout-title-${item.id}`}>
                          {item.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {item.autoDetectedType}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            item.confidence > 0.8 ? 'bg-green-500' : 
                            item.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.aiSummary}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>{item.duration} min</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                          </svg>
                          <span>{item.caloriesBurned} cal</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                          <span>{item.averageHeartRate} bpm</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.receivedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {selectedItem === item.id ? (
                    <div className="animate-slide-up">
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Categorize this workout:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {workoutCategories.map(category => (
                            <Button
                              key={category.id}
                              variant="outline"
                              size="sm"
                              className="justify-start text-xs h-8"
                              onClick={() => categorizeWorkoutMutation.mutate({ 
                                itemId: item.id, 
                                category: category.id 
                              })}
                              disabled={categorizeWorkoutMutation.isPending}
                              data-testid={`button-category-${category.id}`}
                            >
                              <div className={`w-2 h-2 rounded-full ${category.color} mr-2`}></div>
                              {category.name}
                            </Button>
                          ))}
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(null)}
                            className="flex-1"
                            data-testid="button-cancel-categorize"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => ignoreWorkoutMutation.mutate(item.id)}
                            disabled={ignoreWorkoutMutation.isPending}
                            className="flex-1"
                            data-testid="button-ignore-workout"
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2 mt-3">
                      <Button
                        size="sm"
                        className="gradient-orange flex-1"
                        onClick={() => setSelectedItem(item.id)}
                        data-testid={`button-categorize-${item.id}`}
                      >
                        Categorize
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ignoreWorkoutMutation.mutate(item.id)}
                        disabled={ignoreWorkoutMutation.isPending}
                        data-testid={`button-quick-ignore-${item.id}`}
                      >
                        Ignore
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}