import React, { useState } from 'react';
import { useTranslations } from '../contexts/TranslationContext';
import { User, UserType, Theme } from '../types';
import { RegistrationModal } from './modals/RegistrationModal';
import { ForgotPasswordModal } from './modals/ForgotPasswordModal';
import { IconSun, IconMoon, IconSpinner } from './icons';


interface AuthViewProps {
    onLogin: (type: UserType, id: string, password?: string) => Promise<void>;
    onRegister: (newUser: User, type: UserType) => void;
    theme: Theme;
    onThemeChange: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onRegister, theme, onThemeChange }) => {
    const { t } = useTranslations();
    const [isRegisterView, setIsRegisterView] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState<UserType>(null);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    
    // New state for the login form
    const [loginType, setLoginType] = useState<'doctor' | 'patient'>('doctor');
    const [identifier, setIdentifier] = useState(loginType === 'doctor' ? '01712345678' : '01812345678');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await onLogin(loginType, identifier, password);
            // On success, App component will switch the view.
        } catch (err) {
            setError(t('invalidCredentials'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleTabChange = (type: 'doctor' | 'patient') => {
        setLoginType(type);
        setIdentifier('');
        setPassword('');
        setError('');
    };

    const handleCloseModal = () => {
        setShowRegistrationModal(null);
        setShowForgotPasswordModal(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
             <div className="absolute top-4 right-4">
                <button onClick={onThemeChange} className="p-2 rounded-md bg-gray-900/50 backdrop-blur-sm border border-gray-700">
                    {theme === 'dark' ? <IconMoon /> : <IconSun />}
                </button>
            </div>
            <div className="w-full max-w-sm p-8 card-bg rounded-xl shadow-2xl">
                {!isRegisterView ? (
                    // Login View
                    <div className="animate-fade-in">
                        <h1 className="text-3xl font-bold text-center text-white font-plex-mono">{t('portalLogin')}</h1>
                        
                        {/* Tabs for Doctor/Patient */}
                        <div className="flex justify-center mt-6 border-b border-gray-700">
                            <button
                                onClick={() => handleTabChange('doctor')}
                                className={`px-4 py-2 text-sm font-semibold ${loginType === 'doctor' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                            >
                                {t('loginAsDoctor')}
                            </button>
                            <button
                                onClick={() => handleTabChange('patient')}
                                className={`px-4 py-2 text-sm font-semibold ${loginType === 'patient' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                            >
                                {t('loginAsPatient')}
                            </button>
                        </div>
                        
                        <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="font-plex-mono text-xs text-gray-400">
                                    {t('phone')}
                                </label>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-plex-mono text-xs text-gray-400">{t('password')}</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-3 px-4 action-btn rounded-lg text-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <IconSpinner className="mx-auto" /> : t('login')}
                            </button>
                        </form>
                        
                        <p className="mt-4 text-center text-sm">
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPasswordModal(true); }} className="text-gray-400 hover:text-white hover:underline">{t('forgotPassword')}</a>
                        </p>
                        <p className="mt-6 text-center text-sm text-gray-400">
                            {t('noAccount')}{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterView(true); }} className="font-semibold text-white hover:underline">{t('registerHere')}</a>
                        </p>
                    </div>
                ) : (
                    // Registration View
                    <div className="animate-fade-in">
                        <h1 className="text-3xl font-bold text-center text-white font-plex-mono">{t('createAccount')}</h1>
                        <div className="mt-8 space-y-4">
                            <button onClick={() => setShowRegistrationModal('doctor')} className="w-full py-3 px-4 list-item-bg rounded-lg text-lg font-semibold text-white hover:bg-gray-700 transition-colors">{t('registerAsDoctor')}</button>
                            <button onClick={() => setShowRegistrationModal('patient')} className="w-full py-3 px-4 list-item-bg rounded-lg text-lg font-semibold text-white hover:bg-gray-700 transition-colors">{t('registerAsPatient')}</button>
                        </div>
                        <p className="mt-6 text-center text-sm text-gray-400">
                            {t('hasAccount')}{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterView(false); }} className="font-semibold text-white hover:underline">{t('loginHere')}</a>
                        </p>
                    </div>
                )}
            </div>

            {showRegistrationModal && (
                <RegistrationModal
                    userType={showRegistrationModal}
                    onClose={handleCloseModal}
                    onRegister={onRegister}
                />
            )}
            {showForgotPasswordModal && <ForgotPasswordModal onClose={handleCloseModal} />}
        </div>
    );
};
