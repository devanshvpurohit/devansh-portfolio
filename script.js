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

        // Fetch Repos - Limited to 10 starting ones
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=created&direction=asc&per_page=10`);
        const reposData = await reposResponse.json();

        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer) {
            projectsContainer.innerHTML = '';
            reposData.forEach(repo => {
                if (repo.name === GITHUB_USERNAME) return;

                const card = document.createElement('div');
                card.className = 'project-card reveal';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.height = '100%';

                card.innerHTML = `
                    <div class="project-header">
                        <span class="project-category mono" style="font-size: 0.7rem;">${repo.language || 'Software'}</span>
                        <h3 class="project-name" style="font-size: 1.4rem;">${repo.name}</h3>
                    </div>
                    <p class="project-desc" style="font-size: 0.9rem;">${repo.name}</p>
                    <div class="project-actions" style="margin-top: auto;">
                        <a href="${repo.html_url}" target="_blank" class="btn-icon">
                            <i data-lucide="github"></i>
                        </a>
                        ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" class="btn-icon">
                            <i data-lucide="external-link"></i>
                        </a>` : ''}
                    </div>
                `;
                projectsContainer.appendChild(card);
            });
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

// --- Harmonic Mandala Background (p5.js) ---
let particles = [];
let energyArcs = [];
let hexConnectionPoints = [];
let arcConnectionPoints = [];
const GOLD_COLOR = [197, 160, 89]; // Our theme gold

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.id('bg-canvas');
    background(0);
    angleMode(RADIANS);

    // Position it correctly
    canvas.style('position', 'fixed');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-2');
}

function draw() {
    background(0, 20); // Maintain trails
    translate(width / 2, height / 2);

    const time = frameCount * 0.008;
    const baseRadius = min(width, height) / 2.2;

    hexConnectionPoints = [];
    arcConnectionPoints = [];

    drawPulsingBackgroundWaves(time, baseRadius);
    drawOuterOrbitalRings(time, baseRadius);
    drawRotatingSegmentedArcs(time, baseRadius);
    drawFibonacciSpiralParticles(time, baseRadius);
    drawCounterRotatingSquares(time, baseRadius);
    drawMidLayerHexagonalStructure(time, baseRadius);
    drawRadialFlowingLines(time, baseRadius);
    drawInnerRotatingMechanism(time, baseRadius);
    drawCentralMandalaFlower(time, baseRadius);
    drawAtmosphericInterferenceRings(time, baseRadius);

    updateAndDrawParticles();
    updateAndDrawEnergyArcs();

    if (random(1) < 0.05 && hexConnectionPoints.length > 0 && arcConnectionPoints.length > 0) {
        let p1 = random(hexConnectionPoints);
        let p2 = random(arcConnectionPoints);
        energyArcs.push(new EnergyArc(p1, p2));
    }
}

function drawPulsingBackgroundWaves(time, baseRadius) {
    for (let i = 0; i < 3; i++) {
        const pulseTime = time * 0.5 + i * PI;
        const r = pow(sin(pulseTime % PI), 2) * baseRadius * 2.5;
        const alpha = pow(cos(pulseTime % PI), 4) * 5;
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], alpha);
        strokeWeight(2);
        circle(0, 0, r);
    }
}

function drawOuterOrbitalRings(time, baseRadius) {
    push();
    rotate(time * 0.1);
    for (let i = 0; i < 4; i++) {
        const ringRadius = baseRadius * 0.95 + i * (baseRadius * 0.08);
        const segments = 150;
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 25 - i * 4);
        strokeWeight(0.7);
        beginShape();
        for (let j = 0; j <= segments; j++) {
            const angle = map(j, 0, segments, 0, TWO_PI);
            const wave1 = sin(angle * 10 + time * 2.5 + i) * (baseRadius * 0.03);
            const wave2 = cos(angle * 5 - time * 3.5) * (baseRadius * 0.025);
            const wave3 = sin(angle * 20 + time * 1.5) * (baseRadius * 0.015);
            const r = ringRadius + wave1 + wave2 + wave3;
            vertex(cos(angle) * r, sin(angle) * r);
        }
        endShape(CLOSE);
    }
    pop();
}

function drawRotatingSegmentedArcs(time, baseRadius) {
    for (let seg = 0; seg < 10; seg++) {
        const segAngle = (seg / 10) * TWO_PI;
        const rotation = segAngle + time * 0.15;
        push();
        rotate(rotation);
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 40);
        strokeWeight(1.2);
        beginShape();
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const angle = t * (TWO_PI / 10) - PI / 20;
            const distance = baseRadius * 0.8 + sin(t * PI * 4 + time * 2) * (baseRadius * 0.07);
            vertex(cos(angle) * distance, sin(angle) * distance);
        }
        endShape();
        const endDist = baseRadius * 0.8 + sin(time * 2) * (baseRadius * 0.07);
        const endAngle = (TWO_PI / 10) - (PI / 20);
        const p = createVector(cos(endAngle) * endDist, sin(endAngle) * endDist);

        const worldX = p.x * cos(rotation) - p.y * sin(rotation);
        const worldY = p.x * sin(rotation) + p.y * cos(rotation);
        arcConnectionPoints.push(createVector(worldX, worldY));

        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 90);
        strokeWeight(3.5);
        point(p.x, p.y);
        pop();
    }
}

