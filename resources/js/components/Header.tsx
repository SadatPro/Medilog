import React, { useState, useEffect, useRef } from 'react';
import { User, Theme, Doctor, Patient } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { IconSun, IconMoon, IconLogout, IconEdit } from './icons';
import { MedilogLogo } from './MedilogLogo';
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
        <div className="card-bg rounded-2xl shadow-2xl z-50 border border-white/10 backdrop-blur-sm">
            <div className="p-6 space-y-4">
                {isDoctor ? (
                    // Doctor
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{(user as Doctor).name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">{(user as Doctor).name}</p>
                                <p className="text-sm text-blue-400 font-plex-mono">{(user as Doctor).specialization}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm font-plex-mono">
                            <div className="flex items-center gap-3">
                                <span className="text-purple-400 font-semibold">{t('email')}:</span>
                                <span className="text-white/80">{user.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-blue-400 font-semibold">{t('phone')}:</span>
                                <span className="text-white/80">{user.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-pink-400 font-semibold">{t('nidNumber')}:</span>
                                <span className="text-white/80">{(user as Doctor).nid || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Patient
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{(user as Patient).name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">{(user as Patient).name}</p>
                                <p className="text-sm text-green-400 font-plex-mono">Patient</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm font-plex-mono">
                            <div className="flex items-center gap-2">
                                <span className="text-purple-400 font-semibold">{t('age')}:</span>
                                <span className="text-white/80 font-semibold">{(user as Patient).age}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-blue-400 font-semibold">{t('gender')}:</span>
                                <span className="text-white/80 font-semibold">{t((user as Patient).gender.toLowerCase() as any)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-pink-400 font-semibold">{t('bloodGroup')}:</span>
                                <span className="text-white/80 font-semibold">{(user as Patient).bloodGroup || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-cyan-400 font-semibold">{t('asthma')}:</span>
                                <span className="text-white/80 font-semibold">{(user as Patient).asthma || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="text-sm font-plex-mono">
                            <span className="text-orange-400 font-semibold">{t('allergies')}:</span>
                            <span className="text-white/80 ml-2">{(user as Patient).allergies || 'None'}</span>
                        </div>
                        <div className="space-y-2 text-sm font-plex-mono">
                            <div className="flex items-center gap-3">
                                <span className="text-purple-400 font-semibold">{t('email')}:</span>
                                <span className="text-white/80">{user.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-blue-400 font-semibold">{t('phone')}:</span>
                                <span className="text-white/80">{user.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t border-white/10 p-4">
                <button 
                    onClick={onEdit} 
                    className="w-full text-left text-sm px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 flex items-center gap-3 transition-all duration-300 border border-white/10"
                >
                    <IconEdit className="text-purple-400" />
                    <span className="text-white font-semibold">{t('editProfile')}</span>
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
            <header className="sticky top-0 z-40 bg-black/30 backdrop-blur-md border-b border-white/20 shadow-2xl">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <MedilogLogo />
                    <div className="flex items-center gap-6">
                        <div className="header-btn-container flex items-center gap-2 p-2 rounded-xl font-plex-mono text-sm">
                            <button 
                                onClick={() => setLanguage('en')} 
                                className={`px-4 py-2 rounded-lg transition-all duration-300 ${language === 'en' ? 'active-lang-btn shadow-lg' : 'lang-btn-inactive hover:scale-105'}`}
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => setLanguage('bn')} 
                                className={`px-4 py-2 rounded-lg transition-all duration-300 ${language === 'bn' ? 'active-lang-btn shadow-lg' : 'lang-btn-inactive hover:scale-105'}`}
                            >
                                BN
                            </button>
                        </div>
                        <button 
                            onClick={onThemeChange} 
                            className="header-btn p-3 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? (
                                <IconMoon className="h-6 w-6 text-yellow-400" />
                            ) : (
                                <IconSun className="h-6 w-6 text-orange-500" />
                            )}
                        </button>
                        <div className="relative" ref={popoverRef}>
                            <button 
                                onClick={() => setIsPopoverOpen(!isPopoverOpen)} 
                                className="transition-all duration-300 hover:scale-110 p-2 rounded-xl hover:bg-white/10"
                            >
                                <Avatar user={user} size="md" />
                            </button>
                            {isPopoverOpen && (
                                <div className="absolute right-0 mt-3 w-72 animate-fade-in">
                                    <ProfilePopover user={user} onEdit={handleEditProfile} />
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={onLogout} 
                            className="header-btn p-3 rounded-xl text-white transition-all duration-300 hover:scale-110 hover:bg-red-500/20 hover:text-red-400 shadow-lg" 
                            title="Logout"
                        >
                            <IconLogout className="h-6 w-6" />
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
