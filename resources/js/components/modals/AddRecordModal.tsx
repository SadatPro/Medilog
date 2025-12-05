


import React, { useState } from 'react';
import { Patient, MedicalRecordType, MedicalRecordFile } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService, createMedicalRecordFile } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';
import { IconSpinner } from '../icons';

interface AddRecordModalProps {
    patient: Patient;
    onClose: () => void;
    onUpdate: () => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ patient, onClose, onUpdate }) => {
    const { t } = useTranslations();
    const [isSaving, setIsSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        let recordFile: MedicalRecordFile | undefined;
        if (file) {
            recordFile = await createMedicalRecordFile(file);
        }

        const newRecord = {
            type: formData.get('type') as MedicalRecordType,
            name: formData.get('name') as string,
            institution: formData.get('institution') as string,
            date: formData.get('date') as string,
            file: recordFile,
        };

        try {
            await apiService.addMedicalRecord(patient.id, newRecord);
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to add medical record", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="font-plex-mono text-xl text-white mb-4">{t('addMedicalRecord')}</h2>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('recordType')}</label><select name="type" required defaultValue="" className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"><option value="" disabled>{t('selectType')}</option><option value="X-ray">{t('xray')}</option><option value="CT Scan">{t('ctscan')}</option><option value="MRI">{t('mri')}</option><option value="Lab Report">{t('labReport')}</option><option value="Other">Other</option></select></div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('recordName')}</label><input name="name" type="text" placeholder={t('recordName')} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('institutionName')}</label><input name="institution" type="text" placeholder={t('institutionName')} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('recordDate')}</label><input name="date" type="date" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('uploadFile')}</label><input name="file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="image/*,application/pdf" className="w-full mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600" /></div>
                <div className="pt-4 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{t('cancel')}</button>
                    <button type="submit" disabled={isSaving} className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold disabled:bg-gray-900 flex items-center justify-center">
                        {isSaving && <IconSpinner className="h-4 w-4 mr-2" />}
                        {isSaving ? t('saving') : t('save')}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};