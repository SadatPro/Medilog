import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Patient, Prescription } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { geminiService } from '../services/geminiService';
import { IconSpinner } from './icons';
import { FaRobot } from 'react-icons/fa';

interface HealthAssistantProps {
    patient: Patient;
    prescriptions: Prescription[];
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
}

export const HealthAssistant: React.FC<HealthAssistantProps> = ({ patient, prescriptions }) => {
    const { t, language } = useTranslations();
    const [tips, setTips] = useState<string[]>([]);
    const [tipsLoading, setTipsLoading] = useState(true);
    const [tipsError, setTipsError] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [chatError, setChatError] = useState<string>('');
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const lastTipsAtRef = useRef<number>(0);
    const tipsDigestRef = useRef<string>('');
    const TIPS_MIN_INTERVAL_MS = 10 * 60 * 1000;

    // Memoized function to prevent infinite loops
    const fetchTips = useCallback(async () => {
        setTipsLoading(true);
        setTipsError('');
        try {
            const generatedTips = await geminiService.getAutomatedHealthTips(patient, prescriptions, language);
            setTips(generatedTips);
        } catch (error) {
            console.error("Error fetching health tips:", error);
            const errorMessage = language === 'bn' 
                ? "স্বাস্থ্য টিপস লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।" 
                : "Failed to load health tips. Please try again.";
            setTips([errorMessage]);
            setTipsError(errorMessage);
        } finally {
            setTipsLoading(false);
        }
    }, [patient, prescriptions, language]);

    const fetchTipsThrottled = useCallback(async () => {
        const now = Date.now();
        const digest = JSON.stringify({
            vitals: patient.vitals,
            presLen: prescriptions.length,
            lang: language
        });
        const tooSoon = now - lastTipsAtRef.current < TIPS_MIN_INTERVAL_MS;
        const unchanged = tipsDigestRef.current === digest;
        if (tooSoon && unchanged) {
            setTipsLoading(false);
            return;
        }
        tipsDigestRef.current = digest;
        lastTipsAtRef.current = now;
        await fetchTips();
    }, [patient.vitals, prescriptions.length, language, fetchTips]);

    useEffect(() => {
        // Only fetch tips once when component mounts or when patient/prescriptions actually change
        fetchTipsThrottled();
    }, [fetchTipsThrottled]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        setChatError('');
        const userMessage: Message = { text: input.trim(), sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsSending(true);

        try {
            const response = await geminiService.getPersonalizedHealthAdvice(patient, prescriptions, input.trim(), language);
            const aiMessage: Message = { text: response, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error getting health advice:", error);
            const errorMessage = language === 'bn' 
                ? "দুঃখিত, পরামর্শ পেতে ব্যর্থ হয়েছি। অনুগ্রহ করে আবার চেষ্টা করুন।" 
                : "Sorry, I couldn't get advice. Please try again.";
            const aiErrorMessage: Message = { text: errorMessage, sender: 'ai' };
            setMessages(prev => [...prev, aiErrorMessage]);
            setChatError(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleRetryTips = () => {
        lastTipsAtRef.current = 0;
        fetchTipsThrottled();
    };

    return (
        <div className="health-assistant">
            <div className="assistant-header">
                <FaRobot className="header-icon" />
                <h2>{t('healthAssistant')}</h2>
            </div>
            
            <div className="tips-section">
                <h3>{t('dailyTips')}</h3>
                {tipsLoading ? (
                    <div className="loading-tips">
                        <IconSpinner className="spinner" />
                        <span>{t('generatingTips')}</span>
                    </div>
                ) : tipsError ? (
                    <div className="tips-error">
                        <div className="error-icon">⚠️</div>
                        <div className="error-content">
                            <p className="error-message">{tipsError}</p>
                            <button 
                                onClick={handleRetryTips} 
                                className="retry-button"
                                disabled={tipsLoading}
                            >
                                {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="tips-list">
                        {tips.map((tip, index) => (
                            <div key={index} className="tip-item">
                                <span className="tip-number">{index + 1}.</span>
                                <span className="tip-text">{tip}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="chat-section">
                <h3>{t('askAQuestion')}</h3>
                <div className="chat-container">
                    <div className="chat-messages" ref={chatBoxRef}>
                        {messages.length === 0 ? (
                            <div className="chat-empty">
                                <div className="empty-icon">🤖</div>
                                <p>{t('askHealthQuestion')}</p>
                                <small className="empty-hint">
                                    {language === 'bn' 
                                        ? "আপনার স্বাস্থ্য-সম্পর্কিত প্রশ্ন টাইপ করুন এবং এন্টার চাপুন" 
                                        : "Type your health-related question and press Enter"}
                                </small>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div key={index} className={`message ${message.sender}`}>
                                    <div className="message-bubble">
                                        {message.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {isSending && (
                            <div className="message ai">
                                <div className="message-bubble">
                                    <IconSpinner className="spinner-small" />
                                    <span>{t('thinking')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="chat-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={t('typeYourQuestion')}
                            rows={2}
                            disabled={isSending}
                            maxLength={500}
                        />
                        <div className="input-meta">
                            <span className="char-count">{input.length}/500</span>
                            {chatError && <span className="chat-error">{chatError}</span>}
                        </div>
                        <button 
                            onClick={handleSend} 
                            disabled={!input.trim() || isSending}
                            className="send-button"
                        >
                            {isSending ? <IconSpinner className="spinner-small" /> : t('send')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
