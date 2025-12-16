import { GoogleGenAI, Type } from "@google/genai";
import { Medicine, DosageSuggestion, Patient, Prescription } from '../types';

const KEYS_ENV = (import.meta.env.VITE_GEMINI_KEYS as string | undefined) || (import.meta.env.VITE_API_KEY as string | undefined) || '';
const API_KEYS = KEYS_ENV.split(',')
  .map(k => k.trim().replace(/^['"]|['"]$/g, ''))
  .filter(Boolean);
let currentKeyIndex = 0;
let ai = API_KEYS.length ? new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] }) : undefined;
const rotateKey = (): boolean => {
    if (API_KEYS.length <= 1) return false;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    ai = new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });
    return true;
};

// Rate limit tracking
let rateLimitExceeded = false;
let rateLimitMessageShown = false;
let lastRateLimitCheck = 0;
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown before retrying

// Check if rate limit is exceeded
export const isRateLimitExceeded = (): boolean => {
    // Check if cooldown period has passed
    if (rateLimitExceeded && (Date.now() - lastRateLimitCheck) > RATE_LIMIT_COOLDOWN) {
        console.log('Rate limit cooldown passed, allowing retry');
        rateLimitExceeded = false;
        rateLimitMessageShown = false;
    }
    return rateLimitExceeded;
};

// Reset rate limit status (can be called daily or on user action)
export const resetRateLimit = (): void => {
    rateLimitExceeded = false;
    rateLimitMessageShown = false;
    lastRateLimitCheck = 0;
    console.log('Rate limit status reset');
};

// Set rate limit exceeded
const setRateLimitExceeded = (): void => {
    rateLimitExceeded = true;
    lastRateLimitCheck = Date.now();
    console.warn('Gemini API rate limit exceeded. All AI features will use fallback content.');
};
const clearRateLimit = (): void => {
    rateLimitExceeded = false;
    rateLimitMessageShown = false;
    lastRateLimitCheck = 0;
};

// Fallback medicine suggestions when API rate limit is exceeded
const getFallbackMedicineSuggestions = (query: string): Medicine[] => {
    const fallbackMedicines: Medicine[] = [
        { brandName: "Tylenol", genericName: "Paracetamol", strength: "500mg" },
        { brandName: "Advil", genericName: "Ibuprofen", strength: "200mg" },
        { brandName: "Aspirin", genericName: "Acetylsalicylic acid", strength: "300mg" },
        { brandName: "Amoxicillin", genericName: "Amoxicillin", strength: "250mg" },
        { brandName: "Cetirizine", genericName: "Cetirizine HCl", strength: "10mg" },
        { brandName: "Omeprazole", genericName: "Omeprazole", strength: "20mg" },
        { brandName: "Metformin", genericName: "Metformin HCl", strength: "500mg" },
        { brandName: "Atorvastatin", genericName: "Atorvastatin", strength: "10mg" }
    ];
    
    const lowercaseQuery = query.toLowerCase();
    return fallbackMedicines.filter(med => 
        med.brandName.toLowerCase().includes(lowercaseQuery) ||
        med.genericName.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 5);
};

// Fallback dosage suggestions
const getFallbackDosageSuggestion = (medicine: Medicine, language: 'en' | 'bn'): DosageSuggestion => {
    if (language === 'bn') {
        return {
            dosage: "1 ট্যাবলেট",
            frequency: "দিনে 3 বার",
            duration: "5-7 দিন",
            notes: "খাবার পরে গ্রহণ করুন"
        };
    }
    return {
        dosage: "1 tablet",
        frequency: "3 times daily",
        duration: "5-7 days",
        notes: "Take after meals"
    };
};

// Fallback health tips
const getFallbackHealthTips = (language: 'en' | 'bn'): string[] => {
    if (language === 'bn') {
        return [
            "প্রতিদিন কমপক্ষে ৮ গ্লাস পানি পান করুন",
            "নিয়মিত ব্যায়াম করুন - প্রতিদিন কমপক্ষে ৩০ মিনিট হাঁটুন",
            "সময়মতো ঔষধ গ্রহণ করুন এবং ডাক্তারের পরামর্শ অনুসরণ করুন"
        ];
    }
    return [
        "Drink at least 8 glasses of water daily",
        "Exercise regularly - walk for at least 30 minutes daily",
        "Take medications on time and follow your doctor's advice"
    ];
};

