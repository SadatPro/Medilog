
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Environment check
console.log("Environment check:");
console.log("VITE_API_KEY exists:", !!import.meta.env.VITE_API_KEY);
console.log("VITE_API_KEY length:", import.meta.env.VITE_API_KEY?.length);
if (import.meta.env.VITE_API_KEY) {
  console.log("✅ API Key is configured!");
} else {
  console.log("❌ API Key is NOT configured!");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
