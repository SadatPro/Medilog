import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Language } from '../types';

const translations = {
  en: {
    portalLogin: "Medilog Login", loginAsDoctor: "Doctor", loginAsPatient: "Patient", logout: "Logout",
    patientId: "Username", age: "Age", years: "years", gender: "Gender", female: "Female", male: "Male", other: "Other",
    searchForPatient: "Search for Patient", enterPatientId: "Enter Username...", search: "Search", searching: "Searching...", patientNotFound: "Patient not found.",
    accessStatus: "Access Status", noAccess: "No Access", accessPending: "Access Requested", accessGranted: "Access Granted",
    requestAccess: "Request Access", requesting: "Requesting...", composePrescription: "Compose Prescription",
    searchMedicine: "Search Medicine (Brand/Generic)", loading: "Loading", noSuggestions: "No suggestions found.",
    noMedicines: "No medicines added yet.", noMedicinesHint: "Use the search bar above to add medicines.",
    suggestDosage: "Suggest", suggesting: "Suggesting...", dosage: "Dosage", frequency: "Frequency", duration: "Duration", notes: "Notes",
    checkInteractions: "Check for Interactions", analyzing: "Analyzing...", interactionHint: "Add at least two medicines to check.",
    interactionAnalysis: "Interaction Analysis", saveDraft: "Save Draft", finalizePrint: "Finalize & Print",
    prescriptionPreview: "Prescription Preview", print: "Print", signature: "Signature", patientName: "Patient Name", date: "Date",
    vitalsSummary: "Vitals Summary", bloodPressure: "Blood Pressure", bloodGlucose: "Blood Glucose", pulse: "Pulse", spo2: "SpO2",
    prescriptionHistory: "Prescription History", noPrescriptions: "No prescriptions found.", noPrescriptionsHint: "Prescriptions written by doctors will appear here.",
    medicalRecords: "Medical Records", uploadRecord: "Upload Record", noRecords: "No reports found.", noRecordsHint: "Uploaded medical and prescription records will appear here.",
    addMedicalRecord: "Add Medical Record", recordType: "Record Type", recordName: "Record Name (e.g., CBC Report)", recordDate: "Record Date",
    save: "Save", saving: "Saving...", cancel: "Cancel", selectType: "Select Type",
    xray: "X-ray", ctscan: "CT Scan", mri: "MRI", labReport: "Lab Report",
    aiHealthAssistant: "AI Health Assistant", askAnything: "Ask anything about your health...", send: "Send", sending: "Sending...",
    healthTips: "Automated Health Tips",
    accessRequests: "Access Requests", noRequests: "No pending requests.", noRequestsHint: "Pending access requests from doctors will appear here.",
    approve: "Approve", decline: "Decline",
    bloodGroup: "Blood Group", allergies: "Allergies", asthma: "Asthma",
    editProfile: "Edit Profile",
    updateProfile: "Update Profile",
    updateHealthInfo: "Update Health Info",
    noAccount: "Don't have an account?", registerHere: "Register here", createAccount: "Create an Account",
    registerAsDoctor: "Register as Doctor", registerAsPatient: "Register as Patient", hasAccount: "Already have an account?",
    loginHere: "Login here", name: "Name", specialization: "Specialization", register: "Register", registering: "Registering...",
    phone: "Phone Number", email: "Email Address", password: "Password",
    uploadFile: "Upload File (Image/PDF)", file: "File", viewFile: "View File", close: "Close",
    uploadImage: "Upload Image",
    prescriptionRecords: "Prescription Records", noPrescriptionRecords: "No prescription records found.", uploadPrescription: "Upload Prescription",
    addPrescriptionRecord: "Add Prescription Record", prescriptionName: "Prescription Name (e.g., Dr. Smith's Rx)",
    forgotPassword: "Forgot Password?", resetPassword: "Reset Password", resetLinkSent: "If an account exists for this email, a reset link has been sent.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    retypeNewPassword: "Retype New Password",
    passwordMismatch: "New passwords do not match.",
    incorrectPassword: "Incorrect current password.",
    passwordNote: "Leave fields blank to keep current password",
    changePassword: "Change Password",
    currentPasswordRequired: "Please enter your current password to set a new one.",
    dateOfBirth: "Date of Birth",
    nidNumber: "NID Number",
    investigations: "Investigations",
    advice: "Advice",
    followUp: "Follow-up",
    addInvestigation: "Add Investigation (e.g., CBC, X-ray Chest)",
    addAdvice: "Add Advice (e.g., Bed rest, Drink water)",
    add: "Add",
    recheckupTime: "Recheckup Time (e.g., After 7 days)",
    saveAndPrint: "Save & Print",
    findings: "Findings",
    addFinding: "Add Finding",
    selectRecord: "Select a record to comment on",
    comment: "Comment / Impression",
    noRecordsToComment: "No records available to comment on.",
    institutionName: "Institution Name",
    majorConditions: "Major Conditions",
    editVitals: "Edit Vitals",
    editConditions: "Edit Conditions",
    addCondition: "Add Condition",
    noMajorConditions: "No major conditions listed.",
    updateConditions: "Update Conditions",
    update: "Update",
    updating: "Updating...",
    login: "Login",
    invalidCredentials: "Invalid credentials. Please try again.",
    patientHistory: "Patient History",
    viewDetails: "View Details",
    prescriptions: "Prescriptions",
    reports: "Reports",
    nextPage: "Next Page",
    previousPage: "Previous Page",
  },
  bn: {
    portalLogin: "Medilog লগইন", loginAsDoctor: "ডাক্তার", loginAsPatient: "রোগী", logout: "লগআউট",
    patientId: "ইউজারনেম", age: "বয়স", years: "বছর", gender: "লিঙ্গ", female: "মহিলা", male: "পুরুষ", other: "অন্যান্য",
    searchForPatient: "রোগী অনুসন্ধান করুন", enterPatientId: "ইউজারনেম লিখুন...", search: "অনুসন্ধান", searching: "অনুসন্ধান করা হচ্ছে...", patientNotFound: "রোগী পাওয়া যায়নি।",
    accessStatus: "অ্যাক্সেসের স্থিতি", noAccess: "কোনো অ্যাক্সেস নেই", accessPending: "অ্যাক্সেসের অনুরোধ করা হয়েছে", accessGranted: "অ্যাক্সেস অনুমোদিত",
    requestAccess: "অ্যাক্সেসের জন্য অনুরোধ", requesting: "অনুরোধ করা হচ্ছে...", composePrescription: "প্রেসক্রিপশন রচনা করুন",
    searchMedicine: "ওষুধ খুঁজুন (ব্র্যান্ড/জেনেরিক)", loading: "লোড হচ্ছে", noSuggestions: "কোনো পরামর্শ পাওয়া যায়নি।",
    noMedicines: "এখনো কোনো ওষুধ যোগ করা হয়নি।", noMedicinesHint: "ওষুধ যোগ করতে উপরের সার্চ বার ব্যবহার করুন।",
    suggestDosage: "পরামর্শ দিন", suggesting: "পরামর্শ দেওয়া হচ্ছে...", dosage: "ডোজ", frequency: "পুনরাবৃত্তি", duration: "সময়কাল", notes: "মন্তব্য",
    checkInteractions: "মিথস্ক্রিয়া পরীক্ষা করুন", analyzing: "বিশ্লেষণ করা হচ্ছে...", interactionHint: "পরীক্ষা করার জন্য কমপক্ষে দুটি ওষুধ যোগ করুন।",
    interactionAnalysis: "মিথস্ক্রিয়া বিশ্লেষণ", saveDraft: "খসড়া সংরক্ষণ করুন", finalizePrint: "চূড়ান্ত ও মুদ্রণ করুন",
    prescriptionPreview: "প্রেসক্রিপশন প্রিভিউ", print: "প্রিন্ট", signature: "স্বাক্ষর", patientName: "রোগীর নাম", date: "তারিখ",
    vitalsSummary: "স্বাস্থ্য সারসংক্ষেপ", bloodPressure: "রক্তচাপ", bloodGlucose: "রক্তে শর্করা", pulse: "পালস", spo2: "SpO2",
    prescriptionHistory: "প্রেসক্রিপশনের ইতিহাস", noPrescriptions: "কোনো প্রেসক্রিপশন পাওয়া যায়নি।", noPrescriptionsHint: "ডাক্তারদের লেখা প্রেসক্রিপশন এখানে দেখা যাবে।",
    medicalRecords: "মেডিকেল রেকর্ডস", uploadRecord: "রেকর্ড আপলোড করুন", noRecords: "কোনো রিপোর্ট পাওয়া যায়নি।", noRecordsHint: "আপলোড করা মেডিকেল এবং প্রেসক্রিপশন রেকর্ড এখানে দেখা যাবে।",
    addMedicalRecord: "মেডিকেল রেকর্ড যোগ করুন", recordType: "রেকর্ডের ধরন", recordName: "রেকর্ডের নাম (যেমন, সিবিসি রিপোর্ট)", recordDate: "রেকর্ডের তারিখ",
    save: "সংরক্ষণ", saving: "সংরক্ষণ করা হচ্ছে...", cancel: "বাতিল", selectType: "ধরন নির্বাচন করুন",
    xray: "এক্স-রে", ctscan: "সিটি স্ক্যান", mri: "এমআরআই", labReport: "ল্যাব রিপোর্ট",
    aiHealthAssistant: "এআই স্বাস্থ্য সহকারী", askAnything: "আপনার স্বাস্থ্য সম্পর্কে কিছু জিজ্ঞাসা করুন...", send: "পাঠান", sending: "পাঠানো হচ্ছে...",
    healthTips: "স্বয়ংক্রিয় স্বাস্থ্য টিপস",
    accessRequests: "অ্যাক্সেস অনুরোধ", noRequests: "কোনো অপেক্ষমাণ অনুরোধ নেই।", noRequestsHint: "ডাক্তারদের কাছ থেকে অ্যাক্সেসের অনুরোধ এখানে দেখা যাবে।",
    approve: "অনুমোদন", decline: "প্রত্যাখ্যান",
    bloodGroup: "রক্তের গ্রুপ", allergies: "অ্যালার্জি", asthma: "হাঁপানি",
    editProfile: "প্রোফাইল সম্পাদনা করুন",
    updateProfile: "প্রোফাইল আপডেট করুন", updateHealthInfo: "স্বাস্থ্য তথ্য আপডেট করুন",
    noAccount: "অ্যাকাউন্ট নেই?", registerHere: "এখানে নিবন্ধন করুন", createAccount: "অ্যাকউন্ট তৈরি করুন",
    registerAsDoctor: "ডাক্তার হিসেবে নিবন্ধন করুন", registerAsPatient: "রোগী হিসেবে নিবন্ধন করুন", hasAccount: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
    loginHere: "এখানে লগইন করুন", name: "নাম", specialization: "বিশেষত্ব", register: "নিবন্ধন করুন", registering: "নিবন্ধন করা হচ্ছে...",
    phone: "ফোন নম্বর", email: "ইমেল ঠিকানা", password: "পাসওয়ার্ড",
    uploadFile: "ফাইল আপলোড করুন (ছবি/পিডিএফ)", file: "ফাইল", viewFile: "ফাইল দেখুন", close: "বন্ধ করুন",
    uploadImage: "ছবি আপলোড করুন",
    prescriptionRecords: "প্রেসক্রিপশন রেকর্ড", noPrescriptionRecords: "কোনো প্রেসক্রিপশন রেকর্ড পাওয়া যায়নি।", uploadPrescription: "প্রেসক্রিপশন আপলোড করুন",
    addPrescriptionRecord: "প্রেসক্রিপশন রেকর্ড যোগ করুন", prescriptionName: "প্রেসক্রিপশনের নাম (যেমন, ডাঃ স্মিথের প্রেসক্রিপশন)",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?", resetPassword: "পাসওয়ার্ড রিসেট করুন", resetLinkSent: "এই ইমেলের জন্য যদি একটি অ্যাকাউন্ট বিদ্যমান থাকে, একটি রিসেট লিঙ্ক পাঠানো হয়েছে।",
    currentPassword: "বর্তমান পাসওয়ার্ড",
    newPassword: "নতুন পাসওয়ার্ড",
    retypeNewPassword: "নতুন পাসওয়ার্ড পুনরায় টাইপ করুন",
    passwordMismatch: "নতুন পাসওয়ার্ড মেলেনি।",
    incorrectPassword: "বর্তমান পাসওয়ার্ড ভুল।",
    passwordNote: "বর্তমান পাসওয়ার্ড রাখতে খালি রাখুন",
    changePassword: "পাসওয়ার্ড পরিবর্তন করুন",
    currentPasswordRequired: "নতুন পাসওয়ার্ড সেট করতে আপনার বর্তমান পাসওয়ার্ড লিখুন।",
    dateOfBirth: "জন্ম তারিখ",
    nidNumber: "এনআইডি নম্বর",
    investigations: "ইনভেস্টিগেশন",
    advice: "পরামর্শ",
    followUp: "ফলো-আপ",
    addInvestigation: "ইনভেস্টিগেশন যোগ করুন (যেমন, সিবিসি, এক্স-রে)",
    addAdvice: "পরামর্শ যোগ করুন (যেমন, বিশ্রাম, জল পান)",
    add: "যোগ করুন",
    recheckupTime: "পুনরায় পরীক্ষার সময় (যেমন, ৭ দিন পর)",
    saveAndPrint: "সংরক্ষণ ও প্রিন্ট করুন",
    findings: "পর্যবেক্ষণ",
    addFinding: "পর্যবেক্ষণ যোগ করুন",
    selectRecord: "মন্তব্য করার জন্য একটি রেকর্ড নির্বাচন করুন",
    comment: "মন্তব্য / পর্যবেক্ষণ",
    noRecordsToComment: "মন্তব্য করার জন্য কোনো রেকর্ড উপলব্ধ নেই।",
    institutionName: "প্রতিষ্ঠানের নাম",
    majorConditions: "প্রধান স্বাস্থ্য সমস্যা",
    editVitals: "স্বাস্থ্য তথ্য সম্পাদনা করুন",
    editConditions: "স্বাস্থ্য সমস্যা সম্পাদনা করুন",
    addCondition: "স্বাস্থ্য সমস্যা যোগ করুন",
    noMajorConditions: "কোনো প্রধান স্বাস্থ্য সমস্যা তালিকাভুক্ত নেই।",
    updateConditions: "স্বাস্থ্য সমস্যা আপডেট করুন",
    update: "আপডেট",
    updating: "আপডেট করা হচ্ছে...",
    login: "লগইন",
    invalidCredentials: "ভুল তথ্য। আবার চেষ্টা করুন।",
    patientHistory: "রোগীর ইতিহাস",
    viewDetails: "বিস্তারিত দেখুন",
    prescriptions: "প্রেসক্রিপশন",
    reports: "রিপোর্ট",
    nextPage: "পরবর্তী পৃষ্ঠা",
    previousPage: "পূর্ববর্তী পৃষ্ঠা",
  },
};

// FIX: Export `TranslationKey` to be used in other components.
export type TranslationKey = keyof typeof translations.en;

interface TranslationContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode; language: Language; setLanguage: (lang: Language) => void; }> = ({ children, language, setLanguage }) => {
    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations.en[key];
    };
    
    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage]);

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslations = (): TranslationContextType => {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error('useTranslations must be used within a TranslationProvider');
    }
    return context;
};
