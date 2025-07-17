
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted={false}
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.8) contrast(1.1)' }}
        >
          <source src="/videos/globalsocial-bg.mp4" type="video/mp4" />
          {/* Fallback gradient background */}
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
        </video>
        {/* Light overlay for better text readability while keeping video visible */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </div>

      

      <div className="w-full max-w-md neo-brutalist bg-white relative z-20">
        {/* Compact Header */}
        <div className="bg-black bg-opacity-85 text-white p-4 backdrop-blur-sm">
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }} className="text-3xl font-black uppercase text-center text-white mb-1">
            {fullName ? fullName.toUpperCase() : 'GLOBAL SOCIAL'}
          </h1>
          <div className="text-center text-lime-400 font-black text-lg uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            {fullName ? 'INTERNATIONAL CITIZEN' : (isLogin ? 'PASSPORT CONTROL' : 'JOIN THE NETWORK')}
          </div>
        </div>
          
        {/* Compact Form */}
        <div className="component-preview p-6">
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName" className="font-black text-black text-lg uppercase block mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                  FULL NAME
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="neo-brutalist w-full h-12 text-lg font-bold placeholder:text-gray-400 bg-white"
                  placeholder="ENTER NAME"
                  style={{ fontFamily: 'Roboto Mono, monospace' }}
                />
              </div>
            )}
          
            <div>
              <Label htmlFor="email" className="font-black text-black text-lg uppercase block mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neo-brutalist w-full h-12 text-lg font-bold placeholder:text-gray-400 bg-white"
                placeholder="EMAIL@DOMAIN.COM"
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              />
            </div>

            <div>
              <Label htmlFor="password" className="font-black text-black text-lg uppercase block mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="neo-brutalist w-full h-12 text-lg font-bold placeholder:text-gray-400 bg-white"
                placeholder="••••••••"
                minLength={6}
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              />
            </div>

            {message && (
              <div className="neo-brutalist bg-red-500 text-white p-4 font-black text-lg uppercase">
                ERROR: {message}
              </div>
            )}

            <Button 
              type="submit" 
              className="neo-brutalist w-full h-12 bg-black text-lime-400 hover:bg-gray-800 font-black text-xl uppercase disabled:opacity-50"
              disabled={loading}
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'ENTER' : 'REGISTER')}
            </Button>

            <div className="text-center pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="neo-brutalist bg-blue-500 text-white px-6 py-3 font-black text-lg uppercase"
                style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}
              >
                {isLogin ? "REGISTER" : "LOGIN"}
              </button>
            </div>

            {/* Network Stats - Neo-brutalist */}
            <div className="neo-brutalist mt-8 bg-yellow-400 p-4">
              <div className="font-black text-black text-center text-lg uppercase mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                GLOBAL NETWORK
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="neo-brutalist bg-white p-2">
                  <div className="font-black text-2xl text-black" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>200+</div>
                  <div className="font-bold text-black text-sm">COUNTRIES</div>
                </div>
                <div className="neo-brutalist bg-white p-2">
                  <div className="font-black text-2xl text-black" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>50K+</div>
                  <div className="font-bold text-black text-sm">USERS</div>
                </div>
                <div className="neo-brutalist bg-white p-2">
                  <div className="font-black text-2xl text-black" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>24/7</div>
                  <div className="font-bold text-black text-sm">ACTIVE</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
