import React, { useState } from 'react';
import { Patient, MedicalRecordFile } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { AddPrescriptionRecordModal } from './modals/AddPrescriptionRecordModal';
import { FileViewerModal } from './modals/FileViewerModal';
import { IconDocument } from './icons';

interface PrescriptionRecordsCardProps {
    patient: Patient;
    userType: 'doctor' | 'patient';
    onUpdate?: () => void;
}

export const PrescriptionRecordsCard: React.FC<PrescriptionRecordsCardProps> = ({ patient, userType, onUpdate }) => {
    const { t } = useTranslations();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState<MedicalRecordFile | null>(null);
    const records = patient.prescriptionRecords;

    return (
        <>
            <div className="p-6 card-bg rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-plex-mono text-xl text-white">{t('prescriptionRecords')}</h2>
                    {userType === 'patient' && (
                        <button onClick={() => setIsAddModalOpen(true)} className="px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-xs font-plex-mono">
                            {t('uploadPrescription')}
                        </button>
                    )}
                </div>
                {records.length === 0 ? (
                    <p className="text-sm text-gray-500 font-plex-mono">{t('noPrescriptionRecords')}</p>
                ) : (
                    <ul className="space-y-2">
                        {records.map(r => (
                            <li
                                key={r.id}
                                onClick={() => r.file && setViewingFile(r.file)}
                                className={`flex items-center justify-between p-3 list-item-bg rounded-md ${r.file ? 'cursor-pointer hover:bg-gray-700' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <IconDocument className="text-gray-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">{r.name}</p>
                                        <p className="text-xs text-gray-500 font-plex-mono">
                                            {r.institution ? `${r.institution} • ` : ''}
                                            {new Date(r.date).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>
                                {r.file && <span className="text-xs font-plex-mono text-gray-400">{t('viewFile')}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {isAddModalOpen && <AddPrescriptionRecordModal patient={patient} onClose={() => setIsAddModalOpen(false)} onUpdate={onUpdate!} />}
            {viewingFile && <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />}
        </>
    );
};