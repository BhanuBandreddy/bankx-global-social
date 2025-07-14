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
        // Color uniforms
        bgColorDown: { value: new THREE.Vector3(0.16, 0.08, 0.04) },
        bgColorUp: { value: new THREE.Vector3(0.08, 0.04, 0.02) },
        color1In: { value: new THREE.Vector3(1.0, 0.78, 0.0) },
        color1Out: { value: new THREE.Vector3(1.0, 0.39, 0.0) },
        color2In: { value: new THREE.Vector3(1.0, 0.39, 0.39) },
        color2Out: { value: new THREE.Vector3(0.78, 0.20, 0.20) },
        color3In: { value: new THREE.Vector3(1.0, 0.59, 0.20) },
        color3Out: { value: new THREE.Vector3(0.78, 0.39, 0.0) },
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
      
      // Add subtle default animation even without audio
      const time = performance.now() * 0.001;
      if (!isPlaying) {
        shaderMaterial.uniforms.lowFreq.value = 0.1 + Math.sin(time * 0.5) * 0.05;
        shaderMaterial.uniforms.midFreq.value = 0.08 + Math.cos(time * 0.7) * 0.04;
        shaderMaterial.uniforms.highFreq.value = 0.06 + Math.sin(time * 1.2) * 0.03;
        shaderMaterial.uniforms.transitionFactor.value = 0.3;
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
        {/* International Citizen Label */}
        <div className="mb-4">
          <p 
            className="text-lg font-bold text-white uppercase tracking-[4px] opacity-80"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            INTERNATIONAL CITIZEN
          </p>
        </div>
        
        {/* User Name - Main Title */}
        <div className="mb-8">
          <h1 
            className="text-6xl md:text-8xl font-black text-white uppercase tracking-tight"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              textShadow: '4px 4px 0px rgba(0,0,0,0.8)',
              letterSpacing: '-0.02em'
            }}
          >
            {displayName}
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="mb-12">
          <p 
            className="text-xl font-bold text-gray-300 max-w-2xl mx-auto"
            style={{ fontFamily: 'Roboto Mono, monospace' }}
          >
            Connect • Trust • Explore • Trade
          </p>
        </div>
        
        {/* Music Controls */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={togglePlayback}
            className={`neo-brutalist px-8 py-4 font-black uppercase text-lg hover:scale-105 transition-all duration-150 ${
              isPlaying 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-white text-black'
            }`}
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            {isPlaying ? '⏸ PAUSE EXPERIENCE' : '▶ START EXPERIENCE'}
          </button>
          
          {/* Status Indicator */}
          <div className="text-center">
            <p 
              className={`text-sm font-bold ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            >
              {isPlaying ? '🎵 EXPERIENCE ACTIVE' : '💫 MOVE MOUSE TO INTERACT'}
            </p>
          </div>
          
          <audio
            ref={audioRef}
            loop
            preload="metadata"
            className="hidden"
            crossOrigin="anonymous"
          >
            {/* Fallback to a simple tone generator */}
            <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBCmBzvLZiTkgEmO070+fEElBn+DHfiEFIXLB7duVQgwRXrfv65lOEAw=" type="audio/wav" />
          </audio>
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