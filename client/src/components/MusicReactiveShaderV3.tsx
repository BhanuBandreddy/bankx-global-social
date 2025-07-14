import { useEffect, useRef, useState } from 'react';
import { HamburgerNavigation } from './HamburgerNavigation';
import { useAuth } from '@/contexts/AuthContext';

export const MusicReactiveShaderV3 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationId: number;
    let startTime = Date.now();
    let frameCount = 0;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec4 a_position;
      varying vec2 v_uv;
      
      void main() {
        gl_Position = a_position;
        v_uv = a_position.xy * 0.5 + 0.5;
      }
    `;

    // Fragment shader based on shadertoy.com/view/MtVBzG
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_audioLevel;
      uniform float u_playing;
      
      varying vec2 v_uv;
      
      // Hash function for noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      // Noise function
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      
      // FBM (Fractal Brownian Motion)
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 6; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      void main() {
        vec2 uv = v_uv;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        float time = u_time * 0.5;
        
        // Audio reactive parameters
        float audioFactor = u_playing > 0.5 ? (0.5 + u_audioLevel * 2.0) : 0.7;
        float pulse = 1.0 + sin(time * 8.0) * audioFactor * 0.3;
        
        // Create wavy distortion
        float wave = sin(p.y * 3.0 + time * 2.0) * 0.1 * audioFactor;
        p.x += wave;
        
        // Multiple noise layers for complexity
        float n1 = fbm(p * 2.0 + time * 0.5);
        float n2 = fbm(p * 4.0 - time * 0.3);
        float n3 = fbm(p * 8.0 + time * 0.7);
        
        // Combine noise layers
        float noise_combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
        
        // Create horizontal waves effect
        float horizontal_wave = sin(p.y * 15.0 + time * 3.0 + noise_combined * 5.0) * audioFactor;
        horizontal_wave *= exp(-abs(p.y) * 2.0); // Fade at edges
        
        // Color based on position and audio
        vec3 color1 = vec3(1.0, 0.8, 0.2); // Gold
        vec3 color2 = vec3(1.0, 0.4, 0.0); // Orange
        vec3 color3 = vec3(0.8, 0.2, 0.0); // Red
        
        float colorMix = smoothstep(-0.5, 0.5, horizontal_wave + noise_combined - 0.5);
        vec3 finalColor = mix(color3, mix(color2, color1, colorMix), colorMix * audioFactor);
        
        // Add glow effect
        float glow = exp(-abs(p.y) * 3.0) * audioFactor * pulse;
        finalColor *= glow;
        
        // Add brightness based on audio
        finalColor *= (0.3 + audioFactor * 1.2);
        
        // Vignette effect
        float vignette = 1.0 - length(p * 0.5);
        finalColor *= vignette;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Create shader function
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    // Create program
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    // Get attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const audioLevelUniformLocation = gl.getUniformLocation(program, 'u_audioLevel');
    const playingUniformLocation = gl.getUniformLocation(program, 'u_playing');

    // Create buffer for fullscreen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    // Audio setup
    let audioLevel = 0.5;
    
    // Animation loop
    const render = () => {
      // Calculate FPS
      frameCount++;
      const elapsed = Date.now() - startTime;
      if (elapsed >= 1000) {
        setFps(Math.round(frameCount * 1000 / elapsed));
        frameCount = 0;
        startTime = Date.now();
      }

      // Update audio level with simulation
      if (isPlaying) {
        const time = Date.now() * 0.001;
        audioLevel = 0.5 + Math.sin(time * 3) * 0.3 + Math.sin(time * 7) * 0.2;
      } else {
        audioLevel *= 0.95; // Fade out when not playing
      }

      // Clear and setup
      gl.clearColor(0.067, 0.067, 0.067, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use program
      gl.useProgram(program);

      // Set uniforms
      gl.uniform1f(timeUniformLocation, Date.now() * 0.001);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(audioLevelUniformLocation, audioLevel);
      gl.uniform1f(playingUniformLocation, isPlaying ? 1.0 : 0.0);

      // Setup attributes
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPlaying]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-shader-container">
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef}
        className="shader-canvas"
      />

      {/* Animated noise overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <HamburgerNavigation />

      {/* Content */}
      <div className="content">
        <div className="quote-container">
          <div className="caption">Find beauty in the space between sound</div>
          <div className="quote">THE ART OF<br />LISTENING</div>
          <div className="author">When you learn to see the invisible, you create the impossible.</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Guest'}</div>
            <div className="user-status">INTERNATIONAL CITIZEN</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button 
          className="play-button"
          onClick={handlePlayToggle}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
      </div>

      {/* FPS Counter */}
      <div className="fps-counter">FPS: {fps}</div>

      <style>{`
        .music-shader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #111;
          overflow: hidden;
          cursor: none;
          font-family: 'Bebas Neue', sans-serif;
        }

        .shader-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .noise-overlay {
          content: "";
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: transparent url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E") repeat 0 0;
          background-size: 300px 300px;
          animation: noise-animation 0.3s steps(5) infinite;
          opacity: 0.8;
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

        .content {
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
          padding: 20px;
          text-align: center;
          color: #e0e0e0;
        }

        .quote-container {
          max-width: 90%;
          overflow: hidden;
        }

        .caption {
          font-family: 'Roboto Mono', monospace;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .quote {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 8vw, 10rem);
          line-height: 0.85;
          font-weight: 900;
          color: #e0e0e0;
          margin-bottom: 2rem;
          text-shadow: 
            0 0 20px rgba(255, 215, 0, 0.5),
            0 0 40px rgba(255, 165, 0, 0.3);
          letter-spacing: -0.03em;
        }

        .author {
          font-family: 'Roboto Mono', monospace;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3rem;
          line-height: 1.6;
          font-style: italic;
        }

        .user-info {
          margin-bottom: 2rem;
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
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .controls {
          position: fixed;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
        }

        .play-button {
          background: rgba(0, 0, 0, 0.7);
          color: #e0e0e0;
          border: 3px solid #FFD700;
          padding: 15px 40px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border-radius: 0;
          box-shadow: 
            0 0 20px rgba(255, 215, 0, 0.3),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .play-button:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: #FFA500;
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.5),
            inset 0 0 20px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        .fps-counter {
          position: fixed;
          top: 20px;
          right: 20px;
          color: rgba(255, 255, 255, 0.5);
          font-family: 'Roboto Mono', monospace;
          font-size: 12px;
          z-index: 30;
          background: rgba(0, 0, 0, 0.5);
          padding: 5px 10px;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .quote {
            font-size: clamp(3rem, 12vw, 6rem);
          }
          
          .user-name {
            font-size: 2rem;
          }
          
          .play-button {
            padding: 12px 30px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};