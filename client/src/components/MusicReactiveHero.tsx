import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth';
import { HamburgerNavigation } from './HamburgerNavigation';

export const MusicReactiveHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // Get user data
    const fetchUser = async () => {
      try {
        const userData = await authClient.getUser();
        setUser(userData);
      } catch (error) {
        console.log('No user logged in');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Custom cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Three.js music reactive implementation
    const initThreeJS = async () => {
      const THREE = await import('three');
      
      const canvas = canvasRef.current!;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x111111, 1);

      // Create audio-reactive geometry
      const geometry = new THREE.PlaneGeometry(20, 10, 100, 50);
      
      // Shader material for the wave effect
      const vertexShader = `
        uniform float uTime;
        uniform float uAudioData;
        varying vec2 vUv;
        varying float vDisplacement;
        
        void main() {
          vUv = uv;
          
          // Create wave displacement based on audio and time
          float displacement = sin(position.x * 0.5 + uTime * 2.0) * 
                              cos(position.y * 0.3 + uTime * 1.5) * 
                              (0.5 + uAudioData * 2.0);
          
          vDisplacement = displacement;
          
          vec3 newPosition = position;
          newPosition.z += displacement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float uTime;
        uniform float uAudioData;
        varying vec2 vUv;
        varying float vDisplacement;
        
        void main() {
          // Create glowing wave colors
          vec3 color1 = vec3(1.0, 0.8, 0.0); // Gold
          vec3 color2 = vec3(1.0, 0.4, 0.0); // Orange
          vec3 color3 = vec3(1.0, 0.0, 0.0); // Red
          
          float wave = sin(vUv.x * 10.0 + uTime * 3.0) * cos(vUv.y * 8.0 + uTime * 2.0);
          float intensity = smoothstep(-0.5, 0.5, wave + vDisplacement * 2.0);
          
          vec3 finalColor = mix(color3, color1, intensity);
          finalColor *= (0.3 + uAudioData * 2.0);
          
          gl_FragColor = vec4(finalColor, intensity * 0.8);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uAudioData: { value: 0.3 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      camera.position.z = 5;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        material.uniforms.uTime.value += 0.016;
        // Simulate audio reactivity with sine wave
        material.uniforms.uAudioData.value = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
        
        mesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        mesh.rotation.y = Math.cos(Date.now() * 0.001) * 0.1;
        
        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    initThreeJS();
  }, []);

  return (
    <div className="music-reactive-hero">
      {/* Noise overlay */}
      <div className="noise-overlay" />
      
      {/* Three.js Canvas */}
      <canvas 
        ref={canvasRef}
        className="threejs-canvas"
      />
      
      {/* Custom cursor */}
      <div ref={cursorRef} className="custom-cursor" />
      
      {/* Main content */}
      <div className="hero-content">
        <div className="subtitle">INTERNATIONAL CITIZEN</div>
        <div className="main-title">
          {user?.name || 'GLOBAL SOCIAL'}
        </div>
        <div className="tagline">When you learn to see the invisible, you create the impossible.</div>
      </div>

      {/* Hamburger Navigation */}
      <HamburgerNavigation />

      {/* Profile card (bottom left) */}
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-name">{user?.name || 'Guest User'}</div>
          <div className="profile-status">Trust Network Member</div>
        </div>
      </div>

      <style jsx>{`
        .music-reactive-hero {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          cursor: none;
          background-color: #111;
          font-family: 'Roboto Mono', monospace;
        }

        .noise-overlay {
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: transparent url("http://assets.iceable.com/img/noise-transparent.png") repeat 0 0;
          background-size: 300px 300px;
          animation: noise-animation 0.3s steps(5) infinite;
          opacity: 0.6;
          z-index: 100;
          pointer-events: none;
        }

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

        .threejs-canvas {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 2;
          pointer-events: none;
        }

        .custom-cursor {
          position: fixed;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          pointer-events: none;
          mix-blend-mode: difference;
          z-index: 9999;
          transition: width 0.2s, height 0.2s;
        }

        .hero-content {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 20;
          text-align: center;
          color: #e0e0e0;
        }

        .subtitle {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.5em;
          margin-bottom: 1rem;
          opacity: 0.8;
          text-transform: uppercase;
        }

        .main-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 8vw;
          line-height: 1.1;
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: 2rem;
          text-transform: uppercase;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
        }

        .tagline {
          font-family: 'Roboto Mono', monospace;
          font-size: 1.2rem;
          font-style: italic;
          opacity: 0.7;
          max-width: 600px;
          line-height: 1.4;
        }

        .profile-card {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 999;
          color: #e0e0e0;
          background: rgba(0, 0, 0, 0.3);
          padding: 12px 16px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .profile-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .profile-status {
          font-size: 12px;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 12vw;
          }
          
          .subtitle {
            font-size: 1.5rem;
            letter-spacing: 0.3em;
          }
          
          .tagline {
            font-size: 1rem;
            padding: 0 20px;
          }
        }
      `}</style>
    </div>
  );
};