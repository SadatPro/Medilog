import React, { useState, useEffect, useRef } from 'react';
import { User, Theme, Doctor, Patient } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { IconSun, IconMoon, IconLogout, IconEdit, IconBoldCross } from './icons';
import { Avatar } from './Avatar';
import { EditDoctorProfileModal } from './modals/EditDoctorProfileModal';
import { EditPatientProfileModal } from './modals/EditPatientProfileModal';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    theme: Theme;
    onThemeChange: () => void;
    onUpdateUser: () => void;
}

const ProfilePopover: React.FC<{ user: User; onEdit: () => void }> = ({ user, onEdit }) => {
    const { t } = useTranslations();
    
    if (!user) return null;

    const isDoctor = 'specialization' in user;

    return (
        <div className="card-bg rounded-lg shadow-lg z-50">
            <div className="p-4">
                {isDoctor ? (
                    // Doctor
                    <div className="space-y-3">
                        <p className="font-semibold text-white">{(user as Doctor).name}</p>
                        <p className="text-sm text-gray-400">{(user as Doctor).specialization}</p>
                        <div className="border-t border-gray-700 mt-3 pt-3 text-xs text-gray-400 font-plex-mono space-y-1">
                            <p><span className="font-semibold text-gray-300">{t('email')}:</span> {user.email || 'N/A'}</p>
                            <p><span className="font-semibold text-gray-300">{t('phone')}:</span> {user.phone || 'N/A'}</p>
                            <p><span className="font-semibold text-gray-300">{t('nidNumber')}:</span> {(user as Doctor).nid || 'N/A'}</p>
                        </div>
                    </div>
                ) : (
                    // Patient
                    <div className="space-y-3">
                        <p className="font-semibold text-white">{(user as Patient).name}</p>
                        <div className="text-xs text-gray-400 font-plex-mono grid grid-cols-2 gap-2">
                            <p><span className="font-semibold text-gray-300">{t('age')}:</span> {(user as Patient).age}</p>
                            <p><span className="font-semibold text-gray-300">{t('gender')}:</span> {t((user as Patient).gender.toLowerCase() as any)}</p>
                            <p><span className="font-semibold text-gray-300">{t('bloodGroup')}:</span> {(user as Patient).bloodGroup || 'N/A'}</p>
                            <p><span className="font-semibold text-gray-300">{t('asthma')}:</span> {(user as Patient).asthma || 'N/A'}</p>
                            <p className="col-span-2"><span className="font-semibold text-gray-300">{t('allergies')}:</span> {(user as Patient).allergies || 'None'}</p>
                        </div>
                        <div className="border-t border-gray-700 pt-3 text-xs text-gray-400 font-plex-mono space-y-1">
                            <p><span className="font-semibold text-gray-300">{t('email')}:</span> {user.email || 'N/A'}</p>
                            <p><span className="font-semibold text-gray-300">{t('phone')}:</span> {user.phone || 'N/A'}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t border-gray-700 p-2">
                <button onClick={onEdit} className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2">
                    <IconEdit />
                    {t('editProfile')}
                </button>
            </div>
        </div>
    );
};


export const Header: React.FC<HeaderProps> = ({ user, onLogout, theme, onThemeChange, onUpdateUser }) => {
    const { language, setLanguage } = useTranslations();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEditProfile = () => {
        setIsPopoverOpen(false);
        setIsEditModalOpen(true);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-sm border-b border-gray-800">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <IconBoldCross className="h-6 w-6 text-red-500" />
                        <h1 className="text-xl font-bold font-plex-mono text-white tracking-wider">Medilog</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="header-btn-container flex items-center gap-1 p-1 rounded-md font-plex-mono text-xs">
                            <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded ${language === 'en' ? 'active-lang-btn' : 'lang-btn-inactive'}`}>EN</button>
                            <button onClick={() => setLanguage('bn')} className={`px-2 py-1 rounded ${language === 'bn' ? 'active-lang-btn' : 'lang-btn-inactive'}`}>BN</button>
                        </div>
                        <button onClick={onThemeChange} className="header-btn p-2 rounded-md">
                            {theme === 'dark' ? <IconMoon /> : <IconSun />}
                        </button>
                        <div className="relative" ref={popoverRef}>
                            <button onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
                                <Avatar user={user} size="sm" />
                            </button>
                            {isPopoverOpen && (
                                <div className="absolute right-0 mt-2 w-64 animate-fade-in">
                                    <ProfilePopover user={user} onEdit={handleEditProfile} />
                                </div>
                            )}
                        </div>
                        <button onClick={onLogout} className="header-btn p-2 rounded-md text-white" title="Logout">
                            <IconLogout />
                        </button>
                    </div>
                </div>
            </header>
            {isEditModalOpen && ('specialization' in user ? (
                <EditDoctorProfileModal 
                    doctor={user as Doctor}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={() => {
                        onUpdateUser();
                        setIsEditModalOpen(false);
                    }}
                />
            ) : (
                <EditPatientProfileModal 
                    patient={user as Patient}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={() => {
                        onUpdateUser();
                        setIsEditModalOpen(false);
                    }}
                />
            ))}
        </>
    );
};