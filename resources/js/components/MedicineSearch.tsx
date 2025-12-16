

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '../contexts/TranslationContext';
import { geminiService } from '../services/geminiService';
import { Medicine, PrescriptionItem } from '../types';
import { IconSpinner } from './icons';
import { OFFLINE_MEDICINES } from '../data/offlineMedicines';

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

    const offlineSearch = useCallback((q: string): Medicine[] => {
        const s = q.trim().toLowerCase();
        if (!s) return [];
        return OFFLINE_MEDICINES.filter(m => 
            m.brandName.toLowerCase().includes(s) || 
            m.genericName.toLowerCase().includes(s)
        ).slice(0, 8);
    }, []);

    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        const local = offlineSearch(searchQuery);
        if (searchQuery.length < 3) {
            setSuggestions(local.length ? local : OFFLINE_MEDICINES.slice(0, 8));
            return;
        }
        setIsLoading(true);
        const online = await geminiService.suggestMedicines(searchQuery);
        const merged: Medicine[] = [];
        const seen = new Set<string>();
        [...local, ...online].forEach(m => {
            const key = `${m.brandName.toLowerCase()}|${m.genericName.toLowerCase()}|${m.strength.toLowerCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(m);
            }
        });
        setSuggestions(merged.slice(0, 10));
        setIsLoading(false);
    }, [offlineSearch]);

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
                className="w-full pl-4 pr-10 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all duration-300"
            />
            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg border border-purple-500/50 rounded-lg z-10 max-h-60 overflow-y-auto shadow-2xl">
                    {isLoading ? (
                        <div className="p-3 text-sm text-purple-200 font-plex-mono flex items-center justify-center gap-2">
                            <IconSpinner className="h-4 w-4 animate-spin text-purple-400" />
                            <span className="text-purple-300">{t('loading')}...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((med, index) => (
                            <div
                                key={`${med.brandName}-${index}`}
                                onClick={() => handleSelect(med)}
                                className="p-4 hover:bg-gradient-to-r hover:from-purple-800/60 hover:to-blue-800/60 cursor-pointer border-b border-purple-500/30 last:border-b-0 transition-all duration-200"
                            >
                                <p className="font-semibold text-white">
                                    {med.brandName} <span className="text-sm font-normal text-purple-300">({med.genericName})</span>
                                </p>
                                <p className="text-xs text-purple-200 font-plex-mono mt-1">{med.strength}</p>
                            </div>
                        ))
                    ) : query.length >= 3 ? (
                        <div className="p-3 text-sm text-purple-200 font-plex-mono">{t('noSuggestions')}</div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
