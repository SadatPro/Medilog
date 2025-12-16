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
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Fix: Use username as a stable reference instead of patient object
    const fetchData = useCallback(async (username: string) => {
        setIsLoading(true);
        try {
            const updatedPatient = await apiService.getPatient(username);
            if (updatedPatient) {
                setPatient(updatedPatient);
                setHasLoaded(true);
            }
        } catch (error) {
            console.error("Failed to fetch patient data:", error);
            // Don't keep loading on error
            setHasLoaded(true);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array - function won't change

    // Single useEffect for initial data load
    useEffect(() => {
        if (!hasLoaded) {
            fetchData(initialPatient.username);
        }
    }, [initialPatient.username, fetchData, hasLoaded]);

    // Fix: Auto-refresh with error handling and longer interval
    useEffect(() => {
        const interval = setInterval(() => {
            // Only refresh if we haven't encountered errors
            if (hasLoaded) {
                fetchData(initialPatient.username);
            }
        }, 30000); // Refresh every 30 seconds instead of 5

        return () => clearInterval(interval);
    }, [initialPatient.username, fetchData, hasLoaded]);

    const handleUpdate = () => {
        fetchData(initialPatient.username);
        onUpdateUser();
    };

    // Only show loading spinner on initial load, not on every refresh
    if (isLoading && !hasLoaded) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-white/80 font-medium">Loading patient data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8">
                <PatientBanner patient={patient} userType="patient" onUpdatePatient={handleUpdate} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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