'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  networkRequests: number;
  errorRate: number;
  cacheHitRate: number;
  fps: number;
  loadTime: number;
}

interface ComponentMetrics {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  memoryLeaks: boolean;
}

export function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  showDetails = false 
}: {
  enabled?: boolean;
  showDetails?: boolean;
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    networkRequests: 0,
    errorRate: 0,
    cacheHitRate: 0,
    fps: 0,
    loadTime: 0
  });

  const [componentMetrics, setComponentMetrics] = useState<ComponentMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const frameRef = useRef<number>();
  const fpsCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    // Initialize performance monitoring
    const startTime = performance.now();
    
    // Monitor FPS
    const measureFPS = () => {
      fpsCountRef.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTimeRef.current >= 1000) {
        setMetrics(prev => ({ ...prev, fps: fpsCountRef.current }));
        fpsCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      frameRef.current = requestAnimationFrame(measureFPS);
    };

    // Start FPS monitoring
    frameRef.current = requestAnimationFrame(measureFPS);

    // Monitor other metrics
    intervalRef.current = setInterval(() => {
      updateMetrics();
    }, 2000);

    // Measure initial load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  const updateMetrics = () => {
    // Memory usage (if available)
    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo ? 
      (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100 : 0;

    // Network requests (mock data for demo)
    const networkRequests = performance.getEntriesByType('navigation').length +
                           performance.getEntriesByType('resource').length;

    // Render time (using performance marks)
    const renderTime = measureRenderTime();

    setMetrics(prev => ({
      ...prev,
      memoryUsage,
      networkRequests,
      renderTime,
      bundleSize: getBundleSize(),
      errorRate: getErrorRate(),
      cacheHitRate: getCacheHitRate()
    }));
  };

  const measureRenderTime = (): number => {
    const entries = performance.getEntriesByType('measure');
    if (entries.length === 0) return 0;
    
    const renderEntries = entries.filter(entry => 
      entry.name.includes('render') || entry.name.includes('React')
    );
    
    return renderEntries.length > 0 ? 
      renderEntries[renderEntries.length - 1].duration : 0;
  };

  const getBundleSize = (): number => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') || resource.name.includes('chunk')
    );
    
    return jsResources.reduce((total, resource) => 
      total + (resource.transferSize || 0), 0
    ) / 1024; // Convert to KB
  };

  const getErrorRate = (): number => {
    // In a real implementation, this would track actual errors
    return Math.random() * 5; // Mock error rate 0-5%
  };

  const getCacheHitRate = (): number => {
    // In a real implementation, this would track cache performance
    return 85 + Math.random() * 10; // Mock cache hit rate 85-95%
  };

  const getPerformanceScore = (): number => {
    const weights = {
      renderTime: 0.3,
      memoryUsage: 0.2,
      fps: 0.2,
      errorRate: 0.15,
      cacheHitRate: 0.15
    };

    const scores = {
      renderTime: Math.max(0, 100 - (metrics.renderTime / 16) * 100), // 16ms = 60fps
      memoryUsage: Math.max(0, 100 - metrics.memoryUsage),
      fps: Math.min(100, (metrics.fps / 60) * 100),
      errorRate: Math.max(0, 100 - metrics.errorRate * 20),
      cacheHitRate: metrics.cacheHitRate
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (!enabled) return null;

  const performanceScore = getPerformanceScore();

  return (
    <>
      {/* Performance Monitor Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white shadow-lg"
        >
          <Activity className="h-4 w-4 mr-2" />
          Performance
          <Badge 
            variant={getScoreBadgeVariant(performanceScore)}
            className="ml-2"
          >
            {Math.round(performanceScore)}
          </Badge>
        </Button>
      </div>

      {/* Performance Monitor Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 w-96 z-50">
          <Card className="shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Performance Monitor</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                >
                  ×
                </Button>
              </div>
              <CardDescription>
                Real-time application performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Score */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-medium">Performance Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                    {Math.round(performanceScore)}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    Render Time
                  </div>
                  <div className="text-lg font-semibold">
                    {metrics.renderTime.toFixed(1)}ms
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Cpu className="h-3 w-3" />
                    Memory Usage
                  </div>
                  <div className="text-lg font-semibold">
                    {metrics.memoryUsage.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    FPS
                  </div>
                  <div className="text-lg font-semibold">
                    {metrics.fps}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Wifi className="h-3 w-3" />
                    Network Requests
                  </div>
                  <div className="text-lg font-semibold">
                    {metrics.networkRequests}
                  </div>
                </div>
              </div>

              {showDetails && (
                <>
                  {/* Detailed Metrics */}
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bundle Size</span>
                      <span className="text-sm font-medium">
                        {metrics.bundleSize.toFixed(1)} KB
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <span className="text-sm font-medium">
                        {metrics.errorRate.toFixed(2)}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cache Hit Rate</span>
                        <span className="text-sm font-medium">
                          {metrics.cacheHitRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.cacheHitRate} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Load Time</span>
                      <span className="text-sm font-medium">
                        {metrics.loadTime.toFixed(0)}ms
                      </span>
                    </div>
                  </div>

                  {/* Performance Warnings */}
                  <div className="space-y-2 pt-3 border-t">
                    {metrics.memoryUsage > 80 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        High memory usage detected
                      </div>
                    )}
                    
                    {metrics.fps < 30 && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <TrendingDown className="h-3 w-3" />
                        Low frame rate detected
                      </div>
                    )}
                    
                    {metrics.renderTime > 16 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <Clock className="h-3 w-3" />
                        Slow render times detected
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Performance metrics:', metrics)}
                  className="flex-1"
                >
                  Log Metrics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Hook for component-level performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);

  useEffect(() => {
    const startTime = performance.now();
    renderCountRef.current++;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      renderTimesRef.current.push(renderTime);

      // Keep only last 10 render times
      if (renderTimesRef.current.length > 10) {
        renderTimesRef.current.shift();
      }

      // Log performance data in development
      if (process.env.NODE_ENV === 'development') {
        const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / 
                                 renderTimesRef.current.length;
        
        console.log(`${componentName} Performance:`, {
          renderCount: renderCountRef.current,
          lastRenderTime: renderTime,
          averageRenderTime,
          renderTimes: renderTimesRef.current
        });
      }
    };
  });

  return {
    renderCount: renderCountRef.current,
    averageRenderTime: renderTimesRef.current.length > 0 ? 
      renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length : 0
  };
}