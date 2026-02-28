/**
 * Click Sphere - Floating Smart Nodes Network
 * Theme: "Smart Technology / IoT / Digital Grid"
 * Concept: Floating connection nodes with thin neural lines.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('click-sphere-branding')) return;

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
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const greenLight = new THREE.PointLight(0x57C84D, 2, 50);
    greenLight.position.set(20, 10, 10);
    scene.add(greenLight);

    const accentLight = new THREE.PointLight(0xA3E635, 1.5, 40);
    accentLight.position.set(-15, -10, 15);
    scene.add(accentLight);

    // --- SMART NODES NETWORK ---
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const nodesCount = 60;
    const nodesPositions = [];
    const nodesVelocities = [];
    const nodeMeshes = [];

    const nodeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMaterial = new THREE.MeshPhongMaterial({
        color: 0x57C84D,
        emissive: 0x57C84D,
        emissiveIntensity: 0.5,
        shininess: 100
    });

    for (let i = 0; i < nodesCount; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

        // Random Position
        node.position.x = (Math.random() - 0.5) * 40;
        node.position.y = (Math.random() - 0.5) * 40;
        node.position.z = (Math.random() - 0.5) * 20;

        nodesGroup.add(node);
        nodeMeshes.push(node);

        nodesVelocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.01
        });
    }

    // --- CONNECTION LINES ---
    const maxDistance = 8;
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.15
    });

    let lineMesh;

    function updateConnections() {
        if (lineMesh) nodesGroup.remove(lineMesh);

        const pairs = [];
        for (let i = 0; i < nodesCount; i++) {
            for (let j = i + 1; j < nodesCount; j++) {
                const dist = nodeMeshes[i].position.distanceTo(nodeMeshes[j].position);
                if (dist < maxDistance) {
                    pairs.push(nodeMeshes[i].position.x, nodeMeshes[i].position.y, nodeMeshes[i].position.z);
                    pairs.push(nodeMeshes[j].position.x, nodeMeshes[j].position.y, nodeMeshes[j].position.z);
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(pairs, 3));
        lineMesh = new THREE.LineSegments(geometry, lineMaterial);
        nodesGroup.add(lineMesh);
    }

    // --- MOUSE PARALLAX ---
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) / 250;
        targetY = (e.clientY - window.innerHeight / 2) / 250;

        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    });

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        // Slow Drift
        for (let i = 0; i < nodesCount; i++) {
            const node = nodeMeshes[i];
            const vel = nodesVelocities[i];

            node.position.x += vel.x;
            node.position.y += vel.y;
            node.position.z += vel.z;

            // Boundary Wrap
            if (Math.abs(node.position.x) > 22) vel.x *= -1;
            if (Math.abs(node.position.y) > 22) vel.y *= -1;
            if (Math.abs(node.position.z) > 12) vel.z *= -1;
        }

        updateConnections();

        // Smooth Parallax
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        nodesGroup.position.x = mouseX;
        nodesGroup.position.y = -mouseY;

        // Subtle glow fluctuation
        greenLight.intensity = 2 + Math.sin(Date.now() * 0.001) * 0.5;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();

    // --- SPOTLIGHT TRACKING ---
    const spotlights = document.querySelectorAll('.spotlight-group');
    spotlights.forEach(spotlight => {
        spotlight.addEventListener('mousemove', e => {
            const rect = spotlight.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            spotlight.style.setProperty('--x', `${x}px`);
            spotlight.style.setProperty('--y', `${y}px`);
        });
    });
});
