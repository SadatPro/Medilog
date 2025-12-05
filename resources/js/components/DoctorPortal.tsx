import React, { useState, useCallback } from 'react';
import { Doctor, Patient } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { apiService } from '../services/apiService';
import { PatientBanner } from './PatientBanner';
import { VitalsCard } from './VitalsCard';
import { PatientHistory } from './PatientHistory';
import { PrescriptionComposer } from './PrescriptionComposer';
import { IconSearch, IconSpinner } from './icons';

interface DoctorPortalProps {
    doctor: Doctor;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ doctor }) => {
    const { t } = useTranslations();
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    
    const handleSearch = useCallback(async () => {
        if (!searchInput) return;
        setIsLoading(true);
        setError('');
        setCurrentPatient(null);
        
        try {
            const patient = await apiService.getPatient(searchInput);
            if (patient) {
                setCurrentPatient(patient);
            } else {
                setError(t('patientNotFound'));
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [searchInput, t]);
    
    const updateCurrentPatient = useCallback(async (patientUsername: string) => {
        const patient = await apiService.getPatient(patientUsername);
        if (patient) {
            setCurrentPatient(patient);
        }
    }, []);
    
    const handlePrescriptionSuccess = () => {
        if (currentPatient) {
            updateCurrentPatient(currentPatient.username);
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">{t('searchForPatient')}</h2>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('enterPatientId')}
                    className="flex-grow px-4 py-2 bg-[#111] border border-gray-800 rounded-lg text-lg"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="action-btn px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center disabled:bg-gray-900 disabled:text-gray-600"
                >
                    {isLoading ? (
                         <IconSpinner className="h-5 w-5 mr-2" />
                    ) : (
                        <IconSearch className="mr-2 h-5 w-5" />
                    )}
                    <span>{isLoading ? t('searching') : t('search')}</span>
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            {currentPatient && (
                <div className="mt-8 animate-fade-in">
                    <PatientBanner
                        patient={currentPatient}
                        userType="doctor"
                        doctor={doctor}
                        onUpdatePatient={() => updateCurrentPatient(currentPatient.username)}
                    />

                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <VitalsCard
                                patient={currentPatient}
                                userType="doctor"
                                hasDoctorAccess={doctor.followedPatients.includes(currentPatient.id)}
                                onUpdate={() => updateCurrentPatient(currentPatient.username)}
                            />
                        </div>
                        <div className="lg:col-span-3 space-y-8">
                             <PatientHistory patient={currentPatient} userType="doctor" />
                        </div>
                    </div>
                    
                    {doctor.followedPatients.includes(currentPatient.id) && (
                        <div className="mt-8">
                            <PrescriptionComposer patient={currentPatient} onSuccess={handlePrescriptionSuccess} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
