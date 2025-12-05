import React, { useState } from 'react';
import { Patient } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';
import { IconSpinner, IconTrash } from '../icons';

interface EditConditionsModalProps {
    patient: Patient;
    onClose: () => void;
    onUpdate: () => void;
}

export const EditConditionsModal: React.FC<EditConditionsModalProps> = ({ patient, onClose, onUpdate }) => {
    const { t } = useTranslations();
    const [isUpdating, setIsUpdating] = useState(false);
    const [conditions, setConditions] = useState(patient.majorConditions || []);
    const [newCondition, setNewCondition] = useState('');

    const handleAddCondition = () => {
        if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
            setConditions(prev => [...prev, newCondition.trim()]);
            setNewCondition('');
        }
    };

    const handleRemoveCondition = (conditionToRemove: string) => {
        setConditions(prev => prev.filter(c => c !== conditionToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        
        try {
            await apiService.updatePatientProfile(patient.id, { majorConditions: conditions });
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error("Failed to update conditions", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                         <h2 className="font-plex-mono text-xl text-white">{t('editConditions')}</h2>
                         <p className="text-sm text-gray-500">Manage major health conditions.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-2xl -mt-2">&times;</button>
                </div>
                
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCondition(); }}}
                            placeholder={t('addCondition')}
                            className="flex-grow px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleAddCondition}
                            className="action-btn px-4 py-2 bg-white text-black rounded-md font-semibold text-sm hover:bg-gray-300 transition-colors"
                        >
                            {t('add')}
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {conditions.length > 0 ? conditions.map(condition => (
                             <div key={condition} className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md animate-fade-in">
                                <span className="text-sm text-gray-300">{condition}</span>
                                <button type="button" onClick={() => handleRemoveCondition(condition)} className="text-gray-500 hover:text-red-500">
                                    <IconTrash />
                                </button>
                            </div>
                        )) : <p className="text-sm text-center text-gray-500 py-4">{t('noMajorConditions')}</p>}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{t('cancel')}</button>
                    <button type="submit" disabled={isUpdating} className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold disabled:bg-gray-900 flex items-center justify-center">
                        {isUpdating && <IconSpinner className="h-4 w-4 mr-2" />}
                        {isUpdating ? t('updating') : t('updateConditions')}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};