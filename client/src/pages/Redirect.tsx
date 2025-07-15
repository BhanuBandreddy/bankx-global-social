import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Redirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get redirect destination from URL params
    const redirectTo = searchParams.get('to') || searchParams.get('redirect') || '/';
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    // Handle different redirect scenarios
    if (error) {
      console.error('Redirect with error:', error);
      // Redirect to home with error state
      navigate('/?error=' + encodeURIComponent(error));
      return;
    }

    if (success) {
      console.log('Redirect with success:', success);
      // Handle successful operations (e.g., OAuth callback)
      if (success === 'auth') {
        navigate('/');
        return;
      }
    }

    // Handle specific redirect destinations
    switch (redirectTo) {
      case 'demo':
        navigate('/demo');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'auth':
        navigate('/auth');
        break;
      case 'agent-dashboard':
        navigate('/agent-dashboard');
        break;
      case 'traveler-discovery':
        navigate('/traveler-discovery');
        break;
      default:
        // Default redirect to home
        navigate('/');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <Card className="neo-brutalist">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-black text-black uppercase mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            Redirecting...
          </h2>
          <p className="text-black font-bold">
            Taking you to your destination
          </p>
        </CardContent>
      </Card>
    </div>
  );
}