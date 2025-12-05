

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '../contexts/TranslationContext';
import { geminiService } from '../services/geminiService';
import { Medicine, PrescriptionItem } from '../types';
import { IconSpinner } from './icons';

interface MedicineSearchProps {
    onAddItem: (item: PrescriptionItem) => void;
}

export const MedicineSearch: React.FC<MedicineSearchProps> = ({ onAddItem }) => {
    const { t } = useTranslations();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Medicine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        const results = await geminiService.suggestMedicines(searchQuery);
        setSuggestions(results);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [query, fetchSuggestions]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (med: Medicine) => {
        const newItem: PrescriptionItem = {
            ...med,
            id: `new-${Date.now()}`,
            dosage: '',
            frequency: '',
            duration: '',
            notes: ''
        };
        onAddItem(newItem);
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setShowSuggestions(true);
    }

    return (
        <div className="relative" ref={searchRef}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t('searchMedicine')}
                className="w-full pl-4 pr-10 py-3 bg-[#111] border border-gray-800 rounded-lg"
            />
            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-gray-800 rounded-lg z-10 max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-3 text-sm text-gray-400 font-plex-mono flex items-center justify-center gap-2">
                            <IconSpinner className="h-4 w-4" />
                            <span>{t('loading')}...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((med, index) => (
                            <div
                                key={`${med.brandName}-${index}`}
                                onClick={() => handleSelect(med)}
                                className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700 last:border-b-0"
                            >
                                <p className="font-semibold text-white">
                                    {med.brandName} <span className="text-sm font-normal text-gray-400">({med.genericName})</span>
                                </p>
                                <p className="text-xs text-gray-500 font-plex-mono">{med.strength}</p>
                            </div>
                        ))
                    ) : query.length >= 3 ? (
                        <div className="p-3 text-sm text-gray-400 font-plex-mono">{t('noSuggestions')}</div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