function drawFibonacciSpiralParticles(time, baseRadius) {
    const goldenAngle = PI * (3 - sqrt(5));
    for (let i = 0; i < 250; i++) {
        const angle = i * goldenAngle + time * 0.4;
        const radius = sqrt(i) * (baseRadius * 0.025);
        if (radius > baseRadius * 0.15 && radius < baseRadius * 0.75) {
            const x = cos(angle) * radius;
            const y = sin(angle) * radius;
            const size = map(sin(i * 0.1 + time), -1, 1, 0.5, 3.5);
            const alpha = map(radius, baseRadius * 0.15, baseRadius * 0.75, 100, 15);
            stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], alpha);
            strokeWeight(size);
            point(x, y);
        }
    }
}

function drawCounterRotatingSquares(time, baseRadius) {
    push();
    rotate(-time * 0.08);
    let previousVertices = null;

    for (let i = 0; i < 4; i++) {
        push();
        const r = baseRadius * (0.6 - i * 0.08);
        const rotation = time * 0.1 * (i + 1);
        rotate(rotation);

        let currentVertices = [];
        for (let j = 0; j < 4; j++) {
            const angle = PI / 4 + j * PI / 2;
            currentVertices.push(createVector(cos(angle) * r * 0.707, sin(angle) * r * 0.707));
        }

        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 30 - i * 5);
        strokeWeight(1.5 - i * 0.3);
        noFill();
        beginShape();
        for (const v of currentVertices) { vertex(v.x, v.y); }
        endShape(CLOSE);

        if (previousVertices) {
            stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 15 - i * 3);
            strokeWeight(0.5);
            for (let j = 0; j < 4; j++) {
                line(previousVertices[j].x, previousVertices[j].y, currentVertices[j].x, currentVertices[j].y);
            }
        }
        pop();

        let worldVertices = [];
        for (const v of currentVertices) {
            const worldX = v.x * cos(rotation) - v.y * sin(rotation);
            const worldY = v.x * sin(rotation) + v.y * cos(rotation);
            worldVertices.push(createVector(worldX, worldY));
        }
        previousVertices = worldVertices;
    }
    pop();
}

function drawMidLayerHexagonalStructure(time, baseRadius) {
    push();
    const rotation = time * 0.12;
    rotate(rotation);
    for (let hexLayer = 0; hexLayer < 3; hexLayer++) {
        const hexRadius = baseRadius * 0.55 - hexLayer * (baseRadius * 0.11);
        const pulse = sin(time * 2.5 + hexLayer * 0.7) * (baseRadius * 0.015);
        let vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * TWO_PI;
            const modulation = cos(angle * 6 - time * 1.5) * (baseRadius * 0.025);
            const r = hexRadius + pulse + modulation;
            vertices.push(createVector(cos(angle) * r, sin(angle) * r));
        }
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 80 - hexLayer * 15);
        strokeWeight(2 - hexLayer * 0.4);
        beginShape();
        for (const v of vertices) { vertex(v.x, v.y); }
        endShape(CLOSE);

        if (hexLayer === 0) {
            for (let i = 0; i < vertices.length; i++) {
                let p = vertices[i];
                let worldX = p.x * cos(rotation) - p.y * sin(rotation);
                let worldY = p.x * sin(rotation) + p.y * cos(rotation);
                hexConnectionPoints.push(createVector(worldX, worldY));

                if (frameCount % 6 === 0) {
                    let angle = atan2(worldY, worldX);
                    let velocity = p5.Vector.fromAngle(angle, random(1, 2));
                    particles.push(new Particle(worldX, worldY, velocity));
                }
            }
        }
    }
    pop();
}

function drawRadialFlowingLines(time, baseRadius) {
    const numRays = 36;
    for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * TWO_PI;
        push();
        rotate(angle + time * 0.2);
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 15);
        strokeWeight(0.8);
        beginShape();
        for (let d = baseRadius * 0.075; d < baseRadius * 0.5; d += 2) {
            const wave = sin(d * 0.1 + time * 4.5) * (baseRadius * 0.018);
            const flow = cos(d * 0.05 - time * 2.5) * (baseRadius * 0.012);
            vertex(wave + flow, d);
        }
        endShape();
        pop();
    }
}

