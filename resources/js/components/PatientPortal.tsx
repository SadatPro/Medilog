import React, { useState, useEffect, useCallback } from 'react';
import { Patient } from '../types';
import { apiService } from '../services/apiService';
import { PatientBanner } from './PatientBanner';
import { VitalsCard } from './VitalsCard';
import { PatientHistory } from './PatientHistory';
import { HealthAssistant } from './HealthAssistant';
import { AccessRequests } from './AccessRequests';

interface PatientPortalProps {
    patient: Patient;
    onUpdateUser: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ patient: initialPatient, onUpdateUser }) => {
    const [patient, setPatient] = useState<Patient>(initialPatient);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const updatedPatient = await apiService.getPatient(patient.username);
            if (updatedPatient) {
                setPatient(updatedPatient);
            }
        } catch (error) {
            console.error("Failed to fetch patient data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [patient.username]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    useEffect(() => {
        setPatient(initialPatient);
    }, [initialPatient])


    const handleUpdate = () => {
        fetchData();
        onUpdateUser();
    };

    if (isLoading) {
        return <div className="text-center p-12">Loading patient data...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <PatientBanner patient={patient} userType="patient" onUpdatePatient={handleUpdate} />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <VitalsCard patient={patient} userType="patient" onUpdate={handleUpdate} />
                    <AccessRequests patient={patient} onUpdate={handleUpdate} />
                </div>
                <div className="lg:col-span-3 space-y-8">
                    <PatientHistory patient={patient} userType="patient" onUpdate={handleUpdate} />
                </div>
            </div>
            <div className="mt-8">
                <HealthAssistant patient={patient} prescriptions={patient.prescriptions || []} />
            </div>
        </div>
    );
};
