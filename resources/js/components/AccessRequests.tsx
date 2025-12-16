import React from 'react';
import { Patient } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { apiService } from '../services/apiService';
import { IconShieldCheck, IconClipboardX } from './icons';
import { EmptyState } from './EmptyState';

interface AccessRequestsProps {
    patient: Patient;
    onUpdate: () => void;
}

export const AccessRequests: React.FC<AccessRequestsProps> = ({ patient, onUpdate }) => {
    const { t } = useTranslations();
    const pendingRequests = patient.followRequests.filter(r => r.status === 'pending');
    const approvedRequests = patient.followRequests.filter(r => r.status === 'approved');

    const handleRequest = async (doctorId: string, action: 'approve' | 'decline' | 'remove') => {
        try {
            if (action === 'approve') {
                await apiService.approveAccess(doctorId, patient.id);
            } else if (action === 'remove') {
                // Remove access by declining (which removes the follow request)
                await apiService.declineAccess(doctorId, patient.id);
            } else {
                await apiService.declineAccess(doctorId, patient.id);
            }
            // Immediate refresh
            await onUpdate();
        } catch (error) {
            console.error(`Failed to ${action} access request:`, error);
            alert(`Failed to ${action} access request. Please try again.`);
        }
    };

    return (
        <div className="p-6 card-bg rounded-lg shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <IconShieldCheck className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                <h2 className="font-plex-mono text-xl text-gray-900 dark:text-white">{t('accessRequests')}</h2>
            </div>
            
            {/* Pending Requests */}
            <div className="mb-6">
                {pendingRequests.length > 0 ? (
                    <>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">{t('pendingRequests')}</h3>
                        <div className="space-y-3">
                            {pendingRequests.map(r => (
                                <div key={r.doctorId} className="p-3 list-item-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{r.doctorName}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{r.doctorSpecialization}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRequest(r.doctorId, 'approve')} className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full hover:bg-green-500/20">{t('approve')}</button>
                                        <button onClick={() => handleRequest(r.doctorId, 'decline')} className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full hover:bg-red-500/20">{t('decline')}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-600 dark:text-white/60 text-center py-8">{t('noPendingRequests')}</p>
                )}
            </div>
            
            {/* Approved Access */}
            <div className="mb-6">
                {approvedRequests.length > 0 ? (
                    <>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">{t('approvedAccess')}</h3>
                        <div className="space-y-3">
                            {approvedRequests.map(r => (
                                <div key={r.doctorId} className="p-3 list-item-bg rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{r.doctorName}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{r.doctorSpecialization}</p>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Access Granted</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRequest(r.doctorId, 'remove')} className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full hover:bg-red-500/20">{t('removeAccess')}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-600 dark:text-white/60 text-center py-8">{t('noApprovedAccess')}</p>
                )}
            </div>
            
            {/* Empty State */}
            {pendingRequests.length === 0 && approvedRequests.length === 0 && (
                <EmptyState
                    icon={<IconClipboardX className="h-10 w-10 text-gray-600" />}
                    title={t('noRequests')}
                    description={t('noRequestsHint')}
                />
            )}
        </div>
    );
};
