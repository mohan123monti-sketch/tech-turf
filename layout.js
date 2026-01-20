/* ========================================================================
   Tech Turf Layout Logic
   Phase 7: Final Integration (Firebase + Dynamic UI + Cursor)
   - Procedural 3D Scrollytelling
   - Magnetic UI
   - Global Toasts & Cart
   - Dynamic Auth State Updating
   - Custom Cursor Logic
   ======================================================================== */

window.API_BASE_URL = window.location.origin.includes('localhost')
    ? 'http://localhost:3001/api'
    : '/api';

// --- 1. Global Message Handler (Toast) ---
function showMessage(type, message) {
    let container = document.getElementById('message-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'message-container';
        container.className = 'fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none w-full max-w-sm';
        document.body.appendChild(container);
    }

    const id = 'msg-' + Date.now();
    let icon = '';
    let color = '';

    switch (type) {
        case 'success':
            icon = 'check-circle';
            color = 'bg-green-600';
            break;
        case 'error':
            icon = 'x-octagon';
            color = 'bg-red-600';
            break;
        case 'info':
            icon = 'info';
            color = 'bg-blue-600';
            break;
        default:
            icon = 'message-square';
            color = 'bg-gray-600';
    }

    const msgHTML = `
           <div id="${id}" class="flex items-center p-4 rounded-xl shadow-lg ${color} text-white transition-all duration-300 transform translate-x-full opacity-0 pointer-events-auto">
               <i data-lucide="${icon}" class="w-5 h-5 mr-3 flex-shrink-0"></i>
               <span>${message}</span>
               <button onclick="document.getElementById('${id}').remove()" class="ml-auto text-white/70 hover:text-white">
                    <i data-lucide="x" class="w-4 h-4"></i>
               </button>
           </div>
       `;

    container.insertAdjacentHTML('beforeend', msgHTML);
    const msgElement = document.getElementById(id);

    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        msgElement.classList.remove('translate-x-full', 'opacity-0');
        msgElement.classList.add('translate-x-0', 'opacity-100');
    }, 50);

    setTimeout(() => {
        if (msgElement) {
            msgElement.classList.add('translate-x-full', 'opacity-0');
            msgElement.classList.remove('translate-x-0', 'opacity-100');
            setTimeout(() => msgElement.remove(), 300);
        }
    }, 5000);
}
window.showMessage = showMessage;

// --- 2. Cart Logic (Shopping) ---
function getCart() {
    try {
        const cartJson = localStorage.getItem('tt_cart');
        return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
        console.error("Error reading cart:", error);
        return [];
    }
}
window.getCart = getCart;

function saveCart(cart) {
    localStorage.setItem('tt_cart', JSON.stringify(cart));
    window.updateCartDisplay();
}
window.saveCart = saveCart;

function updateCartDisplay() {
    const cart = getCart();
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        el.textContent = totalItems > 9 ? '9+' : totalItems.toString();
        el.classList.toggle('hidden', totalItems === 0);
    });
}
window.updateCartDisplay = updateCartDisplay;

// --- 3. Auth State Management ---

function getAuthToken() { return localStorage.getItem('tt_token'); }
window.getAuthToken = getAuthToken;
function isLoggedIn() { return !!getAuthToken(); }
window.isLoggedIn = isLoggedIn;

function handleLogout() {
    if (typeof window.firebaseAuthLogout === 'function') {
        window.firebaseAuthLogout();
    } else {
        localStorage.removeItem('tt_token');
        window.showMessage('info', 'Logged out successfully.');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }
    localStorage.removeItem('tt_cart');
    window.updateCartDisplay();
}
window.handleLogout = handleLogout;

// --- 4. Header & Footer Generation ---

function generateHeader() {
    const currentPageFile = window.location.pathname.split('/').pop();

    const divisions = [
        { name: 'Tech Turf', href: 'index.html' },
        { name: 'Quinta', href: 'quinta.html' },
        { name: 'Trend Hive', href: 'trend_hive.html' },
        { name: 'Click Sphere', href: 'click_sphere.html' },
        { name: 'Shop', href: 'shopping.html' }
    ];

    const loggedIn = isLoggedIn();
    renderNavHTML(loggedIn, divisions, currentPageFile);
}