function drawInnerRotatingMechanism(time, baseRadius) {
    push();
    rotate(-time * 0.25);
    const innerSides = 12;
    for (let layer = 0; layer < 5; layer++) {
        const innerRadius = baseRadius * 0.28 - layer * (baseRadius * 0.05);
        const breathe = sin(time * 3 + layer * 0.8) * (baseRadius * 0.01);
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 90 - layer * 15);
        strokeWeight(1.5 - layer * 0.3);
        beginShape();
        for (let i = 0; i <= innerSides; i++) {
            const angle = (i / innerSides) * TWO_PI;
            const modulation = sin(angle * (5 + layer) + time * 2.2) * (baseRadius * 0.018);
            const r = innerRadius + breathe + modulation;
            vertex(cos(angle) * r, sin(angle) * r);
        }
        endShape();
    }
    pop();
}

function drawCentralMandalaFlower(time, baseRadius) {
    push();
    rotate(time * 0.35);
    const coreRadius = baseRadius * 0.12;

    const bladeCount = 12;
    for (let i = 0; i < bladeCount; i++) {
        const angle = i / bladeCount * TWO_PI;
        const openness = sin(time * 2 + PI) * 0.5 + 0.5;
        const bladeLength = coreRadius * (1.2 + sin(time * 2.5) * 0.2);
        const bladeStart = coreRadius * 0.5;
        const bladeWidth = PI / bladeCount * 1.5;

        push();
        rotate(angle);
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 100);
        strokeWeight(1);
        line(0, bladeStart, 0, bladeLength * openness);
        pop();
    }

    for (let layer = 0; layer < 4; layer++) {
        const layerRadius = coreRadius - layer * (baseRadius * 0.02);
        const pulse = sin(time * 3.5 + layer * 0.5) * (baseRadius * 0.005);
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 150 - layer * 25);
        strokeWeight(2.2 - layer * 0.4);
        circle(0, 0, (layerRadius + pulse) * 2);
    }
    stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 220);
    strokeWeight(6);
    point(0, 0);
    pop();
}

function drawAtmosphericInterferenceRings(time, baseRadius) {
    for (let r = 0; r < 15; r++) {
        const ringRadius = baseRadius * 0.15 + r * (baseRadius * 0.065);
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], 8);
        strokeWeight(0.5);
        beginShape();
        for (let i = 0; i <= 240; i++) {
            const angle = map(i, 0, 240, 0, TWO_PI);
            const wave1 = sin(angle * 18 + time * 1.2 + r * 0.3) * (baseRadius * 0.008);
            const wave2 = cos(angle * 9 - time * 1.8 + r * 0.5) * (baseRadius * 0.006);
            const finalRadius = ringRadius + wave1 + wave2;
            vertex(cos(angle) * finalRadius, sin(angle) * finalRadius);
        }
        endShape(CLOSE);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Particle {
    constructor(x, y, velocity) {
        this.pos = createVector(x, y);
        this.vel = velocity;
        this.lifespan = 100;
    }
    update() {
        let perpendicular = createVector(-this.pos.y, this.pos.x);
        perpendicular.normalize();
        perpendicular.mult(0.05);
        this.vel.add(perpendicular);
        this.vel.mult(0.99);
        this.pos.add(this.vel);
        this.lifespan -= 2.5;
    }
    display() {
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], this.lifespan);
        strokeWeight(2);
        point(this.pos.x, this.pos.y);
    }
    isDead() { return this.lifespan < 0; }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

class EnergyArc {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.lifespan = 50;
        this.maxLifespan = 50;
    }
    update() { this.lifespan -= 2; }
    display() {
        const alpha = map(this.lifespan, 0, this.maxLifespan, 0, 150);
        const sw = map(this.lifespan, 0, this.maxLifespan, 0, 2);
        noFill();
        stroke(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2], alpha);
        strokeWeight(sw);
        const mid = p5.Vector.lerp(this.start, this.end, 0.5);
        const dist = this.start.dist(this.end);
        const normal = createVector(-(this.end.y - this.start.y), this.end.x - this.start.x);
        normal.normalize();
        normal.mult(dist * 0.2);
        const controlPoint = p5.Vector.add(mid, normal);

        beginShape();
        vertex(this.start.x, this.start.y);
        quadraticVertex(controlPoint.x, controlPoint.y, this.end.x, this.end.y);
        endShape();
    }
    isDead() { return this.lifespan < 0; }
}

function updateAndDrawEnergyArcs() {
    for (let i = energyArcs.length - 1; i >= 0; i--) {
        energyArcs[i].update();
        energyArcs[i].display();
        if (energyArcs[i].isDead()) {
            energyArcs.splice(i, 1);
        }
    }
}

fetchGitHubData();
