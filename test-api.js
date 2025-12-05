// Test script to verify Google AI API functionality
import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyCWQb2-1ebQXP8FM3wubVjPv0ZmYHziDQA";

async function testAPI() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        console.log("Testing Google AI API...");
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say 'API is working!' if you can read this message."
        });
        
        console.log("✅ API Response:", response.text);
        console.log("✅ API Key is working correctly!");
        
    } catch (error) {
        console.error("❌ API Error:", error.message);
        if (error.message.includes("API_KEY_INVALID")) {
            console.error("❌ The API key appears to be invalid or expired.");
        } else if (error.message.includes("quota")) {
            console.error("❌ API quota exceeded.");
        } else {
            console.error("❌ Unknown error occurred.", error);
        }
    }
}

testAPI();