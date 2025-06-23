import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatus {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastChecked: Date;
  responseTime?: number;
  errorCount: number;
}

export const ConnectionMonitor = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'unknown',
    lastChecked: new Date(),
    errorCount: 0
  });

  useEffect(() => {
    const checkConnection = async () => {
      const startTime = Date.now();
      const controller = new AbortController();
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);
      
      try {
        // Simple health check to Supabase
        const response = await fetch('/api/health', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        setConnectionStatus(prev => ({
          status: responseTime > 2000 ? 'warning' : 'healthy',
          lastChecked: new Date(),
          responseTime,
          errorCount: response.ok ? 0 : prev.errorCount + 1
        }));
        
      } catch (error) {
        clearTimeout(timeoutId);
        setConnectionStatus(prev => ({
          status: 'error',
          lastChecked: new Date(),
          responseTime: Date.now() - startTime,
          errorCount: prev.errorCount + 1
        }));
      }
    };

    // Initial check
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'healthy':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">
              System Status
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {connectionStatus.responseTime && (
              <Badge variant="outline" className="text-xs">
                {connectionStatus.responseTime}ms
              </Badge>
            )}
            
            <Badge 
              variant={connectionStatus.status === 'healthy' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {connectionStatus.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {connectionStatus.errorCount > 0 && (
          <div className="mt-2 text-xs text-red-700">
            {connectionStatus.errorCount} connection issues detected
          </div>
        )}
        
        <div className="mt-1 text-xs opacity-75">
          Last checked: {connectionStatus.lastChecked.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
