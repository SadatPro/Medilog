import React from 'react';
import { Patient, Prescription } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { ModalWrapper } from './ModalWrapper';

interface PrescriptionDetailModalProps {
    patient: Patient;
    prescription: Prescription;
    onClose: () => void;
}

export const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({ patient, prescription, onClose }) => {
    const { t } = useTranslations();
    const { doctor, date, items, findings, investigations, advice, followUp } = prescription;

    return (
        <ModalWrapper onClose={onClose} className="w-full max-w-3xl">
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
                    <div><p className="text-gray-500">{t('date')}</p><p className="text-white font-semibold">{new Date(date).toLocaleDateString('en-CA')}</p></div>
                </div>

                {(findings && findings.length > 0) && (
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
                    {(investigations && investigations.length > 0) && (
                        <div className="pt-3">
                            <h4 className="text-sm font-semibold text-white font-plex-mono uppercase border-b border-gray-700 pb-1 mb-2">{t('investigations')}</h4>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                {investigations.map((inv, idx) => <li key={idx}>{inv}</li>)}
                            </ul>
                        </div>
                    )}
                    {(advice && advice.length > 0) && (
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
            </div>
             <div className="bg-[#1a1a1a] p-4 border-t border-gray-800 flex justify-end rounded-b-lg">
                <button onClick={onClose} className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold">
                    {t('close')}
                </button>
            </div>
        </ModalWrapper>
    );
};
