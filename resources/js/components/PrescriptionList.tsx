import React from 'react';
import { PrescriptionItem } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { geminiService } from '../services/geminiService';
import { IconTrash, IconWand, IconNoMedicines, IconSpinner } from './icons';

interface PrescriptionListProps {
    items: PrescriptionItem[];
    onUpdateItems: (items: PrescriptionItem[]) => void;
}

const PrescriptionItemCard: React.FC<{ item: PrescriptionItem; onUpdate: (updatedItem: PrescriptionItem) => void; onRemove: () => void; }> = ({ item, onUpdate, onRemove }) => {
    const { t } = useTranslations();
    const [isSuggesting, setIsSuggesting] = React.useState(false);

    const handleChange = (field: keyof PrescriptionItem, value: string) => {
        onUpdate({ ...item, [field]: value });
    };

    const handleSuggestDosage = async () => {
        setIsSuggesting(true);
        const suggestion = await geminiService.getDosageSuggestion(item);
        if (suggestion) {
            onUpdate({ ...item, ...suggestion });
        }
        setIsSuggesting(false);
    };

    return (
        <div className="p-4 list-item-bg rounded-lg animate-fade-in shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-lg text-white">{item.brandName} <span className="text-base font-normal text-gray-400">({item.genericName})</span></p>
                    <p className="text-sm text-gray-500 font-plex-mono">{item.strength}</p>
                </div>
                <button onClick={onRemove} className="text-gray-500 hover:text-red-500 transition-colors">
                    <IconTrash />
                </button>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="font-plex-mono text-xs text-gray-400">{t('dosage')}</label>
                    <div className="flex items-center">
                        <input type="text" value={item.dosage} onChange={(e) => handleChange('dosage', e.target.value)} className="item-input w-full mt-1 pr-24 pl-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                        <button onClick={handleSuggestDosage} disabled={isSuggesting} className="absolute right-1 top-6 px-2 py-1 bg-gray-700 text-white rounded text-xs font-plex-mono hover:bg-gray-600 transition-colors flex items-center disabled:opacity-50">
                            {isSuggesting ? (
                                <IconSpinner className="h-4 w-4 mr-1" />
                            ) : (
                                <IconWand className="mr-1" />
                            )}
                            <span>{isSuggesting ? t('suggesting') : t('suggestDosage')}</span>
                        </button>
                    </div>
                </div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('frequency')}</label><input type="text" value={item.frequency} onChange={(e) => handleChange('frequency', e.target.value)} className="item-input w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('duration')}</label><input type="text" value={item.duration} onChange={(e) => handleChange('duration', e.target.value)} className="item-input w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('notes')}</label><input type="text" value={item.notes} onChange={(e) => handleChange('notes', e.target.value)} className="item-input w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
            </div>
        </div>
    );
};

export const PrescriptionList: React.FC<PrescriptionListProps> = ({ items, onUpdateItems }) => {
    const { t } = useTranslations();

    const handleUpdateItem = (index: number, updatedItem: PrescriptionItem) => {
        const newItems = [...items];
        newItems[index] = updatedItem;
        onUpdateItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onUpdateItems(newItems);
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-800 rounded-lg">
                <IconNoMedicines className="mx-auto h-10 w-10 text-gray-600" />
                <p className="mt-3 text-lg font-plex-mono text-white">{t('noMedicines')}</p>
                <p className="text-sm text-gray-500">{t('noMedicinesHint')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <PrescriptionItemCard
                    key={item.id}
                    item={item}
                    onUpdate={(updatedItem) => handleUpdateItem(index, updatedItem)}
                    onRemove={() => handleRemoveItem(index)}
                />
            ))}
        </div>
    );
};