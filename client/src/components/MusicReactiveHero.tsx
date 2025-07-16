// MusicReactiveHero.tsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GUI } from "dat.gui";

type Props = { userName: string };

export default function MusicReactiveHero({ userName }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number,
      ctx: AudioContext | undefined,
      analyser: AnalyserNode | undefined,
      gui: GUI | undefined,
      playing = false,
      audioStartedAt = 0;
    let frame = 0, lastFpsCheck = Date.now();

    const mount = mountRef.current!;
    mount.innerHTML = "";
    Object.assign(mount.style, {
      position: "relative",
      width: "100vw",
      height: "700px",
      background: "#111",
    });

    // --- Username Overlay (large text across light ray like GLOBAL SOCIAL) ---
    const title = document.createElement("div");
    title.textContent = userName;
    Object.assign(title.style, {
      position: "absolute", 
      left: "50%", 
      top: "50%",
      transform: "translate(-50%, -50%)",
      color: "#fff", 
      fontWeight: "900",
      fontSize: "clamp(3rem, 8vw, 8rem)", 
      letterSpacing: "0.1em", 
      zIndex: "3",
      textShadow: "0 4px 16px rgba(0,0,0,0.8)", 
      fontFamily: "Arial, sans-serif",
      pointerEvents: "none",
      textAlign: "center",
      whiteSpace: "nowrap",
      textTransform: "uppercase"
    });
    mount.appendChild(title);

    // --- Compact Controls ---
    const controls = document.createElement("div");
    Object.assign(controls.style, {
      position: "absolute", top: "36px", width: "100%",
      display: "flex", justifyContent: "center", alignItems: "center", gap: "16px",
      zIndex: "10",
    });
    const playBtn = document.createElement("button");
    playBtn.textContent = "PLAY";
    Object.assign(playBtn.style, {
      background: "#fff", color: "#111", fontWeight: "600", fontFamily: "Roboto Mono, monospace",
      borderRadius: "14px", border: "0", fontSize: "1rem", padding: "8px 22px",
      cursor: "pointer", boxShadow: "0 2px 8px #0002"
    });
    controls.appendChild(playBtn);
    const input = document.createElement("input");
    input.type = "file"; input.accept = "audio/*"; input.style.display = "none";
    const uploadLabel = document.createElement("label");
    uploadLabel.textContent = "Upload your song";
    Object.assign(uploadLabel.style, {
      background: "#fff", color: "#111", fontWeight: "600", fontFamily: "Roboto Mono, monospace",
      borderRadius: "14px", padding: "8px 22px", cursor: "pointer", boxShadow: "0 2px 8px #0002"
    });
    uploadLabel.appendChild(input);
    controls.appendChild(uploadLabel); mount.appendChild(controls);

    const fpsDiv = document.createElement("div");
    fpsDiv.textContent = "FPS: 0";
    Object.assign(fpsDiv.style, {
      position: "absolute", top: "8px", right: "18px", color: "#fff",
      fontSize: "15px", zIndex: "12", textShadow: "0 2px 8px #000b"
    });
    mount.appendChild(fpsDiv);

    // ===== Three.js Scene Setup (Optimized) =====
    const width = Math.min(mount.offsetWidth || window.innerWidth, 1920); // Cap resolution
    const height = Math.min(mount.offsetHeight || 700, 1080);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Disable antialiasing for performance
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: false
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x111111, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
    const canvas = renderer.domElement;
    Object.assign(canvas.style, {
      position: "absolute", top: "0", left: "0", width: "100%", height: "100%", zIndex: "1"
    });
    mount.appendChild(canvas);

    // ======= Shader Source =======
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      #define PI 3.141592653589793
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;
      uniform float lowFreq, midFreq, highFreq, kickEnergy, beatPhase, bounceEffect;
      uniform bool isPlaying, enableGrain;
      uniform float transitionFactor, lineStraightness, idleAnimation, idleWaveHeight;
      uniform float baseSpeed, idleSpeed, bassReactivity, midReactivity, highReactivity,
                    kickReactivity, bounceIntensity, waveIntensity, waveComplexity,
                    rippleIntensity, lineThickness, grainIntensity, grainSpeed,
                    grainMean, grainVariance;
      uniform int grainBlendMode;
      uniform vec3 bgColorDown, bgColorUp, color1In, color1Out, color2In, color2Out, color3In, color3Out;
      varying vec2 vUv;
      float squared(float v) { return v * v; }
      float smootherstep(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
      }
      vec3 applyGrain(vec3 color, vec2 uv) {
        if (!enableGrain) return color;
        float t = iTime * grainSpeed;
        float seed = dot(uv, vec2(12.9898, 78.233));
        float noise = fract(sin(seed) * 43758.5453 + t);
        noise = exp(-((noise - grainMean) * (noise - grainMean)) / (2.0 * grainVariance * grainVariance));
        vec3 grain = vec3(noise) * (1.0 - color);
        color += grain * grainIntensity;
        return color;
      }
      float kickRipple(vec2 uv, float energy, float time) {
        float dist = distance(uv, vec2(0.5, 0.5));
        float width = 0.05, speed = 1.2;
        float ripple = smootherstep(energy * speed * time - width, energy * speed * time, dist);
        ripple *= smootherstep(dist, dist + width, energy * speed * time + width);
        float ripple2 = smootherstep(energy * speed * (time - 0.2) - width, energy * speed * (time - 0.2), dist);
        ripple2 *= smootherstep(dist, dist + width, energy * speed * (time - 0.2) + width);
        return (ripple + ripple2 * 0.5) * energy * 0.7;
      }
      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 p = fragCoord.xy / iResolution.xy;
        vec3 bgCol = mix(bgColorDown, bgColorUp, clamp(p.y * 2.0, 0.0, 1.0));
        float speed = mix(idleSpeed, baseSpeed, transitionFactor);
        float ballVisibility = mix(0.8, 0.2, transitionFactor), straightnessFactor = mix(1.0, lineStraightness, transitionFactor);
        float idleWave = idleWaveHeight * sin(p.x * 5.0 + idleAnimation * 0.2);
        float bassPulse = squared(lowFreq) * bassReactivity * transitionFactor;
        float midPulse = squared(midFreq) * midReactivity * transitionFactor;
        float highPulse = squared(highFreq) * highReactivity * transitionFactor;
        float kickPulse = squared(kickEnergy) * kickReactivity * 1.5 * transitionFactor;
        float bounce = bounceEffect * bounceIntensity * transitionFactor;
        float curveIntensity = mix(idleWaveHeight, 0.05 + waveIntensity * (bassPulse + kickPulse * 0.7), transitionFactor);
        float curveSpeed = speed;
        float curve = curveIntensity * sin((6.25 * p.x) + (curveSpeed * iTime));
        float ripple = rippleIntensity * kickRipple(p, kickEnergy, mod(iTime, 10.0)) * transitionFactor;
        float audioWave = mix(0.0, (0.1 * sin(p.x * 20.0 * waveComplexity) * bassPulse +
                               0.08 * sin(p.x * 30.0 * waveComplexity) * midPulse +
                               0.05 * sin(p.x * 50.0 * waveComplexity) * highPulse) / straightnessFactor,
                              transitionFactor);
        float lineAActive = 0.5 + curve + audioWave + (0.01 + 0.05 * bassPulse + 0.1 * kickPulse) / straightnessFactor * sin((40.0 * waveComplexity + 80.0 * bassPulse + 90.0 * kickPulse) * p.x + (-1.5 * speed + 6.0 * bassPulse + 6.0 * kickPulse) * iTime)
                        + bassPulse * 0.3 * sin(p.x * 10.0 - iTime * 2.0) + kickEnergy * 0.3 * sin(15.0 * (p.x - iTime * 0.5)) * transitionFactor - bounce;
        float lineBActive = 0.5 + curve - audioWave + (0.01 + 0.05 * midPulse) / straightnessFactor * sin((50.0 * waveComplexity + 100.0 * midPulse) * p.x + (2.0 * speed + 8.0 * midPulse) * iTime) * sin((2.0 * speed + 8.0 * midPulse) * iTime)
                        + midPulse * 0.2 * sin(p.x * 15.0 - iTime * 1.5) + kickEnergy * 0.1 * sin(p.x * 25.0 - iTime * 3.0) * transitionFactor - bounce * 0.5;
        float lineCActive = 0.5 + curve * 0.7 - audioWave * 0.5 + (0.01 + 0.05 * highPulse) / straightnessFactor * sin((60.0 * waveComplexity + 120.0 * highPulse) * p.x + (2.5 * speed + 10.0 * highPulse) * iTime) * sin((2.5 * speed + 10.0 * highPulse) * (iTime + 0.1))
                          + highPulse * 0.15 * sin(p.x * 20.0 - iTime * 1.0) - bounce * 0.3;
        float lineADist = distance(p.y, lineAActive) * (2.0 / lineThickness), lineBDist = distance(p.y, lineBActive) * (2.0 / lineThickness), lineCDist = distance(p.y, lineCActive) * (2.0 / lineThickness);
        float lineAShape = smootherstep(1.0 - clamp(lineADist, 0.0, 1.0), 1.0, 0.99), lineBShape = smootherstep(1.0 - clamp(lineBDist, 0.0, 1.0), 1.0, 0.99), lineCShape = smootherstep(1.0 - clamp(lineCDist, 0.0, 1.0), 1.0, 0.99);
        vec3 kickColor = vec3(1.0, 0.7, 0.3); 
        vec3 enhancedColor1In = mix(color1In, kickColor, kickEnergy * 0.6 * transitionFactor);
        vec3 enhancedColor1Out = mix(color1Out, vec3(1.0, 0.5, 0.0), kickEnergy * 0.4 * transitionFactor);
        vec3 lineACol = (1.0 - lineAShape) * vec3(mix(enhancedColor1In, enhancedColor1Out, lineAShape));
        vec3 ballACol = (1.0 - smootherstep(1.0 - clamp(distance(p, vec2(0.2, lineAActive)) * (0.5 + 0.4 * bassPulse + kickEnergy * 1.2 * transitionFactor), 0.0, 1.0), 1.0, 0.99))
             * vec3(mix(enhancedColor1In, enhancedColor1Out, lineAShape)) * mix(1.0, ballVisibility, transitionFactor);
        vec3 enhancedColor2In = mix(color2In, vec3(1.0, 0.5, 0.5), kickEnergy * 0.3 * transitionFactor);
        vec3 lineBCol = (1.0 - lineBShape) * vec3(mix(enhancedColor2In, color2Out, lineBShape));
        vec3 ballBCol = (1.0 - smootherstep(1.0 - clamp(distance(p, vec2(0.8, lineBActive)) * (0.5 + 0.4 * highPulse + kickEnergy * 0.3 * transitionFactor), 0.0, 1.0), 1.0, 0.99))
             * vec3(mix(enhancedColor2In, color2Out, lineBShape)) * mix(1.0, ballVisibility, transitionFactor);
        vec3 lineCCol = (1.0 - lineCShape) * vec3(mix(color3In, color3Out, lineCShape));
        vec3 ballCCol = (1.0 - smootherstep(1.0 - clamp(distance(p, vec2(0.5, lineCActive)) * (0.5 + 0.4 * highPulse + kickEnergy * 0.1 * transitionFactor), 0.0, 1.0), 1.0, 0.99))
               * vec3(mix(color3In, color3Out, lineCShape)) * mix(1.0, ballVisibility, transitionFactor);
        bgCol = mix(bgCol, mix(bgCol, vec3(1.0), 0.2), kickEnergy * 0.4 * transitionFactor);
        vec3 rippleCol = vec3(1.0, 0.8, 0.4) * ripple * transitionFactor;
        vec3 fcolor = bgCol + lineACol + lineBCol + lineCCol + ballACol + ballBCol + ballCCol + rippleCol;
        fcolor = applyGrain(fcolor, p);
        fragColor = vec4(fcolor, 1.0);
      }
      void main() {
        vec2 fragCoord = vUv * iResolution;
        vec4 fragColor;
        mainImage(fragColor, fragCoord);
        gl_FragColor = fragColor;
      }
    `;

    // ===== Uniforms and Initial Settings =====
    const uniforms: Record<string, any> = {
      iResolution: { value: new THREE.Vector2(width, height) },
      iTime: { value: 0 }, iMouse: { value: new THREE.Vector2(0.5, 0.5) },
      lowFreq: { value: 0 }, midFreq: { value: 0 }, highFreq: { value: 0 }, kickEnergy: { value: 0 }, beatPhase: { value: 0 }, bounceEffect: { value: 0 },
      isPlaying: { value: false }, transitionFactor: { value: 0 },
      lineStraightness: { value: 2.53 }, idleAnimation: { value: 0 }, idleWaveHeight: { value: 0.01 },
      baseSpeed: { value: 1.0 }, idleSpeed: { value: 0.1 },
      bassReactivity: { value: 0.4 }, midReactivity: { value: 0.5 }, highReactivity: { value: 0.4 },
      kickReactivity: { value: 0.6 }, bounceIntensity: { value: 0.15 },
      waveIntensity: { value: 0.08 }, waveComplexity: { value: 2.2 }, rippleIntensity: { value: 0.25 }, lineThickness: { value: 1.8 },
      enableGrain: { value: true }, grainIntensity: { value: 0.075 }, grainSpeed: { value: 2.0 }, grainMean: { value: 0.0 }, grainVariance: { value: 0.5 }, grainBlendMode: { value: 0 },
      bgColorDown: { value: new THREE.Vector3(40 / 255, 20 / 255, 10 / 255) }, bgColorUp: { value: new THREE.Vector3(20 / 255, 10 / 255, 5 / 255) },
      color1In: { value: new THREE.Vector3(255 / 255, 200 / 255, 0 / 255) }, color1Out: { value: new THREE.Vector3(255 / 255, 100 / 255, 0 / 255) },
      color2In: { value: new THREE.Vector3(255 / 255, 100 / 255, 100 / 255) }, color2Out: { value: new THREE.Vector3(200 / 255, 50 / 255, 50 / 255) },
      color3In: { value: new THREE.Vector3(255 / 255, 150 / 255, 50 / 255) }, color3Out: { value: new THREE.Vector3(200 / 255, 100 / 255, 0 / 255) }
    };

    const shaderMat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMat);
    scene.add(mesh);

    // ======= Audio Setup (Optimized) =======
    let analyserNode: AnalyserNode, source: MediaElementAudioSourceNode, dataArray: Uint8Array;
    const audio = new window.Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = "https://assets.codepen.io/7558/kosikk-slow-motion.ogg";
    audio.loop = true;

    playBtn.onclick = async () => {
      try {
        if (!playing) {
          if (!ctx) {
            ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyser = ctx.createAnalyser();
            analyser.fftSize = 512; // Reduced from 1024 for better performance
            analyser.smoothingTimeConstant = 0.8; // Smooth out audio data
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            source = ctx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(ctx.destination);
          }
          await ctx.resume();
          await audio.play();
          playBtn.textContent = "STOP";
          playing = true;
          uniforms.isPlaying.value = true;
          audioStartedAt = performance.now();
        } else {
          audio.pause();
          playBtn.textContent = "PLAY";
          playing = false;
          uniforms.isPlaying.value = false;
        }
      } catch (error) {
        console.log("Audio playback error (non-critical):", error);
        // Gracefully handle audio errors without breaking the visualization
      }
    };
    input.onchange = (e: any) => {
      try {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          audio.src = url;
          audio.play().catch(() => {});
          if (!playing) playBtn.click();
        }
      } catch (error) {
        console.log("File upload error (non-critical):", error);
      }
    };

    // ===== Animation Loop & Freq Band Analysis =====
    function getAvg(array: Uint8Array, lo: number, hi: number) {
      let sum = 0, n = 0;
      for (let i = lo; i < hi; ++i) { sum += array[i]; ++n; }
      return n ? sum / n / 255 : 0;
    }
    let lastKickTime = 0, kickDetected = false, frameCount = 0;
    const targetFPS = 30; // Reduce from 60fps to 30fps for performance
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = 0;
    let isVisible = true;

    // Performance optimization: pause when not visible
    const handleVisibilityChange = () => {
      try {
        isVisible = !document.hidden;
        if (!isVisible && ctx) {
          ctx.suspend().catch(() => {}); // Pause audio context when tab not visible
        } else if (isVisible && ctx && playing) {
          ctx.resume().catch(() => {}); // Resume when tab becomes visible
        }
      } catch (error) {
        console.log("Visibility change error (non-critical):", error);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    function animate(currentTime: number) {
      animationId = requestAnimationFrame(animate);
      
      // Skip rendering when tab is not visible
      if (!isVisible) return;
      
      // Throttle to target FPS
      if (currentTime - lastFrameTime < frameInterval) return;
      lastFrameTime = currentTime;

      uniforms.iTime.value = (performance.now() - audioStartedAt) / 1000;
      uniforms.idleAnimation.value += 0.01;

      // Only update audio analysis every 3rd frame for performance
      if (playing && analyser && dataArray && frameCount % 3 === 0) {
        analyser.getByteFrequencyData(dataArray);
        uniforms.lowFreq.value = getAvg(dataArray, 0, 4); // Reduced range
        uniforms.midFreq.value = getAvg(dataArray, 4, 16); // Reduced range
        uniforms.highFreq.value = getAvg(dataArray, 16, 64); // Reduced range
        
        // Simplified kick detection
        const currentKick = uniforms.lowFreq.value;
        if (currentKick > 0.5 && !kickDetected) {
          kickDetected = true;
          lastKickTime = performance.now();
          uniforms.kickEnergy.value = currentKick;
        } else if (currentKick < 0.3) {
          kickDetected = false;
        }
        
        // Kick energy decay
        const kickAge = (performance.now() - lastKickTime) / 1000;
        uniforms.kickEnergy.value = Math.max(0, uniforms.kickEnergy.value - kickAge * 2);
        
        // Simplified bounce effect
        uniforms.bounceEffect.value = Math.sin(uniforms.iTime.value * 8) * uniforms.kickEnergy.value * 0.2;
        
        // Transition factor
        uniforms.transitionFactor.value = Math.min(1, uniforms.transitionFactor.value + 0.02);
      } else if (!playing) {
        uniforms.transitionFactor.value = Math.max(0, uniforms.transitionFactor.value - 0.01);
      }

      // FPS counter (less frequent updates)
      frameCount++;
      if (frameCount % 90 === 0) { // Update every 3 seconds at 30fps
        const now = Date.now();
        const fps = Math.round(90000 / (now - lastFpsCheck));
        fpsDiv.textContent = `FPS: ${Math.min(fps, targetFPS)}`;
        lastFpsCheck = now;
      }

      renderer.render(scene, camera);
    }
    animate(0);

    // ===== Cleanup =====
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationId) cancelAnimationFrame(animationId);
      if (ctx) ctx.close();
      if (gui) gui.destroy();
      renderer.dispose();
      geometry.dispose();
      shaderMat.dispose();
      mount.innerHTML = "";
    };
  }, [userName]);

  return <div ref={mountRef} className="w-full h-[700px] relative" />;
}

export { MusicReactiveHero };