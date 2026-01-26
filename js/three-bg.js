import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/**
 * Three.js Cinematic Gold Tornado Background
 * Features: High-density gold particles, Bloom Post-Processing
 */
export async function initBackground() {
    if (window.innerWidth <= 768) return;

    const container = document.querySelector('.background-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(1.2, -0.5, -0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;

    // Post Processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5, // strength (Reduced from 2.2)
        0.5, // radius
        0.2  // threshold
    );
    composer.addPass(bloomPass);

    const R = 0.9;
    const r = 0.8;

    const clippingPlanes = [
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 1),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), 1),
        new THREE.Plane(new THREE.Vector3(1, 0, 0), 1),
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1)
    ];

    const lineCount = 60; // Reduced count for subtlety
    const segmentsPerLine = 1000;
    const spiralRevolutions = 0.4;
    const tornadoGroup = new THREE.Group();
    scene.add(tornadoGroup);

    const linesData = [];

    function getTorusPoint(u, v, target, rOffset = 0) {
        const effectiveR = r + rOffset;
        const x = (R + effectiveR * Math.cos(v)) * Math.cos(u);
        const y = (R + effectiveR * Math.cos(v)) * Math.sin(u);
        const z = effectiveR * Math.sin(v);
        target.set(x, y, z);
    }

    const lineVertexShader = `
      varying vec3 vPosition;
      varying float vDistanceFromCenter;
      void main() {
        vPosition = position;
        vDistanceFromCenter = length(position.xz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const lineFragmentShader = `
      uniform vec3 uColor;
      varying vec3 vPosition;
      varying float vDistanceFromCenter;
      void main() {
        float fade = 1.0 - smoothstep(0.6, 0.9, vDistanceFromCenter / 0.9);
        float zFade = 1.0 - smoothstep(0.4, 0.8, abs(vPosition.z));
        float xFade = 1.0 - smoothstep(0.4, 0.8, abs(vPosition.x));
        // Multiplied by 0.2 for subtle transparency
        gl_FragColor = vec4(uColor, fade * zFade * xFade * 0.2); 
      }
    `;

    // Gold Theme Vector (Radiant Gold #D4AF37)
    const goldColorVec = new THREE.Vector3(0.83, 0.69, 0.22);

    for (let i = 0; i < lineCount; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(segmentsPerLine * 3);
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.ShaderMaterial({
            vertexShader: lineVertexShader,
            fragmentShader: lineFragmentShader,
            uniforms: { uColor: { value: goldColorVec } },
            transparent: true,
            blending: THREE.AdditiveBlending,
            clippingPlanes: clippingPlanes,
            depthWrite: false,
        });

        const line = new THREE.Line(geometry, material);
        tornadoGroup.add(line);

        linesData.push({
            line, positions,
            phaseOffset: Math.random() * Math.PI * 2,
            speed: 0.0005 + Math.random() * 0.0005, // Slower speed
            length: Math.PI * 3 + Math.random() * Math.PI,
            uOffset: Math.random() * Math.PI * 2,
            rOffset: (Math.random() - 0.2) * 0.1,
        });
    }

    // Particles
    const particleCount = 3000; // Reduced count
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xD4AF37,
        size: 0.002,
        transparent: true,
        opacity: 0.12, // Reduced opacity
        blending: THREE.AdditiveBlending,
        clippingPlanes: clippingPlanes,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    tornadoGroup.add(particles);

    const particlesData = [];
    for (let i = 0; i < particleCount; i++) {
        particlesData.push({
            uOffset: Math.random() * Math.PI * 2,
            phaseOffset: Math.random() * Math.PI * 2,
            speed: 0.0001 - Math.random() * 0.001,
            radiusOffset: (Math.random() - 0.1) * 0.2,
        });
    }

    tornadoGroup.rotation.x = Math.PI / 2;
    tornadoGroup.rotation.y = THREE.MathUtils.degToRad(18);

    scene.add(new THREE.AmbientLight(0x404040));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(0, 5, 5);
    scene.add(dirLight);

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.001;

        linesData.forEach((data) => {
            data.uOffset += data.speed;
            const tempVec = new THREE.Vector3();
            for (let j = 0; j < segmentsPerLine; j++) {
                const t = j / (segmentsPerLine - 1);
                const currentU = data.uOffset - t * data.length;
                const currentV = currentU * spiralRevolutions + data.phaseOffset + time * 0.4;
                getTorusPoint(currentU, currentV, tempVec, data.rOffset);
                data.positions[j * 3] = tempVec.x;
                data.positions[j * 3 + 1] = tempVec.y;
                data.positions[j * 3 + 2] = tempVec.z;
            }
            data.line.geometry.attributes.position.needsUpdate = true;
        });

        const pPositions = particlesGeometry.attributes.position.array;
        particlesData.forEach((data, i) => {
            data.uOffset += data.speed;
            const currentU = data.uOffset;
            const currentV = currentU * spiralRevolutions + data.phaseOffset + time * 0.2;
            const effectiveR = r + data.radiusOffset;
            pPositions[i * 3] = (R + effectiveR * Math.cos(currentV)) * Math.cos(currentU);
            pPositions[i * 3 + 1] = (R + effectiveR * Math.cos(currentV)) * Math.sin(currentU);
            pPositions[i * 3 + 2] = effectiveR * Math.sin(currentV);
        });
        particlesGeometry.attributes.position.needsUpdate = true;

        controls.update();
        composer.render();
    }

    window.addEventListener("resize", () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
    });

    animate();
}
