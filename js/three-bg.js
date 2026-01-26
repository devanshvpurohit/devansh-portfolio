import * as THREE from "three/webgpu";
import * as tsl from "three/tsl";

/**
 * Three.js WebGPU Background: Engineering Blueprint
 * A sophisticated, mathematical grid system
 */
export async function initBackground() {
    if (window.innerWidth <= 768) return;

    const container = document.querySelector('.background-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2;

    const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const mouse = tsl.uniform(tsl.vec2(0.5, 0.5));
    window.addEventListener("mousemove", (e) => {
        mouse.value.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Blueprint Grid Shader
    const blueprintNode = tsl.Fn(() => {
        const uvMain = tsl.screenUV.toVar();
        const ratio = tsl.screenSize.x.div(tsl.screenSize.y);
        const uv = uvMain.mul(tsl.vec2(ratio, 1.0)).mul(10.0).toVar(); // Grid scale

        // Main Grid Lines
        const gridLines = tsl.abs(tsl.fract(uv.sub(0.5)).sub(0.5)).div(tsl.fwidth(uv)).toVar();
        const line = tsl.min(gridLines.x, gridLines.y).smoothstep(0.0, 1.0).oneMinus();

        // Sub-Dots at intersections
        const dots = tsl.length(tsl.fract(uv).sub(0.5)).smoothstep(0.03, 0.01).mul(0.3);

        // Circular Mouse HUD
        const dist = tsl.distance(tsl.screenUV, mouse).toVar();
        const ring = tsl.abs(dist.sub(0.15)).smoothstep(0.005, 0.0).mul(0.1);
        const glow = tsl.smoothstep(0.3, 0.0, dist).mul(0.05);

        // Colors
        const baseColor = tsl.vec3(0.98, 0.98, 0.98); // Matches --bg
        const gridColor = tsl.vec3(0.1, 0.1, 0.1).mul(line.mul(0.05)); // Subtle Lines
        const dotColor = tsl.vec3(0.72, 0.59, 0.31).mul(dots); // Refined Gold Dots

        return baseColor.add(gridColor).add(dotColor).add(tsl.vec3(0.72, 0.59, 0.31).mul(ring.add(glow)));
    })();

    scene.backgroundNode = blueprintNode;

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
