// Test to demonstrate the API key issue and provide solution
import { GoogleGenAI } from "@google/genai";

// Current API keys that are blocked
const BLOCKED_KEYS = [
    "AIzaSyCwGjZXGhPLsv-jPSOW8Z1i_N4Zn01NQso",
    "AIzaSyCWQb2-1ebQXP8FM3wubVjPv0ZmYHziDQA"
];

async function testAPIKeys() {
    console.log("🔍 Testing API Keys Status:");
    console.log("=" .repeat(50));
    
    for (const key of BLOCKED_KEYS) {
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Test message"
            });
            console.log(`✅ Key ${key.substring(0, 20)}... is working`);
        } catch (error) {
            console.log(`❌ Key ${key.substring(0, 20)}... is BLOCKED: ${error.message}`);
        }
    }
    
    console.log("\n" + "=" .repeat(50));
    console.log("🚨 SOLUTION NEEDED:");
    console.log("Both API keys have been reported as leaked and blocked by Google.");
    console.log("\n🔧 WHAT YOU NEED TO DO:");
    console.log("1. Generate a NEW Google AI API key");
    console.log("2. Go to: https://makersuite.google.com/app/apikey");
    console.log("3. Create a new API key");
    console.log("4. Update the .env file with the new key:");
    console.log("   VITE_API_KEY=YOUR_NEW_API_KEY_HERE");
    console.log("5. Restart the development server");
    console.log("\n⚠️  IMPORTANT: Never share your API key publicly!");
}

testAPIKeys();