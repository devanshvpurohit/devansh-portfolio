const GITHUB_USERNAME = 'devanshvpurohit';

async function fetchGitHubData() {
    try {
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const userData = await userResponse.json();

        // Update Stats
        document.getElementById('repo-count').textContent = userData.public_repos;
        document.getElementById('follower-count').textContent = userData.followers;

        document.getElementById('gh-public-repos').textContent = userData.public_repos;
        document.getElementById('gh-followers').textContent = userData.followers;

        // Update GH Profile Card
        const ghProfile = document.getElementById('gh-profile');
        ghProfile.innerHTML = `
            <img src="${userData.avatar_url}" alt="${userData.name}" class="gh-avatar">
            <div class="gh-info">
                <h3>${userData.name || userData.login}</h3>
                <p class="mono">${userData.bio || 'Building the future.'}</p>
                <div style="margin-top: 1.5rem">
                    <a href="${userData.html_url}" target="_blank" class="secondary-btn" style="padding: 0.8rem 1.5rem; font-size: 0.8rem;">
                        View Profile <i data-lucide="external-link"></i>
                    </a>
                </div>
            </div>
        `;

        // Pinned Repositories (from GitHub profile)
        const pinnedRepoNames = [
            'ideas',
            'ExplainCode',
            'SecureVault',
            'devansh-portfolio',
            'esp32-wheelchair-sim',
            'student-link-blast'
        ];

        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer) {
            projectsContainer.innerHTML = '';

            for (const repoName of pinnedRepoNames) {
                try {
                    const repoResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`);
                    if (!repoResponse.ok) continue;
                    const repo = await repoResponse.json();

                    const card = document.createElement('div');
                    card.className = 'project-card reveal';

                    card.innerHTML = `
                        <div class="project-badge">${repo.language || 'System'}</div>
                        <h3 class="project-title">${repo.name}</h3>
                        <p class="project-description">${repo.description || repo.name}</p>
                        <div class="project-meta">
                            <span><i data-lucide="star"></i> ${repo.stargazers_count}</span>
                            <span><i data-lucide="git-fork"></i> ${repo.forks_count}</span>
                        </div>
                        <div class="project-actions">
                            <a href="${repo.html_url}" target="_blank" class="project-link">
                                <i data-lucide="github"></i> View Code
                            </a>
                            ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="project-link secondary">
                                <i data-lucide="external-link"></i> Live
                            </a>` : ''}
                        </div>
                    `;
                    projectsContainer.appendChild(card);
                } catch (e) {
                    console.warn(`Could not fetch ${repoName}`);
                }
            }
        }

        lucide.createIcons();

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
    }
}

// Custom Cursor
const cursor = document.querySelector('.cursor-glow');
const follower = document.createElement('div');
follower.className = 'cursor-follower';
document.body.appendChild(follower);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    follower.style.display = 'block';
    follower.style.left = e.clientX + 'px';
    follower.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => cursor.style.transform = 'scale(0.8)');
document.addEventListener('mouseup', () => cursor.style.transform = 'scale(1)');

// Navbar Toggle
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 80) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Magnetic effect for buttons (Simple version)
document.querySelectorAll('.primary-btn, .secondary-btn, .btn-icon').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

import * as THREE from "three/webgpu";
import * as tsl from "three/tsl";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // Not needed if not using

// --- Background Logic (Three.js WebGPU) ---
async function initBackground() {
    // load fonts
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
    document.querySelector('.background-container').appendChild(renderer.domElement);

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

        // Mouse reactivity integration
        const mouseDist = tsl.distance(tsl.screenUV, mouse).toVar();
        const mouseInfluence = tsl.smoothstep(0.0, 0.5, mouseDist).oneMinus().mul(0.5);

        const nVal = tsl.mx_noise_float(tsl.vec3(uvMain, t.mul(0.08).add(mouseInfluence))).toVar();
        const fw = tsl.fwidth(nVal).toVar();
        nVal.assign(nVal.mul(15).fract().sub(0.5).abs());
        const f = tsl.smoothstep(fw.mul(5), fw.mul(30), nVal).oneMinus().toVar();

        // texture
        const texUV = tsl.screenUV
            .sub(0.5)
            .mul(tsl.vec2(uvRatio, 4))
            .add(0.5).toVar();
        const texVal = tsl.texture(texWriting, texUV).toVar();

        f.assign(tsl.max(f, texVal.r));

        // Flip: White background (1, 1, 1), Gold lines (0.77, 0.63, 0.35)
        const goldColor = tsl.vec3(0.77, 0.63, 0.35);
        const col = tsl.mix(tsl.vec3(1, 1, 1), goldColor, f).toVar();

        return col;
    })();

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

initBackground();
fetchGitHubData();
