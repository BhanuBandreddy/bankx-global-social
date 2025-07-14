import { useEffect, useRef, useState } from 'react';
import { HamburgerNavigation } from './HamburgerNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Mic, MicOff } from 'lucide-react';

export const AdvancedMusicReactiveHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [audioData, setAudioData] = useState(0.3);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    const initAudio = async () => {
      try {
        if (micEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContext = new AudioContext();
          source = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 1024;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          console.log('🎵 Real-time audio analysis enabled');
        }
      } catch (error) {
        console.log('Microphone access denied, using simulation');
        setMicEnabled(false);
      }
    };

    const initThreeJS = async () => {
      try {
        const THREE = await import('three');
        
        const canvas = canvasRef.current!;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x111111, 0.9);

        // Advanced vertex shader with Perlin noise
        const vertexShader = `
          uniform float u_time;
          uniform float u_audioLevel;
          uniform float u_bassLevel;
          uniform float u_midLevel;
          uniform float u_trebleLevel;
          uniform vec2 u_resolution;
          
          varying vec2 vUv;
          varying float vNoise;
          varying float vDisplacement;
          varying vec3 vPosition;
          
          // Simplex noise function
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          
          float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }
          
          void main() {
            vUv = uv;
            vPosition = position;
            
            // Multi-frequency noise layers
            float time = u_time * 0.5;
            float bassNoise = snoise(vec3(position.x * 0.01 + time * 0.1, position.y * 0.01, time)) * u_bassLevel;
            float midNoise = snoise(vec3(position.x * 0.05 + time * 0.3, position.y * 0.05, time * 1.5)) * u_midLevel;
            float trebleNoise = snoise(vec3(position.x * 0.1 + time * 0.8, position.y * 0.1, time * 2.0)) * u_trebleLevel;
            
            float displacement = (bassNoise * 2.0 + midNoise * 1.5 + trebleNoise * 1.0) * u_audioLevel;
            displacement += snoise(vec3(position.xy * 0.02, time * 0.2)) * 0.5;
            
            vNoise = displacement;
            vDisplacement = displacement;
            
            vec3 newPosition = position;
            newPosition.z += displacement * 5.0;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `;

        // Advanced fragment shader with Fresnel effect
        const fragmentShader = `
          uniform float u_time;
          uniform float u_audioLevel;
          uniform float u_bassLevel;
          uniform float u_midLevel;
          uniform float u_trebleLevel;
          uniform vec2 u_resolution;
          
          varying vec2 vUv;
          varying float vNoise;
          varying float vDisplacement;
          varying vec3 vPosition;
          
          void main() {
            // Audio-reactive color palette
            vec3 bassColor = vec3(1.0, 0.2, 0.0);    // Red for bass
            vec3 midColor = vec3(1.0, 0.6, 0.0);     // Orange for mids
            vec3 trebleColor = vec3(1.0, 0.9, 0.2);  // Gold for treble
            
            // Fresnel effect for glow
            vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
            vec3 viewDir = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - abs(dot(normal, viewDir));
            fresnel = pow(fresnel, 2.0);
            
            // Mix colors based on frequency levels
            vec3 color = bassColor * u_bassLevel + midColor * u_midLevel + trebleColor * u_trebleLevel;
            color = mix(color, trebleColor, fresnel);
            
            // Audio-reactive intensity
            float intensity = smoothstep(-0.5, 1.0, vDisplacement);
            intensity *= (0.5 + u_audioLevel * 2.0);
            
            // Add glow effect
            color *= intensity;
            color += fresnel * trebleColor * 0.5;
            
            // Pulsing effect
            float pulse = sin(u_time * 10.0) * 0.1 + 0.9;
            color *= pulse;
            
            gl_FragColor = vec4(color, intensity * 0.8);
          }
        `;

        // Create geometry with higher detail
        const geometry = new THREE.PlaneGeometry(30, 20, 256, 170);
        
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            u_time: { value: 0 },
            u_audioLevel: { value: 0.3 },
            u_bassLevel: { value: 0.2 },
            u_midLevel: { value: 0.3 },
            u_trebleLevel: { value: 0.4 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add particle system for extra effect
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 50;     // x
          positions[i + 1] = (Math.random() - 0.5) * 30; // y
          positions[i + 2] = (Math.random() - 0.5) * 20; // z
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
          color: 0xFFD700,
          size: 2,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        camera.position.z = 15;
        sceneRef.current = { scene, camera, renderer, mesh, particles, material };

        // Animation loop
        let bassLevel = 0.2, midLevel = 0.3, trebleLevel = 0.4;
        
        const animate = () => {
          requestAnimationFrame(animate);
          
          // Get real audio data if available
          if (analyser && dataArray && micEnabled && isPlaying) {
            analyser.getByteFrequencyData(dataArray);
            
            // Separate frequency bands
            const bassFreq = dataArray.slice(0, 64);
            const midFreq = dataArray.slice(64, 192);
            const trebleFreq = dataArray.slice(192, 512);
            
            bassLevel = bassFreq.reduce((a, b) => a + b, 0) / (bassFreq.length * 255);
            midLevel = midFreq.reduce((a, b) => a + b, 0) / (midFreq.length * 255);
            trebleLevel = trebleFreq.reduce((a, b) => a + b, 0) / (trebleFreq.length * 255);
            
            const overallLevel = dataArray.reduce((a, b) => a + b, 0) / (dataArray.length * 255);
            setAudioData(overallLevel);
          } else if (isPlaying) {
            // Enhanced simulation with multiple frequency bands
            const time = Date.now() * 0.001;
            bassLevel = 0.3 + Math.sin(time * 2) * 0.2;
            midLevel = 0.4 + Math.sin(time * 3.5) * 0.25;
            trebleLevel = 0.5 + Math.sin(time * 5.2) * 0.3;
            setAudioData(0.4 + Math.sin(time * 4) * 0.2);
          }
          
          // Update shader uniforms
          material.uniforms.u_time.value += 0.016;
          material.uniforms.u_audioLevel.value = audioData;
          material.uniforms.u_bassLevel.value = bassLevel;
          material.uniforms.u_midLevel.value = midLevel;
          material.uniforms.u_trebleLevel.value = trebleLevel;
          
          // Animate mesh
          mesh.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
          mesh.rotation.y = Math.cos(Date.now() * 0.0003) * 0.05;
          
          // Animate particles
          particles.rotation.x += 0.001;
          particles.rotation.y += 0.002;
          
          renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (audioContext) audioContext.close();
        };

      } catch (error) {
        console.error('Three.js initialization failed:', error);
      }
    };

    initAudio();
    initThreeJS();
  }, [micEnabled, isPlaying, audioData]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMicToggle = () => {
    setMicEnabled(!micEnabled);
  };

  return (
    <div className="advanced-music-hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      
      <div className="hero-overlay" />
      
      <HamburgerNavigation />
      
      <div className="hero-content">
        <div className="subtitle">
          Find beauty in the space between sound
        </div>

        <h1 className="main-title">
          THE ART OF
          <br />
          LISTENING
        </h1>

        <div className="quote">
          When you learn to see the invisible, you create the impossible.
        </div>

        <div className="user-section">
          <div className="user-name">{user?.name || 'Guest'}</div>
          <div className="user-status">INTERNATIONAL CITIZEN</div>
        </div>

        <div className="controls">
          <Button onClick={handlePlayToggle} className="control-button play-button">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </Button>
          
          <Button onClick={handleMicToggle} className={`control-button mic-button ${micEnabled ? 'active' : ''}`}>
            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            {micEnabled ? 'MIC ON' : 'MIC OFF'}
          </Button>
        </div>
      </div>

      <style>{`
        .advanced-music-hero {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #0a0a0a;
          overflow: hidden;
          z-index: 10;
        }

        .hero-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%);
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
            0 0 20px rgba(255, 215, 0, 0.6),
            0 0 40px rgba(255, 165, 0, 0.4),
            0 0 60px rgba(255, 140, 0, 0.3);
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

        .controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .control-button {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: 4px solid #FFD700;
          padding: 1rem 2rem;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem;
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

        .control-button:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: #FFA500;
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.5),
            inset 0 0 20px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        .mic-button.active {
          border-color: #00FF88;
          color: #00FF88;
          box-shadow: 
            0 0 20px rgba(0, 255, 136, 0.3),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .mic-button.active:hover {
          border-color: #00CC66;
          box-shadow: 
            0 0 30px rgba(0, 255, 136, 0.5),
            inset 0 0 20px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: clamp(3rem, 15vw, 8rem);
          }
          
          .user-name {
            font-size: 2rem;
          }
          
          .controls {
            flex-direction: column;
            align-items: center;
          }
          
          .control-button {
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
};