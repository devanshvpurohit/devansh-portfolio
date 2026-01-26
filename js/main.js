/**
 * Global Portfolio Logic
 * Handles shared components, scroll effects, and accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
    injectSharedComponents();
    initScrollEffects();
});

/**
 * Injects Navbar and Footer into the DOM
 */
function injectSharedComponents() {
    const navbarHTML = `
        <nav class="navbar" id="navbar">
            <div class="container nav-content">
                <a href="/" class="logo">DVP<span>.</span></a>
                <ul class="nav-links">
                    <li><a href="/" class="nav-link" data-page="home">Home</a></li>
                    <li><a href="/pages/about.html" class="nav-link" data-page="about">About</a></li>
                    <li><a href="/pages/projects.html" class="nav-link" data-page="projects">Projects</a></li>
                    <li><a href="/pages/open-source.html" class="nav-link" data-page="os">Open Source</a></li>
                    <li><a href="/pages/contact.html" class="nav-btn">Contact</a></li>
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
 * Navbar scroll behavior
 */
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}
