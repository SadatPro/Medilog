import React, { useState } from 'react';
import { Patient } from '../types';
import { useTranslations, type TranslationKey } from '../contexts/TranslationContext';
import { EditVitalsModal } from './modals/EditVitalsModal';
import { EditConditionsModal } from './modals/EditConditionsModal';
import { IconEdit, IconBloodPressure, IconDroplet, IconHeartbeat, IconWaveform, IconAlertTriangle } from './icons';

interface VitalsCardProps {
    patient: Patient;
    userType: 'doctor' | 'patient';
    onUpdate?: () => void;
    hasDoctorAccess?: boolean;
}

export const VitalsCard: React.FC<VitalsCardProps> = ({ patient, userType, onUpdate, hasDoctorAccess }) => {
    const { t } = useTranslations();
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false);

    const getVital = (label: string) => patient.vitals.find(v => v.label.toLowerCase() === label.toLowerCase())?.value || 'N/A';
    const canEdit = userType === 'patient' || hasDoctorAccess;

    const vitalsList: { label: string; key: TranslationKey; icon: React.ReactNode }[] = [
        { label: 'Blood Pressure', key: 'bloodPressure', icon: <IconBloodPressure className="h-5 w-5 text-gray-400" /> },
        { label: 'Blood Glucose', key: 'bloodGlucose', icon: <IconDroplet className="h-5 w-5 text-gray-400" /> },
        { label: 'Pulse', key: 'pulse', icon: <IconHeartbeat className="h-5 w-5 text-gray-400" /> },
        { label: 'SpO2', key: 'spo2', icon: <IconWaveform className="h-5 w-5 text-gray-400" /> },
    ];

    return (
        <>
            <div className="p-6 card-bg rounded-lg shadow-xl">
                <div className="flex justify-between items-center">
                    <h2 className="font-plex-mono text-xl text-white">{t('vitalsSummary')}</h2>
                    {canEdit && onUpdate && (
                        <button onClick={() => setIsVitalsModalOpen(true)} className="flex items-center gap-1 text-xs font-plex-mono text-gray-400 hover:text-white border border-gray-700 px-2 py-1 rounded-md">
                            <IconEdit /> {t('editVitals')}
                        </button>
                    )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    {vitalsList.map(({ label, key, icon }) => (
                        <div key={key} className="flex items-center gap-3">
                            {icon}
                            <div>
                                <p className="text-gray-500 text-xs">{t(key)}</p>
                                <p className="text-white font-semibold font-plex-mono text-base">{getVital(label)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 border-t border-gray-800 pt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                     <div><p className="text-gray-500">{t('bloodGroup')}</p><p className="text-white font-semibold font-plex-mono text-base">{patient.bloodGroup || 'N/A'}</p></div>
                     <div><p className="text-gray-500">{t('asthma')}</p><p className="text-white font-semibold font-plex-mono text-base">{patient.asthma || 'N/A'}</p></div>
                     <div className="col-span-2"><p className="text-gray-500">{t('allergies')}</p><p className="text-white font-semibold font-plex-mono text-base">{patient.allergies || 'None'}</p></div>
                </div>

                <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                         <h3 className="font-plex-mono text-base text-white flex items-center gap-2">
                            <IconAlertTriangle className="h-5 w-5 text-yellow-400" />
                            {t('majorConditions')}
                        </h3>
                         {canEdit && onUpdate && (
                            <button onClick={() => setIsConditionsModalOpen(true)} className="flex items-center gap-1 text-xs font-plex-mono text-gray-400 hover:text-white border border-gray-700 px-2 py-1 rounded-md">
                                <IconEdit /> {t('editConditions')}
                            </button>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {patient.majorConditions && patient.majorConditions.length > 0 ? (
                            patient.majorConditions.map((condition, index) => (
                                <span key={index} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full">{condition}</span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 font-plex-mono">{t('noMajorConditions')}</p>
                        )}
                    </div>
                </div>
            </div>
            {isVitalsModalOpen && onUpdate && <EditVitalsModal patient={patient} onClose={() => setIsVitalsModalOpen(false)} onUpdate={onUpdate} />}
            {isConditionsModalOpen && onUpdate && <EditConditionsModal patient={patient} onClose={() => setIsConditionsModalOpen(false)} onUpdate={onUpdate} />}
        </>
    );
};