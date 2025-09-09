import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrainingAnalytics() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <Card className="glass">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-background rounded-lg p-4 border border-border">
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <Card className="glass rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Training Analytics</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <span className="text-sm font-medium text-accent">Claude AI</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Skill Radar Chart */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <h4 className="font-semibold mb-4 text-center">Skill Assessment</h4>
              <div className="relative w-48 h-48 mx-auto">
                {/* SVG Radar Chart */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#FF6B35', stopOpacity:0.3}} />
                      <stop offset="100%" style={{stopColor:'#0EA5E9', stopOpacity:0.1}} />
                    </linearGradient>
                  </defs>
                  {/* Pentagon background */}
                  <polygon 
                    points="100,20 170,65 145,150 55,150 30,65" 
                    stroke="hsl(var(--border))" 
                    strokeWidth="1" 
                    fill="none" 
                    opacity="0.3"
                  />
                  <polygon 
                    points="100,40 150,75 130,140 70,140 50,75" 
                    stroke="hsl(var(--border))" 
                    strokeWidth="1" 
                    fill="none" 
                    opacity="0.3"
                  />
                  <polygon 
                    points="100,60 130,85 115,130 85,130 70,85" 
                    stroke="hsl(var(--border))" 
                    strokeWidth="1" 
                    fill="none" 
                    opacity="0.3"
                  />
                  {/* Data polygon */}
                  <polygon 
                    points="100,30 160,70 130,145 75,135 40,70" 
                    stroke="#FF6B35" 
                    strokeWidth="2" 
                    fill="url(#radarGradient)"
                  />
                  {/* Data points */}
                  <circle cx="100" cy="30" r="3" fill="#FF6B35"/>
                  <circle cx="160" cy="70" r="3" fill="#FF6B35"/>
                  <circle cx="130" cy="145" r="3" fill="#0EA5E9"/>
                  <circle cx="75" cy="135" r="3" fill="#0EA5E9"/>
                  <circle cx="40" cy="70" r="3" fill="#10B981"/>
                </svg>
              </div>
              <div className="text-center space-y-1 mt-4">
                <div className="flex justify-center space-x-4 text-xs">
                  <span className="text-primary">Ball Handling</span>
                  <span className="text-accent">Shooting</span>
                  <span className="text-green-500">Defense</span>
                </div>
              </div>
            </div>
            
            {/* Training Load */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <h4 className="font-semibold mb-4">Training Load</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Week</span>
                    <span className="font-medium" data-testid="training-load-week">8.2/10</span>
                  </div>
                  <Progress value={82} className="h-3" />
                  <p className="text-xs text-green-500 mt-1">Optimal load</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Recovery Need</span>
                    <span className="font-medium" data-testid="recovery-need">Low</span>
                  </div>
                  <Progress value={25} className="h-3" />
                </div>
                
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium">AI Recommendation</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your training load is optimal. Consider adding one high-intensity session this week.
                  </p>
                </div>
              </div>
            </div>
            
            {/* GOATA Movement Quality */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <h4 className="font-semibold mb-4">Movement Quality (GOATA)</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Chain Integration</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={85} className="w-16 h-2" />
                    <span className="text-xs font-medium" data-testid="chain-integration">85%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Core Stability</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={78} className="w-16 h-2" />
                    <span className="text-xs font-medium" data-testid="core-stability">78%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hip Function</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={92} className="w-16 h-2" />
                    <span className="text-xs font-medium" data-testid="hip-function">92%</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Focus on anterior chain exercises to improve balance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