function renderNavHTML(isUserLoggedIn, divisions, currentPageFile) {
    const authLinks = isUserLoggedIn ?
        `<a href="account.html" class="transition-link text-white/70 hover:text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm border border-transparent hover:border-white/10">
               <i data-lucide="user" class="w-5 h-5 inline-block mr-1 align-sub"></i> Account
           </a>
           <button onclick="window.handleLogout()" class="magnetic-btn transition-link px-4 py-2 bg-red-600/70 text-white font-semibold rounded-lg hover:bg-red-500 transition-all text-sm">
               Sign Out
           </button>` :
        `<a href="login.html" class="transition-link text-white/70 hover:text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm">Sign In</a>
           <a href="register.html" class="magnetic-btn transition-link px-4 py-2 bg-orange-600/70 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all text-sm">
               Register
           </a>`;

    const navHTML = `
       <nav class="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 transition-all duration-500 liquid-glass" id="site-header">
           <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div class="flex justify-between items-center h-16">
                   <a href="index.html" class="flex-shrink-0 flex items-center transition-link">
                       <i data-lucide="rocket" class="w-7 h-7 text-orange-500 mr-2"></i>
                       <span class="text-xl font-bold tracking-wider text-white hidden sm:block">TECH TURF</span>
                       <span class="text-xl font-bold tracking-wider text-white sm:hidden">TT</span>
                   </a>
   
                   <div class="hidden md:flex md:items-center space-x-1">
                       ${divisions.map(d => `
                           <a href="${d.href}" class="transition-link text-white/70 hover:text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm
                           ${d.href === currentPageFile ? 'bg-orange-600/20 text-white' : ''}">
                               ${d.name}
                           </a>
                       `).join('')}
                   </div>
                   
                   <div class="hidden md:flex md:items-center space-x-3" id="desktop-auth-container">
                        ${authLinks}
                   </div>
   
                   <div class="md:hidden flex items-center gap-4">
                       <a href="shopping.html" class="relative text-white hover:text-orange-400">
                           <i data-lucide="shopping-cart" class="w-6 h-6"></i>
                           <span class="cart-count absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full hidden">0</span>
                       </a>
                       <button id="mobile-menu-btn" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                           <i data-lucide="menu" class="w-6 h-6"></i>
                       </button>
                   </div>
               </div>
           </div>
           
           <div class="md:hidden absolute w-full bg-[#05080f]/95 border-b border-white/5 shadow-2xl" id="mobile-menu" style="display: none;">
               <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                   ${divisions.map(d => `
                       <a href="${d.href}" class="transition-link block text-white/70 hover:text-white px-3 py-2 rounded-md font-medium
                       ${d.href === currentPageFile ? 'bg-orange-600/20 text-white' : ''}">
                           ${d.name}
                       </a>
                   `).join('')}
                   <div class="pt-4 border-t border-white/10 space-y-2" id="mobile-auth-container">
                       ${authLinks.replace(/magnetic-btn/g, 'magnetic-btn w-full justify-center').replace(/px-\d+ py-\d+/g, 'px-4 py-3 block text-center')}
                   </div>
               </div>
           </div>
       </nav>
       `;

    const container = document.getElementById('header-container');
    if (container) {
        container.innerHTML = navHTML;
        if (window.lucide) lucide.createIcons();
        window.updateCartDisplay();

        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                const isExpanded = mobileMenu.style.display === 'block';
                mobileMenu.style.display = isExpanded ? 'none' : 'block';
                mobileMenuBtn.querySelector('i').setAttribute('data-lucide', isExpanded ? 'menu' : 'x');

                // Toggle rounded shape
                const header = document.getElementById('site-header');
                if (header) {
                    if (!isExpanded) {
                        header.classList.add('menu-open');
                    } else {
                        header.classList.remove('menu-open');
                    }
                }
                if (window.lucide) lucide.createIcons();
            });
        }
    }
}

window.updateAuthUI = function (user) {
    const divisions = [
        { name: 'Tech Turf', href: 'index.html' },
        { name: 'Quinta', href: 'quinta.html' },
        { name: 'Trend Hive', href: 'trend_hive.html' },
        { name: 'Click Sphere', href: 'click_sphere.html' },
        { name: 'Shop', href: 'shopping.html' }
    ];
    const currentPageFile = window.location.pathname.split('/').pop();
    renderNavHTML(!!user, divisions, currentPageFile);
};

