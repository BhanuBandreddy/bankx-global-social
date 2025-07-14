import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HamburgerNavigation } from './HamburgerNavigation';
import * as THREE from 'three';

interface MusicReactiveHeroProps {
  className?: string;
}

export const MusicReactiveHero = ({ className = '' }: MusicReactiveHeroProps) => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    cleanup?: () => void;
  }>({});

  // Get user's display name
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Global Citizen';

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.8);
    canvasRef.current.appendChild(renderer.domElement);

    // Add mouse interaction
    const mouse = { x: 0.5, y: 0.5 };
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = 1.0 - (event.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create shader material for music visualization
    const geometry = new THREE.PlaneGeometry(2, 2);
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iMouse: { value: new THREE.Vector2(0.5, 0.5) },
        lowFreq: { value: 0 },
        midFreq: { value: 0 },
        highFreq: { value: 0 },
        transitionFactor: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        uniform float lowFreq;
        uniform float midFreq;
        uniform float highFreq;
        uniform float transitionFactor;

        // Color palette
        vec3 orange = vec3(1.0, 0.72, 0.1);
        vec3 yellow = vec3(1.0, 0.88, 0.45);
        vec3 glow = vec3(0.9, 0.5, 0.02);

        // Soft horizontal glowing bands
        float band(vec2 uv, float y, float thickness, float glowStrength, float speed, float offset, float audioBoost) {
          float wavyY = y + 0.07 * sin(uv.x * 6.0 + offset + iTime * speed) * (1.0 + audioBoost);
          float dist = abs(uv.y - wavyY);
          float base = exp(-dist * thickness * 12.0) * glowStrength * (0.5 + audioBoost);
          // A little extra falloff for smooth
          base *= exp(-dist * thickness * 5.0);
          return base;
        }

        void main() {
          vec2 uv = vUv;
          vec3 col = vec3(0.09, 0.06, 0.03); // very dark background

          // Audio-reactive intensity
          float audioIntensity = (lowFreq + midFreq + highFreq) / 3.0 * transitionFactor;

          // Band 1 (top) - reacts to high frequencies
          float b1 = band(uv, 0.32, 0.21, 1.2, 0.6, 0.0, highFreq * 2.0);
          col += b1 * mix(orange, yellow, 0.5);

          // Band 2 (middle, strongest) - reacts to mid frequencies
          float b2 = band(uv, 0.5 + 0.05*sin(iTime*0.3), 0.24, 1.7, 1.6, 1.5, midFreq * 3.0);
          col += b2 * glow;

          // Band 3 (lower) - reacts to low frequencies
          float b3 = band(uv, 0.74, 0.17, 1.2, 1.1, 3.5, lowFreq * 2.5);
          col += b3 * orange;

          // Slight streaks and movement for "energy"
          float streak = 0.035 * sin(uv.x * 35.0 - iTime * 2.2) * exp(-abs(uv.y-0.6)*7.0) * (1.0 + audioIntensity);
          col += streak * yellow;

          // Subtle mouse parallax
          float mx = (iMouse.x - 0.5) * 0.09;
          col += band(uv, 0.42+mx, 0.17, 0.5, 0.9, 2.5, audioIntensity) * glow;

          // Soft vignette
          float vig = 0.88 - 0.21 * pow((uv.x-0.5)*2.0,2.0) - 0.25 * pow((uv.y-0.5)*2.0,2.0);
          col *= vig;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);
    camera.position.z = 1;

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update time and mouse uniforms
      shaderMaterial.uniforms.iTime.value = performance.now() * 0.001;
      shaderMaterial.uniforms.iMouse.value.set(mouse.x, mouse.y);
      
      // Add subtle default animation to show bands
      const time = performance.now() * 0.001;
      if (!isPlaying) {
        // Gentle animation to show the band effect
        shaderMaterial.uniforms.lowFreq.value = 0.3 + Math.sin(time * 0.5) * 0.2;
        shaderMaterial.uniforms.midFreq.value = 0.4 + Math.cos(time * 0.7) * 0.3;
        shaderMaterial.uniforms.highFreq.value = 0.25 + Math.sin(time * 1.2) * 0.2;
        shaderMaterial.uniforms.transitionFactor.value = 1.0; // Keep bands fully visible
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Store refs for cleanup
    sceneRef.current = {
      scene,
      camera,
      renderer,
      cleanup: () => {
        cancelAnimationFrame(animationId);
        renderer.dispose();
        shaderMaterial.dispose();
        geometry.dispose();
        if (canvasRef.current && renderer.domElement) {
          canvasRef.current.removeChild(renderer.domElement);
        }
      }
    };

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      sceneRef.current.cleanup?.();
    };
  }, []);

  // Initialize audio context
  const initializeAudio = async () => {
    if (audioInitialized || !audioRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioData = () => {
        if (!isPlaying) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate frequency bands
        const lowFreq = Array.from(dataArray.slice(0, 64)).reduce((a, b) => a + b, 0) / 64 / 255;
        const midFreq = Array.from(dataArray.slice(64, 128)).reduce((a, b) => a + b, 0) / 64 / 255;
        const highFreq = Array.from(dataArray.slice(128, 192)).reduce((a, b) => a + b, 0) / 64 / 255;
        
        // Update shader uniforms
        if (sceneRef.current.scene) {
          const mesh = sceneRef.current.scene.children[0] as THREE.Mesh;
          const material = mesh.material as THREE.ShaderMaterial;
          material.uniforms.lowFreq.value = lowFreq;
          material.uniforms.midFreq.value = midFreq;
          material.uniforms.highFreq.value = highFreq;
          material.uniforms.isPlaying.value = isPlaying;
          material.uniforms.transitionFactor.value = isPlaying ? 1.0 : 0.0;
          material.uniforms.kickEnergy.value = lowFreq > 0.3 ? lowFreq * 2.0 : 0.0;
        }
        
        requestAnimationFrame(updateAudioData);
      };

      setAudioInitialized(true);
      updateAudioData();
      
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioInitialized) {
        initializeAudio();
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)' }}
      />
      
      {/* Hamburger Navigation */}
      <HamburgerNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        {/* Welcome Message - Animated */}
        <div className="mb-6 animate-pulse">
          <p 
            className="text-lg font-bold text-cyan-400 uppercase tracking-[4px] opacity-90"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            WELCOME BACK, INTERNATIONAL CITIZEN
          </p>
        </div>
        
        {/* User Name - Main Title with Audio-Reactive Glow */}
        <div className="mb-8">
          <h1 
            className="text-6xl md:text-8xl font-black text-white uppercase tracking-tight relative z-10"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              textShadow: '4px 4px 0px rgba(0,0,0,0.9), 0 0 50px rgba(255,255,255,0.2)',
              letterSpacing: '-0.02em',
              mixBlendMode: 'overlay'
            }}
          >
            {displayName}
          </h1>
        </div>
        
        {/* Personal Status Line */}
        <div className="mb-8">
          <p 
            className="text-xl font-bold text-white max-w-2xl mx-auto relative z-10"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
              fontStyle: 'italic'
            }}
          >
            When you learn to see the invisible, you create the impossible
          </p>
        </div>
        
        {/* Live Stats */}
        <div className="mb-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-black text-green-400" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            <div className="text-xs text-gray-400 font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              LOCAL TIME
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-400" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              LIVE
            </div>
            <div className="text-xs text-gray-400 font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              STATUS
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-orange-400" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {Math.floor(Math.random() * 99) + 1}%
            </div>
            <div className="text-xs text-gray-400 font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              ENERGY
            </div>
          </div>
        </div>
        
        {/* Enhanced Music Controls */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={togglePlayback}
              className={`neo-brutalist px-12 py-6 font-black uppercase text-xl hover:scale-110 transition-all duration-200 transform ${
                isPlaying 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-yellow-400 hover:to-orange-500 shadow-lg shadow-cyan-500/50'
              }`}
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif',
                textShadow: isPlaying ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
              }}
            >
              {isPlaying ? '⏸ EXPERIENCING NOW' : '🚀 LAUNCH YOUR SPACE'}
            </button>
            
            {/* Ambient Mode Button */}
            <button
              className="neo-brutalist bg-purple-600 text-white px-6 py-2 font-bold uppercase text-sm hover:scale-105 transition-all duration-150 opacity-80 hover:opacity-100"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              🌌 AMBIENT MODE
            </button>
          </div>
          
          {/* Interactive Status */}
          <div className="text-center space-y-2">
            <p 
              className={`text-lg font-bold ${isPlaying ? 'text-green-400 animate-pulse' : 'text-cyan-300'}`}
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            >
              {isPlaying ? '🎵 YOUR UNIVERSE IS ALIVE' : '✨ MOVE MOUSE • EXPLORE YOUR REALM'}
            </p>
            <p 
              className="text-sm text-gray-400 font-bold"
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            >
              This is your personal digital sanctuary
            </p>
          </div>
          
          <audio
            ref={audioRef}
            loop
            preload="metadata"
            className="hidden"
            crossOrigin="anonymous"
          >
            {/* Ambient space music */}
            <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
            <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBCmBzvLZiTkgEmO070+fEElBn+DHfiEFIXLB7duVQgwRXrfv65lOEAw=" type="audio/wav" />
          </audio>
          
          {/* Floating Particles Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-ping"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Noise Overlay for retro effect */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none opacity-10"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
          animation: 'noise 0.3s steps(5) infinite'
        }}
      />
      
      {/* CSS Animation for noise */}
      <style>{`
        @keyframes noise {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(-4%, 2%); }
          30% { transform: translate(2%, -4%); }
          40% { transform: translate(-2%, 5%); }
          50% { transform: translate(-4%, 2%); }
          60% { transform: translate(3%, 0); }
          70% { transform: translate(0, 3%); }
          80% { transform: translate(-3%, 0); }
          90% { transform: translate(2%, 2%); }
          100% { transform: translate(1%, 0); }
        }
      `}</style>
    </div>
  );
};