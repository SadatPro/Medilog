import React, { useState } from 'react';
import { Doctor } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService, fileToBase64 } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';
import { Avatar } from '../Avatar';
import { IconSpinner } from '../icons';

interface EditDoctorProfileModalProps {
    doctor: Doctor;
    onClose: () => void;
    onUpdate: () => void;
}

export const EditDoctorProfileModal: React.FC<EditDoctorProfileModalProps> = ({ doctor, onClose, onUpdate }) => {
    const { t } = useTranslations();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [picturePreview, setPicturePreview] = useState<string | null>(doctor.profilePictureUrl || null);

    const [formData, setFormData] = useState({
        name: doctor.name,
        specialization: doctor.specialization,
        nid: doctor.nid || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        currentPassword: '',
        newPassword: '',
        retypeNewPassword: '',
        profilePicture: null as File | null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setPicturePreview(doctor.profilePictureUrl || null);
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

        let profilePictureUrl = doctor.profilePictureUrl;
        if (formData.profilePicture) {
            profilePictureUrl = await fileToBase64(formData.profilePicture);
        }
        
        const newInfo: Partial<Doctor> & { currentPassword?: string; newPassword?: string } = { 
            name: formData.name,
            specialization: formData.specialization,
            nid: formData.nid,
            email: formData.email,
            phone: formData.phone,
            profilePictureUrl,
        };

        if (formData.newPassword) {
            newInfo.newPassword = formData.newPassword;
            newInfo.currentPassword = formData.currentPassword;
        }
        
        try {
            await apiService.updateDoctorProfile(doctor.id, newInfo);
            onUpdate();
        } catch (error: any) {
            console.error("Failed to update doctor profile", error);
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
        <ModalWrapper onClose={onClose} className="w-full max-w-lg">
            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-plex-mono text-xl text-white">{t('editProfile')}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="flex flex-col items-center gap-4 mb-6">
                    <Avatar user={{ name: formData.name, profilePictureUrl: picturePreview || undefined }} size="lg" />
                    <input name="profilePicture" type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} id="doctor-file-upload" className="hidden" />
                    <label htmlFor="doctor-file-upload" className="cursor-pointer text-center text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-md">
                        {t('uploadImage')}
                    </label>
                </div>

                <fieldset className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-plex-mono text-xs text-gray-400">{t('name')}</label>
                            <input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                        </div>
                         <div>
                            <label className="font-plex-mono text-xs text-gray-400">{t('specialization')}</label>
                            <input name="specialization" type="text" value={formData.specialization} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="font-plex-mono text-xs text-gray-400">{t('nidNumber')}</label>
                            <input name="nid" type="text" value={formData.nid} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="font-plex-mono text-xs text-gray-400">{t('email')}</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                        </div>
                         <div>
                            <label className="font-plex-mono text-xs text-gray-400">{t('phone')}</label>
                            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="mt-6 border border-gray-800 p-4 rounded-md">
                    <legend className="px-2 font-plex-mono text-sm text-gray-400">{t('changePassword')}</legend>
                    <div className="space-y-4">
                        <div>
                            <label className="font-plex-mono text-xs text-gray-400">{t('currentPassword')}</label>
                            <input name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="font-plex-mono text-xs text-gray-400">{t('newPassword')}</label>
                                <input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="font-plex-mono text-xs text-gray-400">{t('retypeNewPassword')}</label>
                                <input name="retypeNewPassword" type="password" value={formData.retypeNewPassword} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-plex-mono">{t('passwordNote')}</p>
                        {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                    </div>
                </fieldset>

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