import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RedditAuthProps {
  onAuthComplete?: () => void;
}

export function RedditAuth({ onAuthComplete }: RedditAuthProps) {
  const [authStatus, setAuthStatus] = useState<'idle' | 'pending' | 'authorized' | 'error'>('idle');
  const [authUrl, setAuthUrl] = useState<string>('');
  const { toast } = useToast();

  const initiateAuth = async () => {
    try {
      setAuthStatus('pending');
      
      const response = await fetch('/api/reddit/auth');
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        setAuthUrl(data.authUrl);
        
        console.log('Opening Reddit authorization URL:', data.authUrl);
        
        // Open authorization URL in new window
        const authWindow = window.open(data.authUrl, 'reddit-auth', 'width=600,height=700');
        
        // Listen for callback completion
        const checkAuth = setInterval(async () => {
          try {
            // Check if the auth window was closed (user completed or cancelled)
            if (authWindow?.closed) {
              clearInterval(checkAuth);
              
              // Test if authentication was successful
              const feedResponse = await fetch('/api/reddit/feed?limit=1');
              const feedData = await feedResponse.json();
              
              if (feedData.success && feedData.total > 0) {
                setAuthStatus('authorized');
                toast({
                  title: "Reddit Connected",
                  description: "Successfully connected to Reddit API for enhanced content",
                });
                onAuthComplete?.();
              } else {
                // Check if there was an error message
                if (feedData.message && feedData.message.includes('authorization required')) {
                  setAuthStatus('error');
                  toast({
                    title: "Authorization Required",
                    description: "Please complete Reddit authorization to enable enhanced content",
                    variant: "destructive",
                  });
                } else {
                  setAuthStatus('error');
                  toast({
                    title: "Authorization Failed",
                    description: "Reddit authorization was not completed successfully",
                    variant: "destructive",
                  });
                }
              }
              return;
            }
            
            // Also check if auth succeeded while window is still open
            const feedResponse = await fetch('/api/reddit/feed?limit=1');
            const feedData = await feedResponse.json();
            
            if (feedData.success && feedData.total > 0) {
              setAuthStatus('authorized');
              clearInterval(checkAuth);
              authWindow?.close();
              toast({
                title: "Reddit Connected",
                description: "Successfully connected to Reddit API for enhanced content",
              });
              onAuthComplete?.();
            }
          } catch (error) {
            // Still checking...
          }
        }, 2000);
        
        // Stop checking after 5 minutes
        setTimeout(() => {
          clearInterval(checkAuth);
          if (authStatus === 'pending') {
            setAuthStatus('error');
            toast({
              title: "Authorization Timeout",
              description: "Reddit authorization timed out. Please try again.",
              variant: "destructive",
            });
          }
        }, 300000);
        
      } else {
        throw new Error(data.error || 'Failed to initialize Reddit authentication');
      }
    } catch (error) {
      console.error('Reddit auth error:', error);
      setAuthStatus('error');
      toast({
        title: "Authentication Failed",
        description: "Failed to initialize Reddit authentication",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (authStatus) {
      case 'authorized':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Authorization</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-['Bebas_Neue'] text-xl">Reddit Integration</CardTitle>
            <CardDescription className="font-mono text-sm">
              Enhanced global feed with community content
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {authStatus === 'idle' && (
          <div className="space-y-3">
            <p className="font-mono text-sm text-gray-600">
              Connect to Reddit to enhance your global feed with rich community content, 
              location-based recommendations, and verified product discussions.
            </p>
            <Button 
              onClick={initiateAuth}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect to Reddit
            </Button>
          </div>
        )}

        {authStatus === 'pending' && (
          <div className="space-y-3">
            <p className="font-mono text-sm text-blue-600">
              🔄 Authorization in progress... Please complete the Reddit authorization in the popup window.
            </p>
            {authUrl && (
              <Button 
                variant="outline"
                onClick={() => window.open(authUrl, 'reddit-auth', 'width=600,height=700')}
                className="w-full border-2 border-black"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Reopen Authorization Window
              </Button>
            )}
          </div>
        )}

        {authStatus === 'authorized' && (
          <div className="space-y-3">
            <p className="font-mono text-sm text-green-600">
              ✅ Reddit successfully connected! Your global feed now includes enhanced community content.
            </p>
            <div className="bg-green-50 border-2 border-green-200 p-3 rounded">
              <p className="font-mono text-xs text-green-700">
                Features enabled: Location-based subreddits, product discussions, 
                community verification badges, and rich content with images.
              </p>
            </div>
          </div>
        )}

        {authStatus === 'error' && (
          <div className="space-y-3">
            <p className="font-mono text-sm text-red-600">
              ❌ Reddit authorization failed. Please try again or check your credentials.
            </p>
            <Button 
              onClick={initiateAuth}
              variant="outline"
              className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50"
            >
              Retry Connection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}