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
            alert('Access request sent successfully!');
        } catch (error) {
            console.error("Failed to request access:", error);
            alert('Failed to send access request. Please try again.');
        } finally {
            setIsRequesting(false);
        }
    };


    
    const StatusChip: React.FC = () => {
        // Only show status chip for doctor view
        if (userType === 'patient') return null;

        let chipClass = 'bg-red-500/20 text-red-300 border border-red-500/30';
        let chipText = t('noAccess');
        let button: React.ReactNode | null = (
            <button
                onClick={handleRequestAccess}
                disabled={isRequesting}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                {isRequesting ? t('requesting') : t('requestAccess')}
            </button>
        );

        if (accessStatus === 'pending') {
            chipClass = 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
            chipText = t('accessPending');
            button = <button className="ml-4 px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg font-semibold border border-yellow-500/30 text-sm" disabled>{t('requesting')}</button>;
        } else if (hasAccess) {
            chipClass = 'bg-green-500/20 text-green-300 border border-green-500/30';
            chipText = t('accessGranted');
            button = null; // No remove access button - only patients can manage access
        }

        return (
            <div className="flex items-center">
                <span className="font-plex-mono text-sm font-semibold text-gray-700 dark:text-white/80">{t('accessStatus')}:</span>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${chipClass}`}>{chipText}</span>
                {button}
            </div>
        );
    };

    return (
        <div className="p-6 card-bg rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl border border-white/10">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar user={patient} size="lg" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111]"></div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {patient.name}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm font-plex-mono text-gray-700 dark:text-white/70">
                        <span className="flex items-center gap-2">
                            <span className="text-purple-600 dark:text-purple-400">ID:</span> 
                            <span className="font-semibold">{patient.username}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400">Age:</span> 
                            <span className="font-semibold">{patient.age} {t('years')}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-pink-600 dark:text-pink-400">Gender:</span> 
                            <span className="font-semibold">{t(patient.gender.toLowerCase() as any)}</span>
                        </span>
                    </div>
                    {patient.dateOfBirth && (
                        <p className="text-sm text-gray-600 dark:text-white/60 font-plex-mono flex items-center gap-2">
                            <span className="text-cyan-600 dark:text-cyan-400">DOB:</span>
                            <span className="font-semibold">{new Date(patient.dateOfBirth).toLocaleDateString('en-GB')}</span>
                        </p>
                    )}
                </div>
            </div>
            <StatusChip />
        </div>
    );
};