// Test script to check if VITE_API_KEY is available in browser
console.log("Environment check:");
console.log("VITE_API_KEY exists:", !!import.meta.env.VITE_API_KEY);
console.log("VITE_API_KEY length:", import.meta.env.VITE_API_KEY?.length);
console.log("Full import.meta.env:", import.meta.env);