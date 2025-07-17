
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { FlagGrid, PassportStamp } from '@/components/ui/flag-grid';
import { Globe, Shield, Users, Plane, Volume2, VolumeX } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted={isMuted}
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

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed top-6 left-6 neo-brutalist bg-white bg-opacity-90 hover:bg-opacity-100 p-3 z-30 transition-all duration-200"
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-black" />
        ) : (
          <Volume2 className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Compact login positioned at bottom right-center - stable positioning */}
      <div className="fixed bottom-4 right-8 w-80 neo-brutalist bg-white bg-opacity-95 backdrop-blur-sm z-20" style={{ transition: 'none' }}>
        {/* Compact Header */}
        <div className="bg-black bg-opacity-90 text-white p-3 backdrop-blur-sm" style={{ transition: 'none' }}>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }} className="text-xl font-black uppercase text-center text-white mb-1">
            {fullName ? fullName.toUpperCase() : 'GLOBAL SOCIAL'}
          </h1>
          <div className="text-center text-lime-400 font-black text-sm uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
            {fullName ? 'CITIZEN' : (isLogin ? 'LOGIN' : 'REGISTER')}
          </div>
        </div>
          
        {/* Compact Form */}
        <div className="component-preview p-4" style={{ transition: 'none' }}>
          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName" className="font-black text-black text-sm uppercase block mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                  NAME
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="neo-brutalist w-full h-10 text-sm font-bold placeholder:text-gray-400 bg-white"
                  placeholder="ENTER NAME"
                  style={{ fontFamily: 'Roboto Mono, monospace', transition: 'none' }}
                />
              </div>
            )}
          
            <div>
              <Label htmlFor="email" className="font-black text-black text-sm uppercase block mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neo-brutalist w-full h-10 text-sm font-bold placeholder:text-gray-400 bg-white"
                placeholder="EMAIL@DOMAIN.COM"
                style={{ fontFamily: 'Roboto Mono, monospace', transition: 'none' }}
              />
            </div>

            <div>
              <Label htmlFor="password" className="font-black text-black text-sm uppercase block mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="neo-brutalist w-full h-10 text-sm font-bold placeholder:text-gray-400 bg-white"
                placeholder="••••••••"
                minLength={6}
                style={{ fontFamily: 'Roboto Mono, monospace', transition: 'none' }}
              />
            </div>

            {message && (
              <div className="neo-brutalist bg-red-500 text-white p-2 font-black text-xs uppercase">
                ERROR: {message}
              </div>
            )}

            <Button 
              type="submit" 
              className="neo-brutalist w-full h-10 bg-black text-lime-400 hover:bg-gray-800 font-black text-sm uppercase disabled:opacity-50"
              disabled={loading}
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px', transition: 'none' }}
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'ENTER' : 'REGISTER')}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="neo-brutalist bg-blue-500 text-white px-4 py-2 font-black text-xs uppercase"
                style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px', transition: 'none' }}
              >
                {isLogin ? "REGISTER" : "LOGIN"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
