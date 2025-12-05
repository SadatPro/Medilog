
import React, { useState } from 'react';
import { useTranslations } from '../../contexts/TranslationContext';
import { apiService } from '../../services/apiService';
import { ModalWrapper } from './ModalWrapper';

interface ForgotPasswordModalProps {
    onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
    const { t } = useTranslations();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        await apiService.requestPasswordReset(email);
        setSubmitted(true);
    };

    return (
        <ModalWrapper onClose={onClose} className="w-full max-w-sm">
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="font-plex-mono text-xl text-white mb-4">{t('forgotPassword')}</h2>
                {submitted ? (
                    <p className="text-sm text-gray-300">{t('resetLinkSent')}</p>
                ) : (
                    <div>
                        <label className="font-plex-mono text-xs text-gray-400">{t('email')}</label>
                        <input name="email" type="email" required className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm" />
                    </div>
                )}
                <div className="pt-4 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-plex-mono">{submitted ? t('close') : t('cancel')}</button>
                    {!submitted && (
                        <button type="submit" className="action-btn px-6 py-2 border border-gray-700 bg-white text-black rounded-md hover:bg-gray-300 transition-colors font-plex-mono text-sm font-semibold">
                            {t('resetPassword')}
                        </button>
                    )}
                </div>
            </form>
        </ModalWrapper>
    );
};
