const GITHUB_USER = 'devanshvpurohit';

document.addEventListener('DOMContentLoaded', async () => {
    injectSharedComponents();
    initScrollEffects();
    initMagneticEffects();
    injectAvatar();
});

/**
 * Universally Injects GitHub Avatar into elements with 'gh-pfp-inject' class
 */
async function injectAvatar() {
    const avatarUrl = `https://avatars.githubusercontent.com/${GITHUB_USER}`;
    document.querySelectorAll('.gh-pfp-inject').forEach(img => {
        img.src = avatarUrl;
    });
}

const isMobile = window.innerWidth <= 768;

/**
 * Satisfying Magnetic Physics for interactive elements
 */
function initMagneticEffects() {
    if (isMobile) return; // Disable for performance on mobile

    const magneticElements = document.querySelectorAll('.btn, .logo, .social-link, .card');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // ADHD Satisfaction - Dynamic movement based on element size
            const strength = el.classList.contains('card') ? 10 : 25;

            el.style.transform = `translate(${x / strength}px, ${y / strength}px) scale(1.02)`;
            if (el.classList.contains('card')) {
                el.style.transform += ` rotateX(${-y / 15}deg) rotateY(${x / 15}deg)`;
            }
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

/**
 * Injects Navbar and Footer into the DOM
 */
function injectSharedComponents() {
    const isRoot = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    const pathPrefix = isRoot ? 'pages/' : '';

    const navbarHTML = `
        <div id="scroll-progress"></div>
        <nav class="navbar" id="navbar">
            <div class="container nav-content">
                <a href="${isRoot ? '#' : '/'}" class="logo">DVP<span>.</span></a>
                <ul class="nav-links">
                    <li><a href="${isRoot ? '#' : '/'}" class="nav-link" data-page="home">Home</a></li>
                    <li><a href="${isRoot ? 'pages/about.html' : 'about.html'}" class="nav-link" data-page="about">About</a></li>
                    <li><a href="${isRoot ? 'pages/projects.html' : 'projects.html'}" class="nav-link" data-page="projects">Projects</a></li>
                    <li><a href="${isRoot ? 'pages/open-source.html' : 'open-source.html'}" class="nav-link" data-page="os">Open Source</a></li>
                    <li><a href="${isRoot ? 'assets/pdf/resume.pdf' : '../assets/pdf/resume.pdf'}" target="_blank" class="nav-link">Resume</a></li>
                    <li><a href="${isRoot ? 'pages/contact.html' : 'contact.html'}" class="nav-btn">Contact</a></li>
                </ul>
                <div class="menu-toggle" id="menu-toggle">
                    <i data-lucide="menu"></i>
                </div>
            </div>
        </nav>
    `;

    const footerHTML = `
        <footer>
            <div class="container">
                <div class="footer-content">
                    <div class="footer-info">
                        <a href="/" class="logo">DVP<span>.</span></a>
                        <p>ADHD Computer Science Student specializing in AI architectures and low-level system engineering.</p>
                    </div>
                    <div class="footer-links">
                        <div class="social-links">
                            <a href="https://github.com/devanshvpurohit" target="_blank" class="social-link"><i data-lucide="github"></i></a>
                            <a href="#" class="social-link"><i data-lucide="linkedin"></i></a>
                            <a href="#" class="social-link"><i data-lucide="twitter"></i></a>
                        </div>
                    </div>
                </div>
                <div class="copyright">
                    <p>&copy; ${new Date().getFullYear()} Devansh. Built with precision.</p>
                </div>
            </div>
        </footer>
    `;

    // Prepend/Append only if they don't exist
    if (!document.getElementById('navbar')) {
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    }
    if (!document.querySelector('footer')) {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // Initialize Lucide icons after injection
    if (window.lucide) {
        window.lucide.createIcons();
    }

    highlightActiveNavLink();
}

/**
 * Highlights the active link based on current path
 */
function highlightActiveNavLink() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        if (path === '/' || path.endsWith('index.html')) {
            if (link.dataset.page === 'home') link.classList.add('active');
        } else if (path.includes(link.getAttribute('href').replace('..', ''))) {
            link.classList.add('active');
        }
    });
}

/**
 * Navbar scroll behavior & Progress Bar
 */
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const scrollBar = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
        // Sticky/Scrolled Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Progress Bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (scrollBar) scrollBar.style.width = scrolled + "%";
    });
}
