// Test script to verify Google AI API functionality using .env keys
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function getKeys() {
  const raw = process.env.VITE_GEMINI_KEYS || process.env.VITE_API_KEY || "";
  return raw
    .split(",")
    .map((k) => k.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

async function tryKey(apiKey) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Reply exactly: API is working!",
  });
  return response.text?.trim();
}

async function testAPI() {
  const keys = getKeys();
  if (keys.length === 0) {
    console.error("❌ No API keys found in .env (VITE_GEMINI_KEYS or VITE_API_KEY).");
    process.exit(1);
  }
  console.log(`Found ${keys.length} key(s). Testing...`);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const text = await tryKey(key);
      if (text && /API is working!?/i.test(text)) {
        console.log(`✅ Key ${i + 1} succeeded: API is working!`);
        return;
      }
      console.log(`⚠️ Key ${i + 1} responded but not as expected: ${text}`);
    } catch (error) {
      const message = error?.message || String(error);
      if (message.includes("quota") || message.includes("429")) {
        console.error(`⛔ Key ${i + 1} quota exceeded (429/quota).`);
      } else if (message.includes("API_KEY_INVALID")) {
        console.error(`❌ Key ${i + 1} invalid.`);
      } else {
        console.error(`❌ Key ${i + 1} error:`, message);
      }
    }
  }
  console.error("❌ All keys failed or are at quota. AI will fall back in the app.");
  process.exit(2);
}

testAPI();
