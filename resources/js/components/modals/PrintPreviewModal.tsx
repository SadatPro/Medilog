


import React, { useState } from 'react';
import { Patient, PrescriptionItem, Finding } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { ModalWrapper } from './ModalWrapper';
import { IconPrint, IconSpinner } from '../icons';

interface PrintPreviewModalProps {
    patient: Patient;
    items: PrescriptionItem[];
    findings: Finding[];
    investigations: string[];
    advice: string[];
    followUp: string;
    onClose: () => void;
    onSaveAndPrint: () => Promise<void>;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ patient, items, findings, investigations, advice, followUp, onClose, onSaveAndPrint }) => {
    const { t, language, setLanguage } = useTranslations();
    const [isSaving, setIsSaving] = useState(false);
    
    const doctor = { name: 'Dr. Arifa Tasnim', specialization: 'MBBS, FCPS (Medicine)' }; // Mocked for now
    const today = new Date().toLocaleDateString('en-CA');

    const handlePrintClick = async () => {
        setIsSaving(true);
        try {
            await onSaveAndPrint();
        } catch (error) {
            console.error("Failed to save and print:", error);
            // Optionally show an error to the user
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} className="w-full max-w-3xl">
            <div className="print-container">
                <div className="p-8">
                    <div className="flex justify-between items-start pb-4 border-b border-gray-700">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{doctor.name}</h2>
                            <p className="text-sm text-gray-400">{doctor.specialization}</p>
                        </div>
                        <div className="font-plex-mono text-lg font-bold text-white tracking-wider"><span className="text-red-500">//</span> Rx</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                        <div><p className="text-gray-500">{t('patientName')}</p><p className="text-white font-semibold">{patient.name}</p></div>
                        <div><p className="text-gray-500">{t('age')}/{t('gender')}</p><p className="text-white font-semibold">{patient.age} {t('years')} / {t(patient.gender.toLowerCase() as any)}</p></div>
                        <div><p className="text-gray-500">{t('date')}</p><p className="text-white font-semibold">{today}</p></div>
                        {patient.dateOfBirth && (
                             <div><p className="text-gray-500">{t('dateOfBirth')}</p><p className="text-white font-semibold">{new Date(patient.dateOfBirth).toLocaleDateString('en-GB')}</p></div>
                        )}
                    </div>

                    {(findings.length > 0) && (
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-white font-plex-mono uppercase border-b border-gray-700 pb-1 mb-2">{t('findings')}</h4>
                            <ul className="space-y-2">
                                {findings.map((finding, idx) => (
                                    <li key={idx} className="text-sm text-gray-300">
                                        <span className="font-semibold text-gray-200">{finding.recordName}:</span> {finding.comment}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase font-plex-mono">
                                    <th className="py-2">Medicine</th>
                                    <th className="py-2">{t('dosage')}</th>
                                    <th className="py-2">{t('frequency')}</th>
                                    <th className="py-2">{t('duration')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {items.map(item => (
                                    <tr key={item.id} className="text-sm">
                                        <td className="py-3 pr-2">
                                            <p className="font-semibold text-white">{item.brandName} ({item.genericName})</p>
                                            <p className="text-xs text-gray-500">{item.strength}</p>
                                            {item.notes ? <p className="text-xs text-gray-400 mt-1">Note: {item.notes}</p> : ''}
                                        </td>
                                        <td className="py-3 px-2">{item.dosage}</td>
                                        <td className="py-3 px-2">{item.frequency}</td>
                                        <td className="py-3 pl-2">{item.duration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {(investigations.length > 0) && (
                            <div className="pt-3">
                                <h4 className="text-sm font-semibold text-white font-plex-mono uppercase border-b border-gray-700 pb-1 mb-2">{t('investigations')}</h4>
                                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                    {investigations.map((inv, idx) => <li key={idx}>{inv}</li>)}
                                </ul>
                            </div>
                        )}
                        {(advice.length > 0) && (
                             <div className="pt-3">
                                <h4 className="text-sm font-semibold text-white font-plex-mono uppercase border-b border-gray-700 pb-1 mb-2">{t('advice')}</h4>
                                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                    {advice.map((adv, idx) => <li key={idx}>{adv}</li>)}
                                </ul>
                            </div>
                        )}
                         {followUp && (
                            <div className="pt-3 md:col-span-2">
                                <h4 className="text-sm font-semibold text-white font-plex-mono uppercase border-b border-gray-700 pb-1 mb-2">{t('followUp')}</h4>
                                <p className="text-sm text-gray-300">{followUp}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-24 text-right">
                        <div className="inline-block border-t-2 border-dashed border-gray-600 px-8 pt-2">
                            <p className="text-white font-semibold">{t('signature')}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="no-print bg-[#1a1a1a] p-4 border-t border-gray-800 flex justify-between items-center rounded-b-lg">
                <div className="flex items-center gap-2 font-plex-mono text-xs">
                    <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded ${language === 'en' ? 'bg-white text-black active-lang-btn' : 'hover:bg-gray-800'}`}>EN</button>
                    <button onClick={() => setLanguage('bn')} className={`px-2 py-1 rounded ${language === 'bn' ? 'bg-white text-black active-lang-btn' : 'hover:bg-gray-800'}`}>BN</button>
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{t('cancel')}</button>
                    <button onClick={handlePrintClick} disabled={isSaving} className="action-btn flex items-center justify-center gap-2 px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold disabled:bg-gray-900">
                        {isSaving ? <IconSpinner className="h-5 w-5" /> : <IconPrint />}
                        <span>{isSaving ? t('saving') : t('saveAndPrint')}</span>
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};