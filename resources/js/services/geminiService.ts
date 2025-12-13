
import { GoogleGenAI, Type } from "@google/genai";
import { Medicine, DosageSuggestion, Patient, Prescription } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY as string | undefined || "AIzaSyCwGjZXGhPLsv-jPSOW8Z1i_N4Zn01NQso";
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : undefined;

export const geminiService = {
    suggestMedicines: async (query: string): Promise<Medicine[]> => {
        if (!query || !API_KEY || !ai) return [];
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Provide a list of 5 medicine suggestions for the query "${query}". Include brand name, generic name, and available strengths.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { brandName: { type: Type.STRING }, genericName: { type: Type.STRING }, strength: { type: Type.STRING } },
                            required: ["brandName", "genericName", "strength"],
                        },
                    },
                },
            });
            const result = JSON.parse(response.text.trim());
            return Array.isArray(result) ? result : [];
        } catch (error) { console.error("Error fetching medicine suggestions:", error); return []; }
    },
    getDosageSuggestion: async (medicine: Medicine): Promise<DosageSuggestion | null> => {
        if (!API_KEY || !ai) return null;
        try {
            const prompt = `For the medicine "${medicine.brandName} (${medicine.genericName}) ${medicine.strength}", provide a typical dosage, frequency, duration, and a common note for a standard adult patient.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash", contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { dosage: { type: Type.STRING }, frequency: { type: Type.STRING }, duration: { type: Type.STRING }, notes: { type: Type.STRING } },
                        required: ["dosage", "frequency", "duration", "notes"],
                    },
                },
            });
            return JSON.parse(response.text.trim()) as DosageSuggestion;
        } catch (error) { console.error("Error fetching dosage suggestion:", error); return null; }
    },
    checkInteractions: async (medicines: string[]): Promise<string> => {
        if (medicines.length < 2) return "At least two medicines are required to check for interactions.";
        if (!API_KEY || !ai) return "API Key not configured. Interaction check is disabled.";
        try {
            const prompt = `Analyze potential drug-drug interactions for the following list of medications: ${medicines.join(', ')}. Provide a concise summary of any significant interactions, categorized by severity (e.g., Major, Moderate, Minor). If there are no significant interactions, state that clearly. Format the response using simple markdown with headings for severity (e.g., '### Major Interactions'), bullet points for lists, and bold text for emphasis. Do not include any introductory or concluding sentences.`;
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return response.text;
        } catch (error) { console.error("Error checking interactions:", error); return "An error occurred while checking for interactions."; }
    },
    getPersonalizedHealthAdvice: async (patient: Patient, prescriptions: Prescription[], question: string): Promise<string> => {
        if (!API_KEY || !ai) return "API Key not configured. AI Assistant is disabled.";
        try {
            const patientDataSummary = `- Vitals: ${patient.vitals.map(v => `${v.label}: ${v.value} ${v.unit}`).join(', ')}\n- Prescriptions: ${prescriptions.flatMap(p => p.items).map(item => item.genericName).join(', ') || 'None'}`;
            const prompt = `You are a helpful AI health advisor. Based on the patient data, provide advice for their question.\n**IMPORTANT**: Your response MUST start with the following disclaimer, exactly as written:\n"**Disclaimer:** This is AI-generated advice and not a substitute for professional medical consultation. Please consult with a qualified healthcare provider for any health concerns."\n\nPatient Data:\n${patientDataSummary}\n\nPatient's Question: "${question}"\n\nPlease provide a helpful response formatted with simple markdown.`;
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return response.text;
        } catch (error) { console.error("Error getting health advice:", error); return "An error occurred while generating health advice."; }
    },
    getAutomatedHealthTips: async (patient: Patient, prescriptions: Prescription[]): Promise<string[]> => {
        if (!API_KEY || !ai) return ["API Key not configured. Health tips are disabled."];
        try {
            const vitalSummary = patient.vitals.map(v => `${v.label}: ${v.value} ${v.unit}`).join(', ');
            const prescriptionSummary = prescriptions.flatMap(p => p.items).map(item => item.genericName).join(', ') || 'none';
            
            const patientContext = `Patient Data:\n- Age: ${patient.age}\n- Gender: ${patient.gender}\n- Vitals: ${vitalSummary || 'not available'}\n- Allergies: ${patient.allergies || 'none'}\n- Asthma: ${patient.asthma || 'N/A'}\n- Current Medications: ${prescriptionSummary}`;
            const prompt = `Based on the patient data below, provide three brief, actionable health tips as a simple list.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `${patientContext}\n\n${prompt}`,
                config: {
                    systemInstruction: "You are an AI health assistant. Your task is to provide health tips based on patient data. Respond ONLY with a simple list of tips, with each tip on a new line. Do not add any introductory, concluding, or extra text.",
                },
            });

            const tips = response.text.trim().split('\n')
                .map(tip => tip.replace(/^- \d*\.?\s*/, '').trim()) 
                .filter(tip => tip.length > 0);
            
            if (tips.length === 0 && response.text.trim().length > 0) return [response.text.trim()];
            if (tips.length === 0) return ["Could not generate tips at this time."];

            return tips;
        } catch (error) { 
            console.error("Error getting automated health tips:", error);
            if (typeof error === 'object' && error !== null && 'message' in error) {
                 const errorMessage = (error as Error).message;
                 if (errorMessage.includes("UNAVAILABLE") || errorMessage.includes("503")) {
                     return ["The AI health assistant is temporarily unavailable. Please try again later."];
                 }
            }
            return ["Sorry, an error occurred while generating health tips. Please try again."]; 
        }
    },
};