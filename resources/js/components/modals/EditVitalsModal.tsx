import React, { useState } from 'react';
import { Patient, Vital } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';
import { IconSpinner } from '../icons';

interface EditVitalsModalProps {
    patient: Patient;
    onClose: () => void;
    onUpdate: () => void;
}

export const EditVitalsModal: React.FC<EditVitalsModalProps> = ({ patient, onClose, onUpdate }) => {
    const { t } = useTranslations();
    const [isUpdating, setIsUpdating] = useState(false);

    const getInitialVital = (label: string) => patient.vitals.find(v => v.label === label)?.value || '';
    
    const [formData, setFormData] = useState({
        bloodPressure: getInitialVital('Blood Pressure'),
        bloodGlucose: getInitialVital('Blood Glucose'),
        pulse: getInitialVital('Pulse'),
        spo2: getInitialVital('SpO2'),
        bloodGroup: patient.bloodGroup || '',
        asthma: patient.asthma || 'No',
        allergies: patient.allergies || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        
        const newVitals: Vital[] = [
            { label: 'Blood Pressure', value: formData.bloodPressure, unit: 'mmHg', date: new Date().toISOString() },
            { label: 'Blood Glucose', value: formData.bloodGlucose, unit: 'mmol/L', date: new Date().toISOString() },
            { label: 'Pulse', value: formData.pulse, unit: 'bpm', date: new Date().toISOString() },
            { label: 'SpO2', value: formData.spo2, unit: '%', date: new Date().toISOString() },
        ].filter(v => v.value);
        
        const updates: Partial<Patient> = { 
            vitals: newVitals,
            bloodGroup: formData.bloodGroup, 
            allergies: formData.allergies, 
            asthma: formData.asthma as Patient['asthma'],
        };
        
        try {
            await apiService.updatePatientProfile(patient.id, updates);
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error("Failed to update health info", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} className="w-full max-w-lg">
            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                         <h2 className="font-plex-mono text-xl text-white">{t('updateHealthInfo')}</h2>
                         <p className="text-sm text-gray-500">Update vitals and other health information.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-2xl -mt-2">&times;</button>
                </div>
                
                <fieldset className="space-y-4">
                    <legend className="sr-only">Health Info</legend>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('bloodPressure')}</label><input name="bloodPressure" type="text" value={formData.bloodPressure} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('bloodGlucose')}</label><input name="bloodGlucose" type="text" value={formData.bloodGlucose} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('pulse')}</label><input name="pulse" type="text" value={formData.pulse} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('spo2')}</label><input name="spo2" type="text" value={formData.spo2} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('bloodGroup')}</label><input name="bloodGroup" type="text" value={formData.bloodGroup} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('asthma')}</label><select name="asthma" value={formData.asthma} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"><option value="No">No</option><option value="Yes">Yes</option></select></div>
                        <div className="sm:col-span-2"><label className="font-plex-mono text-xs text-gray-400">{t('allergies')}</label><input name="allergies" type="text" value={formData.allergies} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                     </div>
                </fieldset>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{t('cancel')}</button>
                    <button type="submit" disabled={isUpdating} className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold disabled:bg-gray-900 flex items-center justify-center">
                        {isUpdating && <IconSpinner className="h-4 w-4 mr-2" />}
                        {isUpdating ? t('updating') : t('update')}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};