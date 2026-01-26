import * as THREE from "three/webgpu";
import * as tsl from "three/tsl";

/**
 * Three.js WebGPU Background
 * Lazy-loaded only on the Home page
 */
export async function initBackground() {
    const container = document.querySelector('.background-container');
    if (!container) return;

    // Load custom fonts for text in background
    await (async function () {
        async function loadFont(fontface) {
            await fontface.load();
            document.fonts.add(fontface);
        }
        let fonts = [
            new FontFace(
                "Tourney",
                "url(https://fonts.gstatic.com/s/tourney/v16/AlZv_ztDtYzv1tzq1wcJnbVt7xseomk-tPE3gk0.woff2) format('woff2')"
            )
        ];
        for (let font of fonts) {
            await loadFont(font);
        }
    })();

    const texWriting = (() => {
        const c = document.createElement("canvas");
        c.width = 1024;
        c.height = 256;
        const ctx = c.getContext("2d");
        const u = val => val * 0.01 * c.height;

        ctx.font = `bold ${u(45)}px Tourney`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";
        ctx.fillText("ENGINEERING EXCELLENCE", c.width * 0.5, c.height * 0.5);

        const tex = new THREE.CanvasTexture(c);
        tex.flipY = false;
        tex.colorSpace = "srgb";
        tex.anisotropy = 16;

        return tex;
    })();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 0, 1).setLength(10);

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

    scene.backgroundNode = tsl.Fn(([t = tsl.time]) => {
        const uvRatio = tsl.screenSize.x.div(tsl.screenSize.y).toVar();
        const uvMain = tsl.screenUV.mul(tsl.vec2(uvRatio, 1.)).mul(3).toVar();

        const mouseDist = tsl.distance(tsl.screenUV, mouse).toVar();
        const mouseInfluence = tsl.smoothstep(0.0, 0.5, mouseDist).oneMinus().mul(0.5);

        const nVal = tsl.mx_noise_float(tsl.vec3(uvMain, t.mul(0.08).add(mouseInfluence))).toVar();
        const fw = tsl.fwidth(nVal).toVar();
        nVal.assign(nVal.mul(15).fract().sub(0.5).abs());
        const f = tsl.smoothstep(fw.mul(5), fw.mul(30), nVal).oneMinus().toVar();

        const texUV = tsl.screenUV
            .sub(0.5)
            .mul(tsl.vec2(uvRatio, 4))
            .add(0.5).toVar();
        const texVal = tsl.texture(texWriting, texUV).toVar();

        f.assign(tsl.max(f, texVal.r));

        const goldColor = tsl.vec3(0.77, 0.63, 0.35);
        const col = tsl.mix(tsl.vec3(1, 1, 1), goldColor, f).toVar();

        return col;
    })();

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
