import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.model.js';

dotenv.config();

const products = [
    {
        name: "Quantum Speaker v6",
        description: "Holographic audio projection with near-zero latency and deep bass spatial engineering.",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800",
        category: "Electronics",
        branch: "Tech Turf",
        stock: 15,
        specifications: {
            "Audio Range": "10Hz - 40kHz",
            "Battery Life": "48 Hours",
            "Connectivity": "Quantum Link Pro",
            "Weight": "1.2kg"
        }
    },
    {
        name: "Neural Nexus Smart Hub",
        description: "The central core for your smart environment, featuring AI-driven automation and biometric security.",
        price: 549.50,
        imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800",
        category: "Smart Devices",
        branch: "Quinta",
        stock: 20,
        specifications: {
            "Processor": "Nexus AI G3",
            "Encryption": "256-bit Quantum",
            "Compatibility": "Universal Node",
            "Power": "Wireless Induction"
        }
    },
    {
        name: "Horizon Drone Scout",
        description: "Long-range sub-orbital scouting drone with multispectral imaging and autonomous flight protocols.",
        price: 4999.00,
        imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
        category: "Aerospace",
        branch: "Tech Turf",
        stock: 5,
        specifications: {
            "Max Altitude": "15,000m",
            "Flight Time": "6 Hours",
            "Camera": "8K Multispectral",
            "Payload": "2.5kg"
        }
    },
    {
        name: "Pulse AR Visor",
        description: "Advanced augmented reality visor with real-time HUD and neural interface integration.",
        price: 899.00,
        imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=800",
        category: "Smart Devices",
        branch: "Click Sphere",
        stock: 30,
        specifications: {
            "Display": "Micro-OLED 4K",
            "Refresh Rate": "120Hz",
            "Weight": "180g",
            "FOV": "110 Degrees"
        }
    },
    {
        name: "Titan Power Module",
        description: "High-density solid-state battery unit for aerospace and industrial grade power requirements.",
        price: 2450.00,
        imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
        category: "Hardware",
        branch: "Tech Turf",
        stock: 12,
        specifications: {
            "Capacity": "10kWh",
            "Output": "5kW Constant",
            "Cycles": "10,000",
            "Cooling": "Liquid Immersion"
        }
    },
    {
        name: "Omni-Sensor Cluster",
        description: "Environmental sensor array for deep-space and high-altitude research telemetry.",
        price: 1120.00,
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
        category: "Aerospace",
        branch: "Tech Turf",
        stock: 8,
        specifications: {
            "Sensors": "Pressure, Temp, Gas, Radiation",
            "Range": "Global",
            "Data Link": "Satellite Mesh",
            "Lifespan": "5 Years"
        }
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tech-turf');
        console.log('Connected to MongoDB for seeding...');

        await Product.deleteMany({});
        console.log('Cleared existing products.');

        await Product.insertMany(products);
        console.log('Seed successful! Added 6 high-performance products.');

        process.exit();
    } catch (err) {
        console.error('Seeding Protocol Failure:', err);
        process.exit(1);
    }
};

seedDB();
