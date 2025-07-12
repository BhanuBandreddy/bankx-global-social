
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
    <div className="min-h-screen bg-lime-400 flex items-center justify-center p-4 relative">
      {/* Neo-brutalist Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-black border-4 border-black rotate-12"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-blue-500 border-4 border-black -rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-red-500 border-4 border-black rotate-45"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 bg-yellow-400 border-4 border-black -rotate-12"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-purple-500 border-4 border-black"></div>
      </div>

      <div className="w-full max-w-lg border-8 border-black bg-white shadow-[16px_16px_0px_0px_#000] relative z-10">
        {/* Neo-brutalist Header */}
        <div className="bg-black text-white p-6 border-b-8 border-black">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 border-4 border-white flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-red-500 border-4 border-white flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-green-500 border-4 border-white flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <FlagGrid />
          
          <h1 className="text-5xl font-black uppercase tracking-tight text-center text-white mb-2">
            GLOBAL SOCIAL
          </h1>
          <div className="text-center text-lime-400 font-black text-xl uppercase">
            {isLogin ? 'PASSPORT CONTROL' : 'JOIN THE NETWORK'}
          </div>
          <div className="text-center text-white font-bold text-sm mt-2 uppercase tracking-wide">
            {isLogin ? 'ENTER CREDENTIALS' : 'REGISTER NOW'}
          </div>
        </div>
          
        {/* Neo-brutalist Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName" className="font-black text-black text-lg uppercase tracking-wide block mb-2">
                  FULL NAME
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="w-full h-14 border-4 border-black text-xl font-bold placeholder:text-gray-400 focus:shadow-[8px_8px_0px_0px_#000] transition-shadow"
                  placeholder="ENTER NAME"
                />
              </div>
            )}
          
            <div>
              <Label htmlFor="email" className="font-black text-black text-lg uppercase tracking-wide block mb-2">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 border-4 border-black text-xl font-bold placeholder:text-gray-400 focus:shadow-[8px_8px_0px_0px_#000] transition-shadow"
                placeholder="EMAIL@DOMAIN.COM"
              />
            </div>

            <div>
              <Label htmlFor="password" className="font-black text-black text-lg uppercase tracking-wide block mb-2">
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-14 border-4 border-black text-xl font-bold placeholder:text-gray-400 focus:shadow-[8px_8px_0px_0px_#000] transition-shadow"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {message && (
              <div className="bg-red-500 text-white p-4 border-4 border-black font-black text-lg uppercase shadow-[4px_4px_0px_0px_#000]">
                ERROR: {message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-16 bg-black text-lime-400 hover:bg-gray-800 font-black text-2xl uppercase border-4 border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'ENTER' : 'REGISTER')}
            </Button>

            <div className="text-center pt-6 border-t-4 border-black">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="bg-blue-500 text-white px-6 py-3 border-4 border-black font-black text-lg uppercase shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
              >
                {isLogin ? "REGISTER" : "LOGIN"}
              </button>
            </div>

            {/* Network Stats - Neo-brutalist */}
            <div className="mt-8 border-4 border-black bg-yellow-400 p-4">
              <div className="font-black text-black text-center text-lg uppercase mb-3">GLOBAL NETWORK</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white border-4 border-black p-2">
                  <div className="font-black text-2xl text-black">200+</div>
                  <div className="font-bold text-black text-sm">COUNTRIES</div>
                </div>
                <div className="bg-white border-4 border-black p-2">
                  <div className="font-black text-2xl text-black">50K+</div>
                  <div className="font-bold text-black text-sm">USERS</div>
                </div>
                <div className="bg-white border-4 border-black p-2">
                  <div className="font-black text-2xl text-black">24/7</div>
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
