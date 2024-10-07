// **Important!** Replace with your actual API key (store securely)
const apiKey = 'AIzaSyDUvjDk2cVPeXqRTIxNt-I9KWntgX8tK5s';  // **Do not expose your API key in code**

const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

let chatSession = null;

function initializeChat() {
  chatSession = model.startChat({
    generationConfig,
    // Safety settings (adjust as needed, refer to API docs)
    safetySettings: {
      safetyNet: HarmCategory.SCREEN,
      blockThreshold: HarmBlockThreshold.MODERATE,
    },
    history: [
      {
        role: "user",
        parts: [{ text: "hi\n" }],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! What can I do for you today? \n" }],
      },
    ],
  });
}

function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return;
  }

  chatSession
    .sendMessage(userMessage)
    .then((result) => {
      const modelResponse = result.response.text();
      appendMessage(userMessage, "user");
      appendMessage(modelResponse, "model");
      userInput.value = ""; // Clear input field
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      appendMessage("There was an error processing your request.", "error");
    });
}

function appendMessage(message, role) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message');
  messageElement.classList.add(role + '-message');
  messageElement.textContent = message;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to bottom
}

sendButton.addEventListener('click', sendMessage);

initializeChat();