function generateFooter() {
    const footerHTML = `
       <footer class="relative z-10 border-t border-white/5 pt-12 pb-8 bg-[#05080f]/90">
           <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div class="grid grid-cols-2 md:grid-cols-5 gap-8">
                   <div class="col-span-2 md:col-span-1">
                       <a href="index.html" class="flex items-center transition-link">
                           <i data-lucide="rocket" class="w-6 h-6 text-orange-500 mr-2"></i>
                           <span class="text-xl font-bold tracking-wider text-white">TECH TURF</span>
                       </a>
                       <p class="mt-4 text-gray-400 text-sm max-w-xs">
                           Innovate • Inspire • Ignite. Building the future, one project at a time.
                       </p>
                   </div>
                   <!-- (Company, Divisions, Legal, Contact sections truncated for brevity but remain the same) -->
                   <div>
                       <h3 class="text-lg font-semibold text-white mb-4">Company</h3>
                       <ul class="space-y-3 text-sm">
                           <li><a href="about.html" class="text-gray-400 hover:text-orange-400 transition-link">About Us</a></li>
                           <li><a href="projects.html" class="text-gray-400 hover:text-orange-400 transition-link">Projects</a></li>
                           <li><a href="contact.html" class="text-gray-400 hover:text-orange-400 transition-link">Contact</a></li>
                       </ul>
                   </div>
                   <div>
                       <h3 class="text-lg font-semibold text-white mb-4">Legal</h3>
                       <ul class="space-y-3 text-sm">
                           <li><a href="terms_of_service.html" class="text-gray-400 hover:text-orange-400 transition-link">Terms</a></li>
                           <li><a href="privacy_policy.html" class="text-gray-400 hover:text-orange-400 transition-link">Privacy</a></li>
                       </ul>
                   </div>
                   <div>
                        <h3 class="text-lg font-semibold text-white mb-4">Connect</h3>
                        <p class="text-gray-400 text-sm">Coimbatore, India</p>
                   </div>
               </div>
               <div class="mt-12 pt-8 border-t border-white/5 text-center">
                   <p class="text-gray-500 text-sm">&copy; ${new Date().getFullYear()} Tech Turf. All rights reserved.</p>
               </div>
           </div>
       </footer>
       `;
    document.getElementById('footer-container').innerHTML = footerHTML;
    if (window.lucide) lucide.createIcons();
}

/**
 * --- 5. ADVANCED UI EFFECTS ---
 */

// NEW: Initialize Custom Cursor
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    const hoverElements = document.querySelectorAll('a, button, .cursor-hover');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}

function handle3DTilt() {
    const tiltElements = document.querySelectorAll('.tilt-3d');
    if (tiltElements.length === 0) return;

    document.addEventListener('mousemove', (e) => {
        tiltElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const maxTilt = 5;
            const x = (e.clientX - centerX) / (rect.width / 2);
            const y = (e.clientY - centerY) / (rect.height / 2);

            const rotateX = -y * maxTilt;
            const rotateY = x * maxTilt;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });

    tiltElements.forEach(el => {
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

function handleMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    if (magneticButtons.length === 0) return;

    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const middleX = rect.width / 2;
            const middleY = rect.height / 2;
            const offsetX = ((x - middleX) / middleX) * 15;
            const offsetY = ((y - middleY) / middleY) * 15;

            btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
        });
    });
}

function handleSpotlight() {
    const groups = document.querySelectorAll('.spotlight-group');
    groups.forEach(group => {
        group.addEventListener('mousemove', (e) => {
            const rect = group.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            group.style.setProperty('--mouse-x', `${x}px`);
            group.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

function handleScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-hidden');
    const windowHeight = window.innerHeight;
    const elementVisible = 50;
    reveals.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('reveal-active');
        }
    });
}
window.handleScrollReveal = handleScrollReveal;

function handlePageTransitions() {
    document.querySelectorAll('.transition-link').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto') || e.metaKey || e.ctrlKey) {
                return;
            }
            e.preventDefault();
            document.body.classList.add('page-transition-out');
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
}

