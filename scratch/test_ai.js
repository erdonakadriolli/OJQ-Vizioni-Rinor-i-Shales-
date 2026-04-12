import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function testAI() {
  const apiKey = "AIzaSyCaSWLgxX7Tq_Ot7bBBku4GAFBVmxMwm1g"; // Explicitly test with the key from .env
  console.log("Testing with API Key:", apiKey.substring(0, 10) + "...");
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log("SDK initialized. Attempting to list models...");
    
    // Some versions of the SDK have different ways to list models
    // Let's try to just generate a simple content
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: "hi" }] }]
    });
    
    console.log("Success! Response text:", result.text);
  } catch (err) {
    console.error("FAILED with error:", err.message);
    if (err.response) {
       console.error("Response data:", JSON.stringify(err.response.data, null, 2));
    }
    
    console.log("\nAttempting alternative model name: gemini-pro...");
    try {
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
          model: "gemini-pro",
          contents: [{ role: "user", parts: [{ text: "hi" }] }]
        });
        console.log("Success with gemini-pro! Response text:", result.text);
    } catch (err2) {
        console.error("FAILED with gemini-pro too:", err2.message);
    }
  }
}

testAI();
