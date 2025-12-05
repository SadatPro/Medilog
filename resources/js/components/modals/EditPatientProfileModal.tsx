import React, { useState } from 'react';
import { Patient } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService, fileToBase64 } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';
import { Avatar } from '../Avatar';
import { IconSpinner } from '../icons';

interface EditPatientProfileModalProps {
    patient: Patient;
    onClose: () => void;
    onUpdate: () => void;
}

export const EditPatientProfileModal: React.FC<EditPatientProfileModalProps> = ({ patient, onClose, onUpdate }) => {
    const { t } = useTranslations();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [picturePreview, setPicturePreview] = useState<string | null>(patient.profilePictureUrl || null);

    const [formData, setFormData] = useState({
        name: patient.name,
        username: patient.username,
        nid: patient.nid || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        email: patient.email || '',
        phone: patient.phone || '',
        currentPassword: '',
        newPassword: '',
        retypeNewPassword: '',
        age: patient.age.toString(),
        gender: patient.gender,
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

        const updates: Partial<Patient> & { currentPassword?: string; newPassword?: string } = { 
            name: formData.name,
            username: formData.username,
            nid: formData.nid,
            dateOfBirth: formData.dateOfBirth,
            email: formData.email,
            phone: formData.phone,
            age: parseInt(formData.age, 10),
            gender: formData.gender as Patient['gender'],
            profilePictureUrl,
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
        <ModalWrapper onClose={onClose} className="w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                         <h2 className="font-plex-mono text-xl text-white">{t('editProfile')}</h2>
                         <p className="text-sm text-gray-500">Manage your personal and account information.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-2xl -mt-2">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center gap-4 pt-4">
                        <Avatar user={{name: formData.name, profilePictureUrl: picturePreview || undefined}} size="lg" />
                        <input name="profilePicture" type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} id="file-upload" className="hidden" />
                        <label htmlFor="file-upload" className="cursor-pointer text-center text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-md">
                            {t('uploadImage')}
                        </label>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <fieldset className="border border-gray-800 p-4 rounded-md">
                            <legend className="px-2 font-plex-mono text-sm text-gray-400">Personal Info</legend>
                             <div className="space-y-4">
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('name')}</label><input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('age')}</label><input name="age" type="number" value={formData.age} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('gender')}</label><select name="gender" value={formData.gender} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"><option value="Female">{t('female')}</option><option value="Male">{t('male')}</option><option value="Other">{t('other')}</option></select></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('dateOfBirth')}</label><input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('nidNumber')}</label><input name="nid" type="text" value={formData.nid} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                </div>
                             </div>
                        </fieldset>

                        <fieldset className="border border-gray-800 p-4 rounded-md">
                            <legend className="px-2 font-plex-mono text-sm text-gray-400">Account Info</legend>
                             <div className="space-y-4">
                                <div><label className="font-plex-mono text-xs text-gray-400">{t('patientId')}</label><input name="username" type="text" value={formData.username} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('email')}</label><input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                    <div><label className="font-plex-mono text-xs text-gray-400">{t('phone')}</label><input name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" /></div>
                                </div>
                             </div>
                        </fieldset>

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
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{t('cancel')}</button>
                    <button type="submit" disabled={isUpdating} className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold disabled:bg-gray-900 flex items-center justify-center">
                        {isUpdating && <IconSpinner className="h-4 w-4 mr-2" />}
                        {isUpdating ? t('updating') : t('updateProfile')}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};
