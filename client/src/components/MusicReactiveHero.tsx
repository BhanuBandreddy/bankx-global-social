import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GUI } from "dat.gui";

type Props = {
  userName: string;
};

export const MusicReactiveHero: React.FC<Props> = ({ userName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threeRefs = useRef<any>({});

  useEffect(() => {
    const container = containerRef.current!;
    container.innerHTML = "";

    // Create headline & controls overlay
    const headline = document.createElement("div");
    headline.textContent = userName;
    headline.style.position = "absolute";
    headline.style.top = "3rem";
    headline.style.width = "100%";
    headline.style.textAlign = "center";
    headline.style.fontSize = "5vw";
    headline.style.fontWeight = "bold";
    headline.style.letterSpacing = "-.03em";
    headline.style.color = "#fff";
    headline.style.textShadow = "0 2px 16px #000";
    headline.style.zIndex = "30";
    headline.style.fontFamily = "Bebas Neue, sans-serif";
    container.appendChild(headline);

    const controlsDiv = document.createElement("div");
    controlsDiv.style.position = "absolute";
    controlsDiv.style.top = "7rem";
    controlsDiv.style.width = "100%";
    controlsDiv.style.display = "flex";
    controlsDiv.style.justifyContent = "center";
    controlsDiv.style.alignItems = "center";
    controlsDiv.style.zIndex = "31";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "audio/*";
    fileInput.style.display = "none";
    fileInputRef.current = fileInput;

    const uploadLabel = document.createElement("label");
    uploadLabel.textContent = "Upload your song";
    uploadLabel.style.background = "#fff";
    uploadLabel.style.color = "#000";
    uploadLabel.style.fontWeight = "bold";
    uploadLabel.style.padding = "0.7em 2em";
    uploadLabel.style.borderRadius = "1em";
    uploadLabel.style.cursor = "pointer";
    uploadLabel.style.boxShadow = "0 1px 8px #2228";
    uploadLabel.style.fontFamily = "Roboto Mono, monospace";

    uploadLabel.appendChild(fileInput);
    controlsDiv.appendChild(uploadLabel);
    container.appendChild(controlsDiv);

    // Container styles
    container.style.position = "relative";
    container.style.width = "100vw";
    container.style.height = "700px";
    container.style.overflow = "hidden";
    container.style.background = "#111";

    // Vertex shader
    const vertexShaderSource = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment shader with music reactive visuals
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float audioData[128];
      uniform float audioVolume;
      varying vec2 vUv;

      float hash(float n) {
        return fract(sin(n) * 43758.5453);
      }

      float noise(vec2 x) {
        vec2 p = floor(x);
        vec2 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        float n = p.x + p.y * 57.0;
        return mix(
          mix(hash(n + 0.0), hash(n + 1.0), f.x),
          mix(hash(n + 57.0), hash(n + 58.0), f.x),
          f.y
        );
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / iResolution.xy;
        uv.x *= iResolution.x / iResolution.y;
        
        // Get audio data
        float bass = (audioData[1] + audioData[2] + audioData[3]) / 3.0;
        float mid = (audioData[32] + audioData[48] + audioData[64]) / 3.0;
        float treble = (audioData[96] + audioData[112] + audioData[127]) / 3.0;
        
        // Time with audio influence
        float t = iTime + bass * 0.5;
        
        // Create reactive waves
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);
        
        // Multiple wave layers influenced by audio
        float wave1 = sin(dist * 20.0 - t * 2.0 + bass * 10.0) * 0.1;
        float wave2 = cos(dist * 15.0 - t * 1.5 + mid * 8.0) * 0.15;
        float wave3 = sin(dist * 10.0 - t * 3.0 + treble * 12.0) * 0.08;
        
        float waves = wave1 + wave2 + wave3;
        
        // Color based on audio frequency response
        vec3 color = vec3(0.0);
        color.r = 0.5 + 0.5 * sin(waves + bass * 5.0);
        color.g = 0.3 + 0.7 * cos(waves + mid * 3.0);
        color.b = 0.8 + 0.2 * sin(waves + treble * 7.0);
        
        // Add some noise for texture
        float n = noise(uv * 100.0 + t);
        color += n * 0.1;
        
        // Pulsing effect based on volume
        color *= 0.8 + audioVolume * 0.4;
        
        // Vignette effect
        float vignette = smoothstep(0.8, 0.2, dist);
        color *= vignette;
        
        fragColor = vec4(color, 1.0);
      }

      void main() {
        vec2 fragCoord = vUv * iResolution;
        vec4 fragColor;
        mainImage(fragColor, fragCoord);
        gl_FragColor = fragColor;
      }
    `;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x111111, 1);
    container.appendChild(renderer.domElement);

    // Uniforms for the shader
    const audioDataArray = new Float32Array(128);
    const uniforms = {
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(container.offsetWidth, container.offsetHeight) },
      audioData: { value: audioDataArray },
      audioVolume: { value: 0.0 }
    };

    // Create material and mesh
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Audio setup
    let audioElement = new Audio();
    audioRef.current = audioElement;
    audioElement.crossOrigin = "anonymous";
    audioElement.preload = "auto";
    audioElement.loop = true;
    
    // Audio context and analyzer
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    let dataArray: Uint8Array | null = null;

    const initAudio = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
    };

    // Default audio
    audioElement.src = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";

    // File upload handler
    fileInput.onchange = (ev) => {
      const files = fileInput.files;
      if (files && files.length > 0) {
        const objectURL = URL.createObjectURL(files[0]);
        audioElement.src = objectURL;
        audioElement.currentTime = 0;
        initAudio();
        audioElement.play().catch(console.error);
      }
    };

    // Click to start audio
    const startButton = document.createElement("button");
    startButton.textContent = "▶ Start Audio";
    startButton.style.position = "absolute";
    startButton.style.bottom = "2rem";
    startButton.style.left = "50%";
    startButton.style.transform = "translateX(-50%)";
    startButton.style.background = "#00FF88";
    startButton.style.color = "#000";
    startButton.style.border = "4px solid #000";
    startButton.style.padding = "12px 24px";
    startButton.style.fontWeight = "bold";
    startButton.style.cursor = "pointer";
    startButton.style.fontFamily = "Roboto Mono, monospace";
    startButton.style.zIndex = "32";

    startButton.onclick = () => {
      initAudio();
      audioElement.play().catch(console.error);
      startButton.style.display = "none";
    };

    container.appendChild(startButton);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update time
      uniforms.iTime.value += 0.016;

      // Update audio data
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        
        // Map to 128 values for shader
        for (let i = 0; i < 128; i++) {
          audioDataArray[i] = dataArray[i] / 255.0;
        }
        
        // Calculate volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        uniforms.audioVolume.value = (sum / dataArray.length) / 255.0;
      }

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Store refs for cleanup
    threeRefs.current = {
      renderer,
      scene,
      audioElement,
      audioContext,
      handleResize
    };

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      
      if (audioContext) {
        audioContext.close();
      }
      
      container.innerHTML = "";
    };
  }, [userName]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[700px] relative"
      style={{ minHeight: "700px", background: "#111" }}
    />
  );
};