// --- 6. 3D BACKGROUND (THREE.JS) ---
let scene, camera, renderer;
let earthMesh, cloudMesh, starMesh;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container || !window.THREE) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 1.5; // Zoomed in to see details

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor(0x000000, 1); // Dark background
    container.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // --- TEXTURE LOADER ---
    const loader = new THREE.TextureLoader();
    // Using standard high-res earth textures
    const earthMap = loader.load('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Aurora_as_seen_by_IMAGE.jpg/640px-Aurora_as_seen_by_IMAGE.jpg'); // Fallback/Placeholder if specific NASA ones fail, but let's try better ones below if possible.
    // Actually, let's use reliable GitHub raw links for standard Earth textures
    const baseUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';

    const mapIo = loader.load(baseUrl + 'earth_atmos_2048.jpg');
    const mapSpecular = loader.load(baseUrl + 'earth_specular_2048.jpg');
    const mapNormal = loader.load(baseUrl + 'earth_normal_2048.jpg');
    const mapClouds = loader.load(baseUrl + 'earth_clouds_1024.png');

    // --- EARTH ---
    const geometry = new THREE.SphereGeometry(0.5, 64, 64); // 0.5 radius
    const material = new THREE.MeshPhongMaterial({
        map: mapIo,
        specularMap: mapSpecular,
        normalMap: mapNormal,
        specular: new THREE.Color(0x333333),
        shininess: 5
    });
    earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);

    // --- CLOUDS ---
    const cloudGeometry = new THREE.SphereGeometry(0.505, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: mapClouds,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    // --- STARS BACKGROUND ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = [];
    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100; // Far background
        starPos.push(x, y, z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
    starMesh = new THREE.Points(starGeo, starMat);
    scene.add(starMesh);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    animate();
}

function onWindowResize() {
    if (!camera || !renderer) return;
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.1;
    mouseY = (event.clientY - windowHalfY) * 0.1;
}

function animate() {
    requestAnimationFrame(animate);

    if (earthMesh) {
        earthMesh.rotation.y += 0.001; // Slow rotation of earth
    }
    if (cloudMesh) {
        cloudMesh.rotation.y += 0.0012; // Clouds rotate slightly faster
        cloudMesh.rotation.x += 0.0001;
    }
    if (starMesh) {
        starMesh.rotation.y -= 0.0002;
    }

    // Gentle mouse interaction (parallax)
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    if (earthMesh) {
        earthMesh.rotation.y += 0.05 * (targetX - earthMesh.rotation.y);
        earthMesh.rotation.x += 0.05 * (targetY - earthMesh.rotation.x);
    }

    renderer.render(scene, camera);
}

// --- 7. CONTENT PROTECTION ---
function initContentProtection() {
    // Disable context menu (Right Code)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showMessage('error', 'Content copying is restricted.');
    });

    // Disable specific keyboard shortcuts (Ctrl+C, Ctrl+U, Ctrl+Shift+I, F12)
    document.addEventListener('keydown', (e) => {
        // Allow F5 and Ctrl+R (Refresh)
        if (e.key === 'F5' || (e.ctrlKey && e.keyCode === 82)) return;

        if (
            e.ctrlKey &&
            (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')
        ) {
            e.preventDefault();
            showMessage('error', 'Keyboard shortcuts are restricted.');
            return;
        }

        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            // e.preventDefault(); // Optional: Block dev tools (often annoying for users though)
        }
    });

    // Disable Dragging
    document.addEventListener('dragstart', (e) => e.preventDefault());
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    generateHeader();
    generateFooter();
    updateCartDisplay();

    // Initialize cursor if not mobile
    if (window.matchMedia("(min-width: 768px)").matches) {
        initCustomCursor();
    }

    if (document.body.getAttribute('data-3d-enabled') === 'true') {
        initThreeJS();
        handleScrollReveal();
        window.addEventListener('scroll', handleScrollReveal);
    }

    handle3DTilt();
    handleSpotlight();
    handleMagneticButtons();
    handlePageTransitions();
    initContentProtection(); // Enable content protection

    if (window.lucide) lucide.createIcons();
});