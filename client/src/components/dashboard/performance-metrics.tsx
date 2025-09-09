import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PerformanceMetrics() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="glass">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Performance Overview</h3>
        <Select defaultValue="7days">
          <SelectTrigger className="w-40 bg-secondary border-border" data-testid="select-time-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Workout Streak */}
        <Card className="glass rounded-xl metric-card hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Workout Streak</h4>
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-bold text-primary" data-testid="metric-streak">
                {stats.currentStreak || 0}
              </span>
              <p className="text-sm text-green-500 font-medium">+3 from last week</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Heart Rate */}
        <Card className="glass rounded-xl metric-card hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Average Heart Rate</h4>
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-bold text-accent" data-testid="metric-heart-rate">
                {stats.averageHeartRate || 156}
              </span>
              <p className="text-sm text-muted-foreground font-mono">BPM</p>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Score */}
        <Card className="glass rounded-xl metric-card hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recovery Score</h4>
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-bold text-green-500" data-testid="metric-recovery">
                {Math.round(stats.recoveryScore || 87)}%
              </span>
              <p className="text-sm text-green-500 font-medium">Excellent</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className="glass rounded-xl metric-card hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Total Points</h4>
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-bold text-orange-500" data-testid="metric-points">
                {stats.totalPoints?.toLocaleString() || '2,840'}
              </span>
              <p className="text-sm text-orange-500 font-medium">Level 12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="glass rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold">Performance Trends</h4>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
                Skills
              </button>
              <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                Fitness
              </button>
              <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                Recovery
              </button>
            </div>
          </div>
          
          {/* Mock Chart Area */}
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10"></div>
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#FF6B35', stopOpacity:0.3}} />
                  <stop offset="100%" style={{stopColor:'#FF6B35', stopOpacity:0}} />
                </linearGradient>
              </defs>
              <path d="M0,150 Q100,120 200,100 T400,80" stroke="#FF6B35" strokeWidth="3" fill="none"/>
              <path d="M0,150 Q100,120 200,100 T400,80 L400,200 L0,200 Z" fill="url(#gradient)"/>
              <circle cx="50" cy="140" r="4" fill="#FF6B35"/>
              <circle cx="150" cy="110" r="4" fill="#FF6B35"/>
              <circle cx="250" cy="95" r="4" fill="#FF6B35"/>
              <circle cx="350" cy="85" r="4" fill="#FF6B35"/>
            </svg>
            <div className="relative z-10 text-center">
              <p className="text-muted-foreground">Interactive performance visualization</p>
              <p className="text-sm text-muted-foreground">Built with Recharts & Framer Motion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
