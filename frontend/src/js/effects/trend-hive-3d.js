/**
 * Trend Hive - Floating Gradient Hexagon Field
 * Theme: "Hexagon Network / Creative Cells"
 * Concept: 3D Realistic Hexagon Field with Brand Gradients
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('trend-hive-branding')) return;

    const container = document.getElementById('three-container');
    if (!container) return;

    // Create Liquid Cursor
    const cursor = document.createElement('div');
    cursor.className = 'liquid-cursor';
    document.body.appendChild(cursor);

    container.innerHTML = '';

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const orangeLight = new THREE.PointLight(0xFF7A18, 2, 50);
    orangeLight.position.set(20, 10, 10);
    scene.add(orangeLight);

    const purpleLight = new THREE.PointLight(0x6D28D9, 2, 50);
    purpleLight.position.set(-20, -10, 10);
    scene.add(purpleLight);

    // --- HEXAGON FIELD ---
    const hexagonGroup = new THREE.Group();
    scene.add(hexagonGroup);

    // Create Hexagon Shape
    const createHexagon = (size, color, opacity) => {
        // Hexagon is a circle with 6 segments
        const geometry = new THREE.CircleGeometry(size, 6);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide,
            shininess: 100,
            emissive: color,
            emissiveIntensity: 0.2
        });
        return new THREE.Mesh(geometry, material);
    };

    const count = 150;
    const hexagons = [];

    const colors = [0xFF7A18, 0xFF4D4D, 0xD946EF, 0x6D28D9];

    for (let i = 0; i < count; i++) {
        const size = Math.random() * 0.8 + 0.2;
        const colorIndex = Math.floor(Math.random() * colors.length);
        const hex = createHexagon(size, colors[colorIndex], 0.4 + Math.random() * 0.4);

        // Random Position in 3D Space
        hex.position.x = (Math.random() - 0.5) * 40;
        hex.position.y = (Math.random() - 0.5) * 40;
        hex.position.z = (Math.random() - 0.5) * 20;

        // Random Rotation
        hex.rotation.x = Math.random() * Math.PI;
        hex.rotation.y = Math.random() * Math.PI;

        // Random drift speed
        hex.userData = {
            driftX: (Math.random() - 0.5) * 0.01,
            driftY: (Math.random() - 0.5) * 0.01,
            spinX: (Math.random() - 0.5) * 0.02,
            spinY: (Math.random() - 0.5) * 0.02
        };

        hexagons.push(hex);
        hexagonGroup.add(hex);
    }

    // --- NEURAL GRID (Faint connections) ---
    const gridGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x2D2D3A,
        wireframe: true,
        transparent: true,
        opacity: 0.05
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.position.z = -10;
    scene.add(grid);

    // --- MOUSE PARALLAX ---
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) / 200;
        targetY = (e.clientY - window.innerHeight / 2) / 200;

        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    });

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        // Slow Hexagon Drift
        hexagons.forEach(hex => {
            hex.position.x += hex.userData.driftX;
            hex.position.y += hex.userData.driftY;
            hex.rotation.x += hex.userData.spinX;
            hex.rotation.y += hex.userData.spinY;

            // Boundary wrap
            if (Math.abs(hex.position.x) > 25) hex.position.x *= -0.9;
            if (Math.abs(hex.position.y) > 25) hex.position.y *= -0.9;
        });

        // Smooth Parallax
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        hexagonGroup.position.x = mouseX;
        hexagonGroup.position.y = -mouseY;

        // Subtle light movement
        orangeLight.position.x = 20 + Math.sin(Date.now() * 0.001) * 5;
        purpleLight.position.x = -20 + Math.cos(Date.now() * 0.001) * 5;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});
