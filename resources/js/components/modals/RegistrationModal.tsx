

import React, { useState } from 'react';
import { User, UserType } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';
import { IconSpinner } from '../icons';

interface RegistrationModalProps {
    userType: 'doctor' | 'patient';
    onClose: () => void;
    onRegister: (newUser: User, type: UserType) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ userType, onClose, onRegister }) => {
    const { t } = useTranslations();
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsRegistering(true);
        const formData = new FormData(e.currentTarget);
        const commonData = {
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            password: formData.get('password') as string,
            dateOfBirth: formData.get('dateOfBirth') as string,
            nid: formData.get('nid') as string,
        };

        try {
            let newUser: User;
            if (userType === 'doctor') {
                newUser = await apiService.registerDoctor({
                    name: formData.get('name') as string,
                    specialization: formData.get('specialization') as string,
                    ...commonData
                });
            } else {
                newUser = await apiService.registerPatient({
                    username: formData.get('username') as string,
                    name: formData.get('name') as string,
                    age: parseInt(formData.get('age') as string, 10),
                    gender: formData.get('gender') as 'Female' | 'Male' | 'Other',
                    ...commonData
                });
            }
            onRegister(newUser, userType);
            onClose();
        } catch (error) {
            console.error("Registration failed:", error);
        } finally {
            setIsRegistering(false);
        }
    };

    const commonFields = (
        <>
            <div><label className="font-plex-mono text-xs text-gray-400">{t('email')}</label><input name="email" type="email" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
            <div><label className="font-plex-mono text-xs text-gray-400">{t('phone')}</label><input name="phone" type="tel" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
            <div><label className="font-plex-mono text-xs text-gray-400">{t('password')}</label><input name="password" type="password" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
        </>
    );

    return (
        <ModalWrapper onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="font-plex-mono text-xl text-white mb-4">{userType === 'doctor' ? t('registerAsDoctor') : t('registerAsPatient')}</h2>
                
                <div><label className="font-plex-mono text-xs text-gray-400">{t('name')}</label><input name="name" type="text" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                
                <div><label className="font-plex-mono text-xs text-gray-400">{t('dateOfBirth')}</label><input name="dateOfBirth" type="date" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                <div><label className="font-plex-mono text-xs text-gray-400">{t('nidNumber')}</label><input name="nid" type="text" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>

                {userType === 'doctor' ? (
                    <div><label className="font-plex-mono text-xs text-gray-400">{t('specialization')}</label><input name="specialization" type="text" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                ) : (
                    <>
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('patientId')}</label><input name="username" type="text" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('age')}</label><input name="age" type="number" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                        <div><label className="font-plex-mono text-xs text-gray-400">{t('gender')}</label><select name="gender" required defaultValue="Female" className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"><option value="Female">{t('female')}</option><option value="Male">{t('male')}</option><option value="Other">{t('other')}</option></select></div>
                    </>
                )}
                
                {commonFields}
                
                <div className="pt-4 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{t('cancel')}</button>
                    <button type="submit" disabled={isRegistering} className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold disabled:bg-gray-900 flex items-center justify-center">
                        {isRegistering && <IconSpinner className="h-4 w-4 mr-2" />}
                        {isRegistering ? t('registering') : t('register')}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};