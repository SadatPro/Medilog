import React, { useState, useEffect, useRef } from 'react';
import { Patient, Prescription } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { geminiService } from '../services/geminiService';
import { IconBrain, IconSpinner } from './icons';

interface HealthAssistantProps {
    patient: Patient;
    prescriptions: Prescription[];
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
}

export const HealthAssistant: React.FC<HealthAssistantProps> = ({ patient, prescriptions }) => {
    const { t } = useTranslations();
    const [tips, setTips] = useState<string[]>([]);
    const [tipsLoading, setTipsLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTips = async () => {
            setTipsLoading(true);
            const generatedTips = await geminiService.getAutomatedHealthTips(patient, prescriptions);
            setTips(generatedTips);
            setTipsLoading(false);
        };
        fetchTips();
    }, [patient, prescriptions]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsSending(true);

        const response = await geminiService.getPersonalizedHealthAdvice(patient, prescriptions, input);
        const aiMessage: Message = { text: response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
        setIsSending(false);
    };

    return (
        <div className="p-6 card-bg rounded-lg shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <IconBrain className="h-6 w-6 text-gray-400" />
                <h2 className="font-plex-mono text-xl text-white">{t('aiHealthAssistant')}</h2>
            </div>
            
            <div className="mb-6">
                <h3 className="font-plex-mono text-base text-gray-400 mb-3">{t('healthTips')}</h3>
                <div className="p-4 list-item-bg rounded-md min-h-[100px]">
                    {tipsLoading ? (
                         <div className="flex items-center justify-center h-full"><IconSpinner className="h-6 w-6 text-gray-500" /></div>
                    ) : (
                         <ul className="space-y-3 text-sm text-gray-300">
                            {tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 w-4 h-4 flex-shrink-0 bg-gray-700 rounded-full border-2 border-gray-600"></div>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div ref={chatBoxRef} className="h-64 overflow-y-auto p-4 list-item-bg rounded-md mb-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`p-3 rounded-lg max-w-md text-sm text-white ${msg.sender === 'user' ? 'bg-gray-800' : 'bg-gray-700'}`}
                             dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}
                        />
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
                    placeholder={t('askAnything')}
                    className="flex-grow px-4 py-2 bg-black border border-gray-700 rounded-md text-sm"
                />
                <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="action-btn flex-shrink-0 px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 font-plex-mono text-sm disabled:bg-gray-900"
                >
                    {isSending ? t('sending') : t('send')}
                </button>
            </div>
        </div>
    );
};