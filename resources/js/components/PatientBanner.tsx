import React, { useState } from 'react';
import { Patient, Doctor } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { apiService } from '../services/apiService';
import { Avatar } from './Avatar';

interface PatientBannerProps {
    patient: Patient;
    userType: 'doctor' | 'patient';
    doctor?: Doctor;
    onUpdatePatient: () => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({ patient, userType, doctor, onUpdatePatient }) => {
    const { t } = useTranslations();
    const [isRequesting, setIsRequesting] = useState(false);
    
    const accessStatus = userType === 'doctor' ? patient.followRequests.find(r => r.doctorId === doctor?.id)?.status : undefined;
    const hasAccess = accessStatus === 'approved';

    const handleRequestAccess = async () => {
        if (!doctor) return;
        setIsRequesting(true);
        try {
            await apiService.requestAccess(doctor.id, doctor.name, doctor.specialization, patient.id);
            onUpdatePatient();
        } catch (error) {
            console.error("Failed to request access:", error);
        } finally {
            setIsRequesting(false);
        }
    };
    
    const StatusChip: React.FC = () => {
        if (userType === 'patient') return null;

        let chipClass = 'bg-red-500/10 text-red-400';
        let chipText = t('noAccess');
        let button: React.ReactNode | null = (
            <button
                onClick={handleRequestAccess}
                disabled={isRequesting}
                className="ml-4 px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-xs font-plex-mono disabled:opacity-50"
            >
                {isRequesting ? t('requesting') : t('requestAccess')}
            </button>
        );

        if (accessStatus === 'pending') {
            chipClass = 'bg-yellow-500/10 text-yellow-400';
            chipText = t('accessPending');
            button = <button className="ml-4 px-3 py-1 border border-gray-700 rounded-md text-xs font-plex-mono" disabled>{t('requesting')}</button>;
        } else if (hasAccess) {
            chipClass = 'bg-green-500/10 text-green-400';
            chipText = t('accessGranted');
            button = null;
        }

        return (
            <div className="flex items-center">
                <span className="font-plex-mono text-xs">{t('accessStatus')}:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${chipClass}`}>{chipText}</span>
                {button}
            </div>
        );
    };

    return (
        <div className="p-4 card-bg rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div className="flex items-center gap-4">
                <Avatar user={patient} size="md" />
                <div>
                    <h1 className="text-xl font-bold text-white">{patient.name}</h1>
                    <p className="text-sm text-gray-400 font-plex-mono">
                        {t('patientId')}: {patient.username} &bull; {t('age')}: {patient.age} {t('years')} &bull; {t('gender')}: {t(patient.gender.toLowerCase() as any)}
                    </p>
                    {patient.dateOfBirth && (
                        <p className="text-sm text-gray-500 font-plex-mono">
                            {t('dateOfBirth')}: {new Date(patient.dateOfBirth).toLocaleDateString('en-GB')}
                        </p>
                    )}
                </div>
            </div>
            <StatusChip />
        </div>
    );
};