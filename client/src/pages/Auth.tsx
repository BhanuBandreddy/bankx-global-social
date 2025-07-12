
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { FlagGrid, PassportStamp } from '@/components/ui/flag-grid';
import { Globe, Shield, Users, Plane } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/');
      } else {
        await signUp(email, password, fullName);
        navigate('/');
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-6xl">🌍</div>
        <div className="absolute top-40 right-32 text-4xl">✈️</div>
        <div className="absolute bottom-32 left-16 text-5xl">🗺️</div>
        <div className="absolute bottom-20 right-20 text-3xl">🛂</div>
        <div className="absolute top-1/3 left-1/2 text-7xl transform -translate-x-1/2">🌐</div>
      </div>

      <PassportStamp>
        <Card className="w-full max-w-lg border-6 border-black bg-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
          {/* Header with International Theme */}
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 border-b-4 border-black">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <Shield className="w-8 h-8 text-purple-600" />
              <Users className="w-8 h-8 text-green-600" />
            </div>
            
            <FlagGrid />
            
            <CardTitle className="text-4xl font-black uppercase tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GLOBAL SOCIAL
            </CardTitle>
            <CardDescription className="text-gray-700 font-bold text-lg">
              {isLogin ? '🛂 PASSPORT CONTROL' : '🌍 JOIN THE NETWORK'}
            </CardDescription>
            <div className="text-sm font-medium text-gray-600 mt-2">
              {isLogin ? 'Welcome back, Global Citizen' : 'Connect • Travel • Trade'}
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="fullName" className="font-black text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    FULL NAME
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="border-3 border-black font-medium text-lg h-12 focus:border-blue-500 transition-colors"
                    placeholder="Enter your passport name"
                  />
                </div>
              )}
            
              <div>
                <Label htmlFor="email" className="font-black text-gray-800 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  EMAIL ADDRESS
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-3 border-black font-medium text-lg h-12 focus:border-purple-500 transition-colors"
                  placeholder="citizen@globalsocial.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="font-black text-gray-800 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  SECURITY CODE
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-3 border-black font-medium text-lg h-12 focus:border-green-500 transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              {message && (
                <div className="text-red-600 text-sm font-bold bg-red-50 p-4 border-3 border-red-500 rounded-lg shadow-lg">
                  🚨 {message}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-black py-4 text-lg border-3 border-black shadow-lg transform hover:scale-105 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 animate-spin" />
                    PROCESSING...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLogin ? (
                      <>
                        <Shield className="w-5 h-5" />
                        ENTER NETWORK
                      </>
                    ) : (
                      <>
                        <Globe className="w-5 h-5" />
                        JOIN GLOBAL SOCIAL
                      </>
                    )}
                  </div>
                )}
              </Button>

              <div className="text-center pt-4 border-t-3 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage('');
                    setEmail('');
                    setPassword('');
                    setFullName('');
                  }}
                  className="text-blue-600 hover:text-purple-600 font-bold underline text-lg flex items-center gap-2 mx-auto group"
                >
                  <Users className="w-4 h-4 group-hover:animate-bounce" />
                  {isLogin ? "New Citizen? Register Here" : "Returning? Access Network"}
                </button>
              </div>

              {/* International Network Info */}
              <div className="mt-6 text-center text-xs text-gray-500 border-t-2 border-gray-100 pt-4">
                <div className="font-medium mb-2">🌍 CONNECTING GLOBAL CITIZENS</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-bold text-blue-600">200+</div>
                    <div>COUNTRIES</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-600">50K+</div>
                    <div>TRAVELERS</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">24/7</div>
                    <div>NETWORK</div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </PassportStamp>
    </div>
  );
};

export default Auth;
