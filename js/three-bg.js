import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

/**
 * Three.js Cinematic Tornado Background
 * Features: High-density particles, Bloom, and OBJ focal point
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
        1.8, // strength
        0.5, // radius
        0.1  // threshold
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

    const lineCount = 80;
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
        gl_FragColor = vec4(uColor, fade * zFade * xFade);
      }
    `;

    for (let i = 0; i < lineCount; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(segmentsPerLine * 3);
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.ShaderMaterial({
            vertexShader: lineVertexShader,
            fragmentShader: lineFragmentShader,
            uniforms: { uColor: { value: new THREE.Vector3(0.4, 0.7, 1.0) } },
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
            speed: 0.001 + Math.random() * 0.001,
            length: Math.PI * 3 + Math.random() * Math.PI,
            uOffset: Math.random() * Math.PI * 2,
            rOffset: (Math.random() - 0.2) * 0.1,
        });
    }

    // Particles
    const particleCount = 4000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x66ccff,
        size: 0.002,
        transparent: true,
        opacity: 0.2,
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
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(0, 5, 5);
    scene.add(dirLight);

    let angelModel = null;
    const loader = new OBJLoader();
    loader.load("https://cdn.jsdelivr.net/gh/danielyl123/person/person.obj", (object) => {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        const scale = 0.13 / Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
        object.scale.set(scale, scale, scale);
        object.position.set(0.9, -0.6, 0);
        object.rotation.y = Math.PI / -2;
        object.traverse(c => {
            if (c.isMesh) c.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.8, side: THREE.DoubleSide });
        });
        scene.add(object);
        angelModel = object;
    }, undefined, (e) => console.warn("Model load failed - switching to fallback orbit."));

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
        if (angelModel) angelModel.position.y = -0.55 + Math.sin(time * 2) * 0.01;

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