// Rate limit message
const getRateLimitMessage = (language: 'en' | 'bn'): string => {
    if (language === 'bn') {
        return "🚫 আজকের জন্য এআই সীমা শেষ হয়ে গেছে। আগামীকাল আবার চেষ্টা করুন।";
    }
    return "🚫 AI limit finished for today. Try again tomorrow.";
};

export const geminiService = {
    suggestMedicines: async (query: string): Promise<Medicine[]> => {
        // Check if rate limit is already exceeded
        if (isRateLimitExceeded()) {
            return getFallbackMedicineSuggestions(query);
        }
        if (!query || API_KEYS.length === 0 || !ai) {
            return [];
        }
        try {
            const call = async () => {
                const response = await ai!.models.generateContent({
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
                return response;
            };
            const response = await call();
            const result = JSON.parse(response.text.trim());
            clearRateLimit();
            return Array.isArray(result) ? result : [];
        } catch (error) { 
            console.error("Error fetching medicine suggestions:", error);
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                for (let i = 0; i < API_KEYS.length - 1; i++) {
                    if (!rotateKey()) break;
                    try {
                        const retryResponse = await ai!.models.generateContent({
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
                        const retryResult = JSON.parse(retryResponse.text.trim());
                        clearRateLimit();
                        return Array.isArray(retryResult) ? retryResult : [];
                    } catch {}
                }
                setRateLimitExceeded();
                return getFallbackMedicineSuggestions(query);
            }
            return []; 
        }
    },
    getDosageSuggestion: async (medicine: Medicine, language: 'en' | 'bn' = 'en'): Promise<DosageSuggestion | null> => {
        // Check if rate limit is already exceeded
        if (isRateLimitExceeded()) {
            return getFallbackDosageSuggestion(medicine, language);
        }
        
        if (API_KEYS.length === 0 || !ai) return null;
        try {
            const languagePrompt = language === 'bn' 
                ? 'Please provide the response in Bengali language.' 
                : 'Please provide the response in English language.';
            
            const prompt = `For the medicine "${medicine.brandName} (${medicine.genericName}) ${medicine.strength}", provide a typical dosage, frequency, duration, and a common note for a standard adult patient. ${languagePrompt}`;
            
            const call = async () => {
                const response = await ai!.models.generateContent({
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
                return response;
            };
            const response = await call();
            clearRateLimit();
            return JSON.parse(response.text.trim()) as DosageSuggestion;
        } catch (error) { 
            console.error("Error fetching dosage suggestion:", error);
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                for (let i = 0; i < API_KEYS.length - 1; i++) {
                    if (!rotateKey()) break;
                    try {
                        const retry = await ai!.models.generateContent({
                            model: "gemini-2.5-flash", contents: `For the medicine "${medicine.brandName} (${medicine.genericName}) ${medicine.strength}", provide a typical dosage, frequency, duration, and a common note for a standard adult patient. ${language === 'bn' ? 'Please provide the response in Bengali language.' : 'Please provide the response in English language.'}`,
                            config: {
                                responseMimeType: "application/json",
                                responseSchema: {
                                    type: Type.OBJECT,
                                    properties: { dosage: { type: Type.STRING }, frequency: { type: Type.STRING }, duration: { type: Type.STRING }, notes: { type: Type.STRING } },
                                    required: ["dosage", "frequency", "duration", "notes"],
                                },
                            },
                        });
                        const parsed = JSON.parse(retry.text.trim()) as DosageSuggestion;
                        clearRateLimit();
                        return parsed;
                    } catch {}
                }
                setRateLimitExceeded();
                return getFallbackDosageSuggestion(medicine, language);
            }
            return null; 
        }
    },
    checkInteractions: async (medicines: string[], language: 'en' | 'bn' = 'en'): Promise<string> => {
        // Check if rate limit is already exceeded
        if (isRateLimitExceeded()) {
            return language === 'bn' 
                ? "**সতর্কতা:** বর্তমানে ঔষধ মিথস্ক্রিয়া পরীক্ষা অক্ষম আছে। অনুগ্রহ করে আপনার ফার্মাসিস্ট বা ডাক্তারের সাথে পরামর্শ করুন।" 
                : "**Warning:** Drug interaction check is currently unavailable. Please consult with your pharmacist or doctor.";
        }
        
        if (medicines.length < 2) return language === 'bn' ? "মিথস্ক্রিয়া পরীক্ষার জন্য কমপক্ষে দুটি ওষুধ প্রয়োজন।" : "At least two medicines are required to check for interactions.";
        if (API_KEYS.length === 0 || !ai) return language === 'bn' ? "এপিআই কী কনফিগার করা হয়নি। মিথস্ক্রিয়া পরীক্ষা অক্ষম আছে।" : "API Key not configured. Interaction check is disabled.";
        try {
            const languagePrompt = language === 'bn' 
                ? 'Please provide the response in Bengali language.' 
                : 'Please provide the response in English language.';
            
            const prompt = `Analyze potential drug-drug interactions for the following list of medications: ${medicines.join(', ')}. Provide a concise summary of any significant interactions, categorized by severity (e.g., Major, Moderate, Minor). If there are no significant interactions, state that clearly. Format the response using simple markdown with headings for severity (e.g., '### Major Interactions'), bullet points for lists, and bold text for emphasis. Do not include any introductory or concluding sentences. ${languagePrompt}`;
            const call = async () => {
                const response = await ai!.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
                return response;
            };
            const response = await call();
            clearRateLimit();
            return response.text;
        } catch (error) { 
            console.error("Error checking interactions:", error);
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                for (let i = 0; i < API_KEYS.length - 1; i++) {
                    if (!rotateKey()) break;
                    try {
                        const retry = await ai!.models.generateContent({ model: "gemini-2.5-flash", contents: `Analyze potential drug-drug interactions for the following list of medications: ${medicines.join(', ')}. Provide a concise summary of any significant interactions, categorized by severity (e.g., Major, Moderate, Minor). If there are no significant interactions, state that clearly. Format the response using simple markdown with headings for severity (e.g., '### Major Interactions'), bullet points for lists, and bold text for emphasis. Do not include any introductory or concluding sentences. ${language === 'bn' ? 'Please provide the response in Bengali language.' : 'Please provide the response in English language.'}` });
                        clearRateLimit();
                        return retry.text;
                    } catch {}
                }
                setRateLimitExceeded();
                return language === 'bn' 
                    ? "**সতর্কতা:** বর্তমানে ঔষধ মিথস্ক্রিয়া পরীক্ষা অক্ষম আছে। অনুগ্রহ করে আপনার ফার্মাসিস্ট বা ডাক্তারের সাথে পরামর্শ করুন।" 
                    : "**Warning:** Drug interaction check is currently unavailable. Please consult with your pharmacist or doctor.";
            }
            return language === 'bn' ? "মিথস্ক্রিয়া পরীক্ষার সময় একটি ত্রুটি ঘটেছে।" : "An error occurred while checking for interactions.";
        }
    },
    getPersonalizedHealthAdvice: async (patient: Patient, prescriptions: Prescription[], question: string, language: 'en' | 'bn' = 'en'): Promise<string> => {
        // Check if rate limit is already exceeded
        if (isRateLimitExceeded()) {
            return language === 'bn' 
                ? "**সতর্কতা:** এআই স্বাস্থ্য পরামর্শ বর্তমানে উপলব্ধ নয়। অনুগ্রহ করে আপনার ডাক্তারের সাথে পরামর্শ করুন।" 
                : "**Warning:** AI health advice is currently unavailable. Please consult with your doctor.";
        }
        
        if (API_KEYS.length === 0 || !ai) return language === 'bn' ? "এপিআই কী কনফিগার করা হয়নি। এআই সহকারী অক্ষম আছে।" : "API Key not configured. AI Assistant is disabled.";
        try {
            const patientDataSummary = `- Vitals: ${patient.vitals.map(v => `${v.label}: ${v.value} ${v.unit}`).join(', ')}\n- Prescriptions: ${prescriptions.flatMap(p => p.items).map(item => item.genericName).join(', ') || 'None'}`;
            
            const disclaimer = language === 'bn' 
                ? "**দাবিত্যাগ:** এটি এআই-জেনারেটেড পরামর্শ এবং পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়। যেকোনো স্বাস্থ্য সমস্যার জন্য দয়া করে যোগ্য স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন।"
                : "**Disclaimer:** This is AI-generated advice and not a substitute for professional medical consultation. Please consult with a qualified healthcare provider for any health concerns.";
            
            const prompt = `You are a helpful AI health advisor. Based on the patient data, provide advice for their question.\n**IMPORTANT**: Your response MUST start with the following disclaimer, exactly as written:\n"${disclaimer}"\n\nPatient Data:\n${patientDataSummary}\n\nPatient's Question: "${question}"\n\nPlease provide a helpful response formatted with simple markdown. ${language === 'bn' ? 'Please provide the response in Bengali language.' : 'Please provide the response in English language.'}`;
            const call = async () => {
                const response = await ai!.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
                return response;
            };
            const response = await call();
            clearRateLimit();
            return response.text;
        } catch (error) { 
            console.error("Error getting health advice:", error);
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                for (let i = 0; i < API_KEYS.length - 1; i++) {
                    if (!rotateKey()) break;
                    try {
                        const retry = await ai!.models.generateContent({ model: "gemini-2.5-flash", contents: `You are a helpful AI health advisor. Based on the patient data, provide advice for their question.\n**IMPORTANT**: Your response MUST start with the following disclaimer, exactly as written:\n"${language === 'bn' ? "**দাবিত্যাগ:** এটি এআই-জেনারেটেড পরামর্শ এবং পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়। যেকোনো স্বাস্থ্য সমস্যার জন্য দয়া করে যোগ্য স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন।" : "**Disclaimer:** This is AI-generated advice and not a substitute for professional medical consultation. Please consult with a qualified healthcare provider for any health concerns."}"\n\nPatient Data:\n${patient.vitals.map(v => `${v.label}: ${v.value} ${v.unit}`).join(', ')}\n- Prescriptions: ${prescriptions.flatMap(p => p.items).map(item => item.genericName).join(', ') || 'None'}\n\nPatient's Question: "${question}"\n\nPlease provide a helpful response formatted with simple markdown. ${language === 'bn' ? 'Please provide the response in Bengali language.' : 'Please provide the response in English language.'}` });
                        clearRateLimit();
                        return retry.text;
                    } catch {}
                }
                setRateLimitExceeded();
                return language === 'bn' 
                    ? "**সতর্কতা:** এআই স্বাস্থ্য পরামর্শ বর্তমানে উপলব্ধ নয়। অনুগ্রহ করে আপনার ডাক্তারের সাথে পরামর্শ করুন।" 
                    : "**Warning:** AI health advice is currently unavailable. Please consult with your doctor.";
            }
            return language === 'bn' ? "স্বাস্থ্য পরামর্শ তৈরির সময় একটি ত্রুটি ঘটেছে।" : "An error occurred while generating health advice.";
        }
    },
    getAutomatedHealthTips: async (patient: Patient, prescriptions: Prescription[], language: 'en' | 'bn' = 'en'): Promise<string[]> => {
        // Check if rate limit is already exceeded
        if (isRateLimitExceeded()) {
            if (!rateLimitMessageShown) {
                rateLimitMessageShown = true;
                return [getRateLimitMessage(language)];
            }
            return getFallbackHealthTips(language);
        }
        
        if (API_KEYS.length === 0 || !ai) return [language === 'bn' ? "এপিআই কী কনফিগার করা হয়নি। স্বাস্থ্য টিপস অক্ষম আছে।" : "API Key not configured. Health tips are disabled."];
        try {
            const vitalSummary = patient.vitals.map(v => `${v.label}: ${v.value} ${v.unit}`).join(', ');
            const prescriptionSummary = prescriptions.flatMap(p => p.items).map(item => item.genericName).join(', ') || 'none';
            
            const patientContext = `Patient Data:\n- Age: ${patient.age}\n- Gender: ${patient.gender}\n- Vitals: ${vitalSummary || 'not available'}\n- Allergies: ${patient.allergies || 'none'}\n- Asthma: ${patient.asthma || 'N/A'}\n- Current Medications: ${prescriptionSummary}`;
            
            const languagePrompt = language === 'bn' 
                ? 'Please provide the response in Bengali language.' 
                : 'Please provide the response in English language.';
            
            const prompt = `Based on the patient data below, provide three brief, actionable health tips as a simple list. ${languagePrompt}`;

            const call = async () => {
                const response = await ai!.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `${patientContext}\n\n${prompt}`,
                    config: {
                        systemInstruction: language === 'bn' 
                            ? "You are an AI health assistant. Your task is to provide health tips based on patient data. Respond ONLY with a simple list of tips in Bengali, with each tip on a new line. Do not add any introductory, concluding, or extra text."
                            : "You are an AI health assistant. Your task is to provide health tips based on patient data. Respond ONLY with a simple list of tips, with each tip on a new line. Do not add any introductory, concluding, or extra text.",
                    },
                });
                return response;
            };
            const response = await call();

            const tips = response.text.trim().split('\n')
                .map(tip => tip.replace(/^- \d*\.?\s*/, '').trim()) 
                .filter(tip => tip.length > 0);
            
            if (tips.length === 0 && response.text.trim().length > 0) return [response.text.trim()];
            if (tips.length === 0) return [language === 'bn' ? "এই মুহূর্তে টিপস তৈরি করা যায়নি।" : "Could not generate tips at this time."];

            return tips;
        } catch (error) { 
            console.error("Error getting automated health tips:", error);
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                if (rotateKey()) {
                    try {
                        const retry = await ai!.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: `${`Patient Data:\n- Age: ${patient.age}\n- Gender: ${patient.gender}\n- Vitals: ${patient.vitals.map(v => `${v.label}: ${v.value} ${v.unit}`).join(', ') || 'not available'}\n- Allergies: ${patient.allergies || 'none'}\n- Asthma: ${patient.asthma || 'N/A'}\n- Current Medications: ${prescriptions.flatMap(p => p.items).map(item => item.genericName).join(', ') || 'none'}`}\n\n${`Based on the patient data below, provide three brief, actionable health tips as a simple list. ${language === 'bn' ? 'Please provide the response in Bengali language.' : 'Please provide the response in English language.'}`}`,
                            config: {
                                systemInstruction: language === 'bn' 
                                    ? "You are an AI health assistant. Your task is to provide health tips based on patient data. Respond ONLY with a simple list of tips in Bengali, with each tip on a new line. Do not add any introductory, concluding, or extra text."
                                    : "You are an AI health assistant. Your task is to provide health tips based on patient data. Respond ONLY with a simple list of tips, with each tip on a new line. Do not add any introductory, concluding, or extra text.",
                            },
                        });
                        const tips = retry.text.trim().split('\n').map(tip => tip.replace(/^- \d*\.?\s*/, '').trim()).filter(tip => tip.length > 0);
                        if (tips.length === 0 && retry.text.trim().length > 0) return [retry.text.trim()];
                        if (tips.length === 0) return [language === 'bn' ? "এই মুহূর্তে টিপস তৈরি করা যায়নি।" : "Could not generate tips at this time."];
                        return tips;
                    } catch (e2) {
                        setRateLimitExceeded();
                        if (!rateLimitMessageShown) {
                            rateLimitMessageShown = true;
                            return [getRateLimitMessage(language)];
                        }
                        return getFallbackHealthTips(language);
                    }
                }
                setRateLimitExceeded();
                if (!rateLimitMessageShown) {
                    rateLimitMessageShown = true;
                    return [getRateLimitMessage(language)];
                }
                return getFallbackHealthTips(language);
            }
            if (typeof error === 'object' && error !== null && 'message' in error) {
                 const errorMessage = (error as Error).message;
                 if (errorMessage.includes("UNAVAILABLE") || errorMessage.includes("503")) {
                     return [language === 'bn' ? "এআই স্বাস্থ্য সহকারী সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।" : "The AI health assistant is temporarily unavailable. Please try again later."];
                 }
            }
            return [language === 'bn' ? "দুঃখিত, স্বাস্থ্য টিপস তৈরির সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Sorry, an error occurred while generating health tips. Please try again."]; 
        }
    },
};
