// server.js (Node.js backend)
require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize GoogleGenerativeAI with your API key
const apiKey = process.env.GEMINI_API_KEY; // Store your API key in a .env file
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();
app.use(bodyParser.json());

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

let chatSession = null;

// Initialize the chat session
app.post('/initialize-chat', (req, res) => {
    try {
        chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'hi\n' }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Hi there! What can I do for you today?\n' }],
                },
            ],
        });
        res.json({ status: 'Chat initialized' });
    } catch (error) {
        console.error('Error initializing chat:', error);
        res.status(500).json({ error: 'Failed to initialize chat session' });
    }
});

// Handle user messages and get AI responses
app.post('/send-message', async (req, res) => {
    const userMessage = req.body.message;

    if (!chatSession) {
        return res.status(400).json({ error: 'Chat session is not initialized.' });
    }

    try {
        const result = await chatSession.sendMessage(userMessage);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Error processing the message.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
