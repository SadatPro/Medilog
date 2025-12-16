// Test the original API key
import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyCWQb2-1ebQXP8FM3wubVjPv0ZmYHziDQA";

async function testOriginalAPI() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        console.log("Testing original API key...");
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say 'Original API key is working!' if you can read this."
        });
        
        console.log("✅ API Response:", response.text);
        console.log("✅ Original API Key is working correctly!");
        
    } catch (error) {
        console.error("❌ API Error:", error.message);
        if (error.message.includes("API_KEY_INVALID")) {
            console.error("❌ The API key appears to be invalid or expired.");
        } else if (error.message.includes("quota")) {
            console.error("❌ API quota exceeded.");
        } else {
            console.error("❌ Unknown error occurred:", error);
        }
    }
}

testOriginalAPI();