import React, { useState } from 'react';
import { Patient, Vital } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService, fileToBase64 } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';
import { Avatar } from '../Avatar';
import { IconSpinner } from '../icons';

interface VitalsModalProps {
    patient: Patient;
    onClose: () => void;
    onUpdate: () => void;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({ patient, onClose, onUpdate }) => {
    const { t } = useTranslations();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [picturePreview, setPicturePreview] = useState<string | null>(patient.profilePictureUrl || null);

    const getInitialVital = (label: string) => patient.vitals.find(v => v.label === label)?.value || '';
    
    const [formData, setFormData] = useState({
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        currentPassword: '',
        newPassword: '',
        retypeNewPassword: '',
        age: patient.age.toString(),
        gender: patient.gender,
        bloodPressure: getInitialVital('Blood Pressure'),
        bloodGlucose: getInitialVital('Blood Glucose'),
        pulse: getInitialVital('Pulse'),
        spo2: getInitialVital('SpO2'),
        bloodGroup: patient.bloodGroup || '',
        asthma: patient.asthma || 'No',
        allergies: patient.allergies || '',
        profilePicture: null as File | null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, profilePicture: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPicturePreview(patient.profilePictureUrl || null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword && !formData.currentPassword) {
            setError(t('currentPasswordRequired'));
            return;
        }
        if (formData.newPassword && formData.newPassword !== formData.retypeNewPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        setError('');
        setIsUpdating(true);
        
        let profilePictureUrl = patient.profilePictureUrl;
        if (formData.profilePicture) {
            profilePictureUrl = await fileToBase64(formData.profilePicture);
        }

        const newVitals: Vital[] = [
            { label: 'Blood Pressure', value: formData.bloodPressure, unit: 'mmHg', date: new Date().toISOString() },
            { label: 'Blood Glucose', value: formData.bloodGlucose, unit: 'mmol/L', date: new Date().toISOString() },
            { label: 'Pulse', value: formData.pulse, unit: 'bpm', date: new Date().toISOString() },
            { label: 'SpO2', value: formData.spo2, unit: '%', date: new Date().toISOString() },
        ].filter(v => v.value);
        
        // FIX: Combine all updates into a single object for the apiService call.
        const updates: Partial<Patient> & { currentPassword?: string; newPassword?: string } = { 
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            age: parseInt(formData.age, 10),
            gender: formData.gender as Patient['gender'],
            bloodGroup: formData.bloodGroup, 
            allergies: formData.allergies, 
            asthma: formData.asthma as Patient['asthma'],
            profilePictureUrl,
            vitals: newVitals,
        };
        
        if (formData.newPassword) {
            updates.newPassword = formData.newPassword;
            updates.currentPassword = formData.currentPassword;
        }
        
        try {
            await apiService.updatePatientProfile(patient.id, updates);
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error("Failed to update profile", error);
             if (error.message.includes("Incorrect current password")) {
                setError(t('incorrectPassword'));
            } else {
                setError(error.message || "An unknown error occurred.");
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} className="w-full max-w-3xl">
            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                         {/* FIX: Use a valid translation key 'updateProfile' instead of 'updateVitals'. */}
                         <h2 className="font-plex-mono text-xl text-white">{t('updateProfile')}</h2>
                         <p className="text-sm text-gray-500">Manage your personal, account, and health information.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-2xl -mt-2">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Left side: Picture */}
                    <div className="md:col-span-1 flex flex-col items-center gap-4 pt-4">
                        <Avatar user={{name: formData.name, profilePictureUrl: picturePreview || undefined}} size="lg" />
                        <input name="profilePicture" type="file" accept="image/*" onChange={handleFileChange} id="file-upload" className="hidden" />
                        <label htmlFor="file-upload" className="cursor-pointer text-center text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-md">
                            {t('uploadFile')}
                        </label>
                    </div>

                    {/* Right side: Form fields */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Personal Info */}
                        <fieldset className="border border-gray-800 p-4 rounded-md">
                            <legend className="px-2 font-plex-mono text-sm text-gray-400">Personal Info</legend>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-3"><label className="font-plex-mono text-xs text-gray-400">{t('name')}</label><input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('age')}</label><input name="age" type="number" value={formData.age} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div className="sm:col-span-2"><label className="font-plex-mono text-xs text-gray-400">{t('gender')}</label><select name="gender" value={formData.gender} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"><option value="Female">{t('female')}</option><option value="Male">{t('male')}</option><option value="Other">{t('other')}</option></select></div>
                             </div>
                        </fieldset>

                         {/* Account Info */}
                        <fieldset className="border border-gray-800 p-4 rounded-md">
                            <legend className="px-2 font-plex-mono text-sm text-gray-400">Account Info</legend>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('email')}</label><input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('phone')}</label><input name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                             </div>
                        </fieldset>

                        {/* Change Password */}
                        <fieldset className="border border-gray-800 p-4 rounded-md">
                            <legend className="px-2 font-plex-mono text-sm text-gray-400">{t('changePassword')}</legend>
                            <div className="space-y-4">
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('currentPassword')}</label><input name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('newPassword')}</label><input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('retypeNewPassword')}</label><input name="retypeNewPassword" type="password" value={formData.retypeNewPassword} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                </div>
                                <p className="text-xs text-gray-500 font-plex-mono">{t('passwordNote')}</p>
                                {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                            </div>
                        </fieldset>
                        
                        {/* Health Info */}
                         <fieldset className="border border-gray-800 p-4 rounded-md">
                            <legend className="px-2 font-plex-mono text-sm text-gray-400">Health Info</legend>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('bloodPressure')}</label><input name="bloodPressure" type="text" value={formData.bloodPressure} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('bloodGlucose')}</label><input name="bloodGlucose" type="text" value={formData.bloodGlucose} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('pulse')}</label><input name="pulse" type="text" value={formData.pulse} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('spo2')}</label><input name="spo2" type="text" value={formData.spo2} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('bloodGroup')}</label><input name="bloodGroup" type="text" value={formData.bloodGroup} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('asthma')}</label><select name="asthma" value={formData.asthma} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"><option value="No">No</option><option value="Yes">Yes</option></select></div>
                                <div className="sm:col-span-2"><label className="font-plex-mono text-xs text-gray-400">{t('allergies')}</label><input name="allergies" type="text" value={formData.allergies} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                             </div>
                        </fieldset>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{t('cancel')}</button>
                    <button type="submit" disabled={isUpdating} className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold disabled:bg-gray-900 flex items-center justify-center">
                        {isUpdating && <IconSpinner className="h-4 w-4 mr-2" />}
                        {isUpdating ? t('updating') : t('update')}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};
