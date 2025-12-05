import React, { useState, useEffect } from 'react';
import { PrescriptionItem } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { geminiService } from '../services/geminiService';
import { IconFlask, IconSpinner } from './icons';

interface InteractionCheckerProps {
    items: PrescriptionItem[];
}

export const InteractionChecker: React.FC<InteractionCheckerProps> = ({ items }) => {
    const { t } = useTranslations();
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const medicines = items.map(i => i.genericName);

    useEffect(() => {
        // Reset when items change
        setResult('');
        setShowResult(false);
    }, [items]);

    const handleCheck = async () => {
        setIsLoading(true);
        setShowResult(true);
        const interactionResult = await geminiService.checkInteractions(medicines);
        setResult(interactionResult);
        setIsLoading(false);
    };

    if (medicines.length < 2) {
        return (
            <div className="p-4 border-2 border-dashed border-gray-800 rounded-lg text-center">
                <p className="font-plex-mono text-sm text-gray-500">{t('interactionHint')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 list-item-bg rounded-lg shadow-lg">
            {!showResult ? (
                <button
                    onClick={handleCheck}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors font-plex-mono text-sm"
                >
                    <IconFlask />
                    <span>{t('checkInteractions')}</span>
                </button>
            ) : (
                <div>
                    <h3 className="font-plex-mono text-lg text-white mb-2">{t('interactionAnalysis')}</h3>
                    <div className="prose prose-sm max-w-none p-3 bg-black rounded-md min-h-[100px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                               <IconSpinner className="h-6 w-6 text-gray-400" />
                            </div>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />').replace(/###\s*(.*?)\s*<br \/>/g, '<h4>$1</h4>') }} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};