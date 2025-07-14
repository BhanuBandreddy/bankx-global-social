import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as THREE from 'three';

interface PostLoginHeroProps {
  onLaunchSpace: () => void;
}

export default function PostLoginHero({ onLaunchSpace }: PostLoginHeroProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    material: THREE.ShaderMaterial;
    cleanup: () => void;
  }>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMouse({ x, y });

      // Update custom cursor position
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Three.js setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111111, 1);

    // Shader material for glowing bands
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iMouse: { value: new THREE.Vector2(0.5, 0.5) },
        lowFreq: { value: 0 },
        midFreq: { value: 0 },
        highFreq: { value: 0 },
        transitionFactor: { value: 0 },
        isPlaying: { value: false }
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
        uniform bool isPlaying;

        // Color palette
        vec3 orange = vec3(1.0, 0.72, 0.1);
        vec3 yellow = vec3(1.0, 0.88, 0.45);
        vec3 glow = vec3(0.9, 0.5, 0.02);

        // Soft horizontal glowing bands
        float band(vec2 uv, float y, float thickness, float glowStrength, float speed, float offset, float audioBoost) {
          float wavyY = y + 0.07 * sin(uv.x * 6.0 + offset + iTime * speed) * (1.0 + audioBoost);
          float dist = abs(uv.y - wavyY);
          float base = exp(-dist * thickness * 12.0) * glowStrength * (0.5 + audioBoost);
          base *= exp(-dist * thickness * 5.0);
          return base;
        }

        void main() {
          vec2 uv = vUv;
          vec3 col = vec3(0.09, 0.06, 0.03); // very dark background

          // Audio-reactive intensity
          float audioIntensity = (lowFreq + midFreq + highFreq) / 3.0 * transitionFactor;

          // Default gentle animation when not playing
          float defaultLow = 0.3 + 0.2 * sin(iTime * 0.5);
          float defaultMid = 0.4 + 0.3 * cos(iTime * 0.7);
          float defaultHigh = 0.25 + 0.2 * sin(iTime * 1.2);

          float finalLow = isPlaying ? lowFreq : defaultLow;
          float finalMid = isPlaying ? midFreq : defaultMid;
          float finalHigh = isPlaying ? highFreq : defaultHigh;

          // Band 1 (top) - reacts to high frequencies
          float b1 = band(uv, 0.32, 0.21, 1.2, 0.6, 0.0, finalHigh * 2.0);
          col += b1 * mix(orange, yellow, 0.5);

          // Band 2 (middle, strongest) - reacts to mid frequencies
          float b2 = band(uv, 0.5 + 0.05*sin(iTime*0.3), 0.24, 1.7, 1.6, 1.5, finalMid * 3.0);
          col += b2 * glow;

          // Band 3 (lower) - reacts to low frequencies
          float b3 = band(uv, 0.74, 0.17, 1.2, 1.1, 3.5, finalLow * 2.5);
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

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update uniforms
      shaderMaterial.uniforms.iTime.value = performance.now() * 0.001;
      shaderMaterial.uniforms.iMouse.value.set(mouse.x, mouse.y);
      shaderMaterial.uniforms.isPlaying.value = isPlaying;
      shaderMaterial.uniforms.transitionFactor.value = isPlaying ? 1.0 : 0.8;
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      shaderMaterial.uniforms.iResolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Store refs for cleanup
    sceneRef.current = {
      scene,
      camera,
      renderer,
      material: shaderMaterial,
      cleanup: () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        shaderMaterial.dispose();
        geometry.dispose();
      }
    };

    return () => {
      sceneRef.current?.cleanup();
    };
  }, [mouse, isPlaying]);

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying);
    onLaunchSpace();
  };

  const displayName = user?.name || 'TRAVELER';
  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900" style={{ cursor: 'none' }}>
      {/* Noise overlay */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-20 z-50"
        style={{
          background: 'transparent url("http://assets.iceable.com/img/noise-transparent.png") repeat 0 0',
          backgroundSize: '300px 300px',
          animation: 'noise-animation 0.3s steps(5) infinite'
        }}
      />

      {/* Canvas container */}
      <div ref={containerRef} className="absolute inset-0">
        <canvas 
          ref={canvasRef}
          className="block fixed top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 2 }}
        />
      </div>

      {/* Content overlay */}
      <div className="fixed inset-0 flex flex-col justify-center items-center text-center text-white z-20 px-5">
        <div className="max-w-[90%] overflow-hidden">
          {/* Welcome text */}
          <div 
            className="mb-7 text-cyan-300 text-xl font-bold tracking-widest"
            style={{ fontFamily: 'Bodoni Moda, serif' }}
          >
            WELCOME BACK, INTERNATIONAL CITIZEN
          </div>

          {/* Main title - User's name */}
          <h1 
            className="text-8xl font-black leading-tight tracking-tight mb-20 uppercase"
            style={{ 
              fontFamily: 'Boldonse, sans-serif',
              fontSize: 'clamp(3rem, 8vw, 8rem)',
              textShadow: '0 2px 20px rgba(0,0,0,0.6)',
              letterSpacing: '-0.02em'
            }}
          >
            {displayName}
          </h1>

          {/* Quote */}
          <h2 
            className="text-2xl font-medium italic opacity-70 mb-8"
            style={{ fontFamily: 'Bodoni Moda, serif' }}
          >
            When you learn to see the invisible, you create the impossible
          </h2>

          {/* Caption */}
          <div 
            className="text-lg mb-10"
            style={{ fontFamily: 'Bodoni Moda, serif' }}
          >
            Redeem yourself
          </div>

          {/* Info blocks */}
          <div className="flex justify-center gap-8 text-lg mb-10 font-bold tracking-widest">
            <div className="bg-black/30 px-10 py-3 rounded-3xl shadow-lg">
              <div className="text-cyan-300">{timeString}</div>
              <div className="text-sm text-white font-normal">LOCAL TIME</div>
            </div>
            <div className="bg-black/30 px-10 py-3 rounded-3xl shadow-lg">
              <div className="text-green-400">LIVE</div>
              <div className="text-sm text-white font-normal">STATUS</div>
            </div>
            <div className="bg-black/30 px-10 py-3 rounded-3xl shadow-lg">
              <div className="text-yellow-300">72%</div>
              <div className="text-sm text-white font-normal">ENERGY</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 items-center mb-14">
            <button 
              onClick={handlePlayClick}
              className="bg-gradient-to-r from-cyan-400 to-cyan-300 text-gray-900 border-none rounded-full px-16 py-4 text-xl font-extrabold shadow-2xl cursor-pointer transition-all duration-200 hover:from-cyan-300 hover:to-cyan-200"
            >
              🚀 {isPlaying ? 'PAUSE SPACE' : 'LAUNCH YOUR SPACE'}
            </button>
            <button className="bg-gradient-to-r from-purple-400 to-orange-300 text-gray-900 border-none rounded-full px-12 py-3 text-lg font-bold shadow-xl cursor-pointer transition-all duration-200 hover:from-purple-300 hover:to-orange-200">
              🌈 AMBIENT MODE
            </button>
          </div>

          {/* Footer text */}
          <div className="text-yellow-300 text-base tracking-widest mb-3">
            ✨ MOVE MOUSE &nbsp; · &nbsp; EXPLORE YOUR REALM
          </div>
          <div className="text-white opacity-82 text-lg">
            This is your personal digital sanctuary
          </div>
          <div 
            className="text-white opacity-70 mt-2 text-base italic"
            style={{ fontFamily: 'Bodoni Moda, serif' }}
          >
            Music by KOSIKK
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="fixed bottom-4 left-4 flex items-center gap-3 p-4 max-w-xs w-full z-50 text-white">
        <img 
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          src="https://filip-zrnzevic-portfolio-2025-v3.vercel.app/_next/image?url=%2Fimages%2Fprofile003.jpg&w=48&q=75"
          alt="Filip Zrnzević"
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">Filip Zrnzević</p>
          <p className="text-xs text-gray-400">
            <a href="https://x.com/filipz" target="_blank" rel="noopener noreferrer" className="no-underline text-inherit hover:underline">
              @filipz
            </a>
          </p>
        </div>
      </div>

      {/* Custom cursor */}
      <div 
        ref={cursorRef}
        className="fixed w-4 h-4 rounded-full bg-white/50 pointer-events-none z-[9999] transition-all duration-200"
        style={{
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference'
        }}
      />

      {/* CSS animations */}
      <style>{`
        @keyframes noise-animation {
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
}