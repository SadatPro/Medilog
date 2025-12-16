import React, { useState, useEffect } from 'react';
import { PrescriptionItem } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { geminiService } from '../services/geminiService';
import { IconFlask, IconSpinner } from './icons';

interface InteractionCheckerProps {
    items: PrescriptionItem[];
}

export const InteractionChecker: React.FC<InteractionCheckerProps> = ({ items }) => {
    const { t, language } = useTranslations();
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [error, setError] = useState('');

    const medicines = items.map(i => i.genericName);
    const formatResult = (s: string) =>
        s
            .replace(/\n/g, '<br />')
            .replace(/###\s*(.*?)\s*<br \/>/g, '<h4 class="text-purple-300 font-bold">$1</h4>');

    useEffect(() => {
        // Reset when items change
        setResult('');
        setShowResult(false);
    }, [items]);

    const handleCheck = async () => {
        setIsLoading(true);
        setShowResult(true);
        setError('');
        try {
            const interactionResult = await geminiService.checkInteractions(medicines, language);
            setResult(interactionResult);
        } catch (e) {
            const msg = language === 'bn' 
                ? 'দুঃখিত, ইন্টারঅ্যাকশন চেক করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
                : 'Sorry, interaction check failed. Please try again.';
            setError(msg);
            setResult('');
        } finally {
            setIsLoading(false);
        }
    };

    if (medicines.length < 2) {
        return (
            <div className="p-6 border-2 border-dashed border-purple-500/50 rounded-lg text-center bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <IconFlask className="h-6 w-6 text-white" />
                </div>
                <p className="font-plex-mono text-sm text-purple-200">{t('interactionHint')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 list-item-bg rounded-lg shadow-lg">
            {!showResult ? (
                <button
                    onClick={handleCheck}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-500 hover:to-blue-500 transition-all duration-300 font-plex-mono text-sm text-white font-semibold shadow-lg hover:shadow-xl"
                >
                    <IconFlask />
                    <span>{t('checkInteractions')}</span>
                </button>
            ) : (
                <div>
                    <h3 className="font-plex-mono text-lg text-white mb-2">{t('interactionAnalysis')}</h3>
                    <div className="prose prose-sm max-w-none p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-md min-h-[100px] border border-purple-500/30">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <IconSpinner className="h-6 w-6 text-purple-400 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="space-y-3">
                                <p className="text-red-400 font-plex-mono text-sm">{error}</p>
                                <button
                                    onClick={handleCheck}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-md hover:from-red-500 hover:to-red-600 transition-all duration-300 font-plex-mono text-sm text-white font-semibold"
                                >
                                    {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-white" dangerouslySetInnerHTML={{ __html: formatResult(result) }} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
