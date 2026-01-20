// --- Imports ---
import express from 'express';
import ChatMessage from '../models/chatMessage.model.js'; // Import our Chat model
import { protect } from '../middleware/authMiddleware.js'; // Import our security middleware

// --- Configuration ---
const router = express.Router();

// NOTE: We do NOT read process.env here anymore. 
// We read it inside the route to ensure .env is loaded.

// --- API Routes ---

/**
 * @route   POST /api/chat/message
 * @desc    Send a new message to the AI
 * @access  Private (Requires login)
 */
router.post('/message', protect, async (req, res) => {
    const { prompt } = req.body;
    const userId = req.user._id; 

    // 1. GET CONFIG INSIDE THE ROUTE
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }
    
    // 2. CHECK KEY
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_GEMINI_API_KEY")) {
        console.error("Gemini API key is missing or default.");
        return res.status(500).json({ message: 'AI service is not configured.' });
    }

    try {
        // 3. Save user message
        const userMessage = new ChatMessage({
            author: userId,
            role: 'user',
            text: prompt,
        });
        await userMessage.save();

        // 4. Call Gemini API
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ "google_search": {} }],
        };

        const apiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Gemini API responded with status ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const candidate = result.candidates?.[0];
        
        let aiText = "Sorry, I couldn't generate a response.";
        let sources = [];
        
        if (candidate && candidate.content?.parts?.[0]?.text) {
            aiText = candidate.content.parts[0].text;
            
            const metadata = candidate.groundingMetadata;
            if (metadata && metadata.groundingAttributions) {
                sources = metadata.groundingAttributions
                    .map(attr => ({
                        uri: attr.web?.uri,
                        title: attr.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
            }
        }

        // 5. Save AI response
        const aiMessage = new ChatMessage({
            author: userId,
            role: 'model',
            text: aiText,
            sources: sources
        });
        await aiMessage.save();

        res.status(200).json(aiMessage);

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: 'Error processing your chat message.' });
    }
});


/**
 * @route   GET /api/chat/history
 * @desc    Get the logged-in user's chat history
 * @access  Private (Requires login)
 */
router.get('/history', protect, async (req, res) => {
    try {
        const history = await ChatMessage.find({ author: req.user._id })
            .sort({ createdAt: 'asc' }); 

        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: 'Error fetching chat history.' });
    }
});

// --- Export Router ---
export default router;