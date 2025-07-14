import { useEffect, useRef, useState } from 'react';
import { HamburgerNavigation } from './HamburgerNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

export const MusicReactiveHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState(0.3);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple canvas-based horizontal wave effect
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(17, 17, 17, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate wave parameters
      const centerY = canvas.height / 2;
      const amplitude = isPlaying ? 50 + audioData * 100 : 30;
      const frequency = 0.01;
      
      // Create gradient for the glow effect
      const gradient = ctx.createLinearGradient(0, centerY - amplitude, 0, centerY + amplitude);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0)'); // Transparent gold
      gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.8)'); // Orange
      gradient.addColorStop(0.5, 'rgba(255, 215, 0, 1)'); // Gold
      gradient.addColorStop(0.7, 'rgba(255, 165, 0, 0.8)'); // Orange
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Transparent gold

      // Draw the horizontal wave
      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = isPlaying ? 8 : 4;
      ctx.shadowBlur = isPlaying ? 40 : 20;
      ctx.shadowColor = '#FFD700';

      for (let x = 0; x < canvas.width; x += 2) {
        const y = centerY + Math.sin(x * frequency + time) * amplitude;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      // Add second wave layer for depth
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 140, 0, 0.6)';
      ctx.lineWidth = isPlaying ? 6 : 3;
      ctx.shadowBlur = isPlaying ? 60 : 30;
      
      for (let x = 0; x < canvas.width; x += 3) {
        const y = centerY + Math.sin(x * frequency * 1.5 + time * 1.2) * (amplitude * 0.7);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      // Update audio simulation
      if (isPlaying) {
        setAudioData(0.5 + Math.sin(time * 10) * 0.3 + Math.sin(time * 7) * 0.2);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, audioData]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-reactive-hero">
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef}
        className="background-canvas"
      />

      {/* Dark Overlay */}
      <div className="overlay" />

      {/* Navigation */}
      <HamburgerNavigation />

      {/* Content */}
      <div className="hero-content">
        {/* Subtitle */}
        <div className="subtitle">
          Find beauty in the space between sound
        </div>

        {/* Main Title */}
        <h1 className="main-title">
          THE ART OF
          <br />
          LISTENING
        </h1>

        {/* Quote */}
        <div className="quote">
          When you learn to see the invisible, you create the impossible.
        </div>

        {/* User Name */}
        <div className="user-section">
          <div className="user-name">{user?.name || 'Guest'}</div>
          <div className="user-status">INTERNATIONAL CITIZEN</div>
        </div>

        {/* Play Button */}
        <Button
          onClick={handlePlayToggle}
          className="play-button"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </Button>
      </div>

      <style>{`
        .music-reactive-hero {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #111111;
          overflow: hidden;
          z-index: 10;
        }

        .background-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 0 2rem;
        }

        .subtitle {
          font-family: 'Roboto Mono', monospace;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .main-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 12vw, 12rem);
          font-weight: 900;
          color: #FFFFFF;
          line-height: 0.85;
          margin: 0 0 2rem 0;
          letter-spacing: 4px;
          text-shadow: 
            0 0 20px rgba(255, 215, 0, 0.5),
            0 0 40px rgba(255, 165, 0, 0.3),
            0 0 60px rgba(255, 140, 0, 0.2);
          text-transform: uppercase;
        }

        .quote {
          font-family: 'Roboto Mono', monospace;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 3rem;
          max-width: 600px;
          line-height: 1.6;
          font-style: italic;
        }

        .user-section {
          margin-bottom: 3rem;
        }

        .user-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.5rem;
          color: #FFD700;
          margin-bottom: 0.5rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }

        .user-status {
          font-family: 'Roboto Mono', monospace;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .play-button {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: 4px solid #FFD700;
          padding: 1rem 2rem;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 
            0 0 20px rgba(255, 215, 0, 0.3),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
          border-radius: 0;
        }

        .play-button:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: #FFA500;
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.5),
            inset 0 0 20px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: clamp(3rem, 15vw, 8rem);
          }
          
          .user-name {
            font-size: 2rem;
          }
          
          .hero-content {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};