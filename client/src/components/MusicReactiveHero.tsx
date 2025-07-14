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
        isPlaying: { value: false },
        transitionFactor: { value: 0 },
        kickEnergy: { value: 0 },
        bounceEffect: { value: 0 },
        // Enhanced Color uniforms for more vibrant personal space
        bgColorDown: { value: new THREE.Vector3(0.05, 0.02, 0.15) }, // Deep space blue
        bgColorUp: { value: new THREE.Vector3(0.02, 0.01, 0.08) }, // Darker purple
        color1In: { value: new THREE.Vector3(0.0, 1.0, 1.0) }, // Bright cyan
        color1Out: { value: new THREE.Vector3(0.0, 0.8, 1.0) }, // Electric blue
        color2In: { value: new THREE.Vector3(1.0, 0.2, 0.8) }, // Hot pink
        color2Out: { value: new THREE.Vector3(0.8, 0.0, 0.6) }, // Deep magenta
        color3In: { value: new THREE.Vector3(1.0, 0.8, 0.0) }, // Gold
        color3Out: { value: new THREE.Vector3(1.0, 0.4, 0.0) }, // Orange
        // Animation uniforms
        baseSpeed: { value: 1.0 },
        lineThickness: { value: 1.8 },
        waveIntensity: { value: 0.08 },
        rippleIntensity: { value: 0.25 }
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
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        uniform float lowFreq;
        uniform float midFreq;
        uniform float highFreq;
        uniform bool isPlaying;
        uniform float transitionFactor;
        uniform float kickEnergy;
        uniform vec3 bgColorDown;
        uniform vec3 bgColorUp;
        uniform vec3 color1In;
        uniform vec3 color1Out;
        uniform vec3 color2In;
        uniform vec3 color2Out;
        uniform vec3 color3In;
        uniform vec3 color3Out;
        uniform float baseSpeed;
        uniform float lineThickness;
        uniform float waveIntensity;
        uniform float rippleIntensity;
        
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        void main() {
          vec2 p = vUv;
          vec2 center = vec2(0.5, 0.5);
          
          // Background gradient
          vec3 bgCol = mix(bgColorDown, bgColorUp, p.y);
          
          // Audio-reactive elements
          float audioFactor = (lowFreq + midFreq + highFreq) / 3.0;
          float time = iTime * baseSpeed;
          
          // Create waves based on audio and mouse interaction
          vec2 mouse = iMouse;
          float mouseEffect = distance(p, mouse) * 2.0;
          float wave1 = sin(p.x * 10.0 + time * 2.0 + lowFreq * 5.0 + mouseEffect) * waveIntensity;
          float wave2 = sin(p.y * 8.0 + time * 1.5 + midFreq * 4.0 + mouseEffect * 0.8) * waveIntensity;
          float wave3 = sin(distance(p, center) * 15.0 - time * 3.0 + highFreq * 6.0 + mouseEffect * 0.6) * waveIntensity;
          
          // Combine waves
          float combinedWave = (wave1 + wave2 + wave3) * transitionFactor;
          
          // Add kick ripple effect
          float dist = distance(p, center);
          float ripple = sin(dist * 20.0 - time * 8.0) * kickEnergy * rippleIntensity;
          
          // Create color zones
          float zone1 = smoothstep(0.2, 0.4, dist + combinedWave + ripple);
          float zone2 = smoothstep(0.4, 0.6, dist + combinedWave + ripple);
          float zone3 = smoothstep(0.6, 0.8, dist + combinedWave + ripple);
          
          // Mix colors
          vec3 color = bgCol;
          color = mix(color, color1In, zone1 * (1.0 - zone2));
          color = mix(color, color2In, zone2 * (1.0 - zone3));
          color = mix(color, color3In, zone3);
          
          // Add some noise for texture
          float noiseVal = smoothNoise(p * 50.0 + time * 0.5) * 0.1;
          color += noiseVal;
          
          gl_FragColor = vec4(color, 1.0);
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
      
      // Add engaging default animation even without audio
      const time = performance.now() * 0.001;
      if (!isPlaying) {
        // More dynamic default animation that responds to mouse
        const mouseDistance = Math.sqrt((mouse.x - 0.5) ** 2 + (mouse.y - 0.5) ** 2);
        const mouseInfluence = Math.min(mouseDistance * 2, 1);
        
        shaderMaterial.uniforms.lowFreq.value = 0.15 + Math.sin(time * 0.8) * 0.1 + mouseInfluence * 0.2;
        shaderMaterial.uniforms.midFreq.value = 0.12 + Math.cos(time * 1.1) * 0.08 + mouseInfluence * 0.15;
        shaderMaterial.uniforms.highFreq.value = 0.08 + Math.sin(time * 1.5) * 0.06 + mouseInfluence * 0.1;
        shaderMaterial.uniforms.transitionFactor.value = 0.5 + mouseInfluence * 0.3;
        shaderMaterial.uniforms.kickEnergy.value = Math.sin(time * 2) * 0.3 + mouseInfluence * 0.4;
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
        
        {/* User Name - Main Title with Glow Effect */}
        <div className="mb-8">
          <h1 
            className="text-6xl md:text-8xl font-black text-white uppercase tracking-tight hover:text-cyan-300 transition-colors duration-500"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              textShadow: '4px 4px 0px rgba(0,0,0,0.8), 0 0 30px rgba(0,255,255,0.3)',
              letterSpacing: '-0.02em'
            }}
          >
            {displayName}
          </h1>
        </div>
        
        {/* Personal Status Line */}
        <div className="mb-8">
          <p 
            className="text-xl font-bold text-yellow-300 max-w-2xl mx-auto animate-bounce"
            style={{ fontFamily: 'Roboto Mono, monospace' }}
          >
            Your Digital Command Center • Ready for Action
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