import React, { useState, useMemo } from 'react';
import { Patient, Prescription, MedicalRecord, PrescriptionRecord, MedicalRecordFile } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { IconCalendar, IconDocument, IconPrescription, IconChevronLeft, IconChevronRight, IconClipboardX } from './icons'; 
import { PrescriptionDetailModal } from './modals/PrescriptionDetailModal';
import { FileViewerModal } from './modals/FileViewerModal';
import { AddRecordModal } from './modals/AddRecordModal';
import { AddPrescriptionRecordModal } from './modals/AddPrescriptionRecordModal';
import { EmptyState } from './EmptyState';

interface PatientHistoryProps {
    patient: Patient;
    userType: 'doctor' | 'patient';
    onUpdate?: () => void;
}

const REPORTS_PER_PAGE = 5;

const PrescriptionListItem: React.FC<{ prescription: Prescription; onClick: (p: Prescription) => void; }> = ({ prescription, onClick }) => {
    const { t } = useTranslations();
    return (
        <div onClick={() => onClick(prescription)} className="p-4 list-item-bg rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <IconPrescription className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="font-semibold text-white">{t('composePrescription')} - Dr. {prescription.doctor.name}</p>
                        <p className="text-xs text-gray-500">{prescription.items.length} medicines</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-plex-mono text-sm text-white">{new Date(prescription.date).toLocaleDateString('en-GB')}</p>
                    <span className="text-xs font-plex-mono text-gray-400 mt-1">{t('viewDetails')}</span>
                </div>
            </div>
        </div>
    );
};

type ReportItem = (MedicalRecord & { kind: 'medicalRecord' }) | (PrescriptionRecord & { kind: 'prescriptionRecord' });

const ReportListItem: React.FC<{ report: ReportItem; onClick: (f: MedicalRecordFile) => void; }> = ({ report, onClick }) => {
    const title = report.name;
    const subtitle = report.kind === 'medicalRecord' 
        ? `${report.type}${report.institution ? ` • ${report.institution}` : ''}` 
        : report.institution || 'Uploaded Prescription';

    return (
        <div onClick={() => report.file && onClick(report.file)} className={`p-4 list-item-bg rounded-lg ${report.file ? 'cursor-pointer hover:bg-gray-700 transition-colors' : ''}`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <IconDocument className="h-5 w-5 text-gray-400" />
                    <div>
                        <p className="font-semibold text-white">{title}</p>
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                </div>
                <p className="font-plex-mono text-sm text-white">{new Date(report.date).toLocaleDateString('en-GB')}</p>
            </div>
        </div>
    );
};


export const PatientHistory: React.FC<PatientHistoryProps> = ({ patient, userType, onUpdate }) => {
    const { t } = useTranslations();
    const [activeTab, setActiveTab] = useState<'prescriptions' | 'reports'>('prescriptions');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [viewingFile, setViewingFile] = useState<MedicalRecordFile | null>(null);
    const [isAddMedicalModalOpen, setIsAddMedicalModalOpen] = useState(false);
    const [isAddPrescriptionModalOpen, setIsAddPrescriptionModalOpen] = useState(false);

    const sortedReports = useMemo(() => {
        const allReports: ReportItem[] = [
            ...(patient.records || []).map(r => ({ ...r, kind: 'medicalRecord' as const })),
            ...(patient.prescriptionRecords || []).map(pr => ({ ...pr, kind: 'prescriptionRecord' as const }))
        ];
        return allReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [patient.records, patient.prescriptionRecords]);

    const totalPages = Math.ceil(sortedReports.length / REPORTS_PER_PAGE);
    const paginatedReports = sortedReports.slice((currentPage - 1) * REPORTS_PER_PAGE, currentPage * REPORTS_PER_PAGE);

    const sortedPrescriptions = useMemo(() => {
        return (patient.prescriptions || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [patient.prescriptions]);
    
    const handleCloseModals = () => {
        setSelectedPrescription(null);
        setViewingFile(null);
        setIsAddMedicalModalOpen(false);
        setIsAddPrescriptionModalOpen(false);
    }

    return (
        <>
            <div className="p-6 card-bg rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <IconCalendar className="h-6 w-6 text-gray-400" />
                        <h2 className="font-plex-mono text-xl text-white">{t('patientHistory')}</h2>
                    </div>
                     {userType === 'patient' && (
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddMedicalModalOpen(true)} className="px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-xs font-plex-mono">{t('uploadRecord')}</button>
                            <button onClick={() => setIsAddPrescriptionModalOpen(true)} className="px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-xs font-plex-mono">{t('uploadPrescription')}</button>
                        </div>
                    )}
                </div>
                
                <div className="flex border-b border-gray-700 mb-4">
                    <button onClick={() => { setActiveTab('prescriptions'); setCurrentPage(1); }} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'prescriptions' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>{t('prescriptions')}</button>
                    <button onClick={() => { setActiveTab('reports'); setCurrentPage(1); }} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'reports' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>{t('reports')}</button>
                </div>

                <div className="min-h-[300px]">
                    {activeTab === 'prescriptions' && (
                        <div className="space-y-3 animate-fade-in">
                            {sortedPrescriptions.length > 0 ? (
                                sortedPrescriptions.map(p => <PrescriptionListItem key={p.id} prescription={p} onClick={setSelectedPrescription} />)
                            ) : (
                                <EmptyState icon={<IconClipboardX />} title={t('noPrescriptions')} description={t('noPrescriptionsHint')} />
                            )}
                        </div>
                    )}
                    {activeTab === 'reports' && (
                        <div className="animate-fade-in">
                            <div className="space-y-3">
                                {paginatedReports.length > 0 ? (
                                     paginatedReports.map(r => <ReportListItem key={`${r.kind}-${r.id}`} report={r} onClick={setViewingFile} />)
                                ) : (
                                    <EmptyState icon={<IconClipboardX />} title={t('noRecords')} description={t('noRecordsHint')} />
                                )}
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-4 flex justify-between items-center">
                                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-xs font-plex-mono disabled:opacity-50">
                                        <IconChevronLeft />
                                        {t('previousPage')}
                                    </button>
                                    <span className="text-xs font-plex-mono text-gray-400">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-xs font-plex-mono disabled:opacity-50">
                                        {t('nextPage')}
                                        <IconChevronRight />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {selectedPrescription && <PrescriptionDetailModal patient={patient} prescription={selectedPrescription} onClose={handleCloseModals} />}
            {viewingFile && <FileViewerModal file={viewingFile} onClose={handleCloseModals} />}
            {isAddMedicalModalOpen && onUpdate && <AddRecordModal patient={patient} onClose={handleCloseModals} onUpdate={onUpdate} />}
            {isAddPrescriptionModalOpen && onUpdate && <AddPrescriptionRecordModal patient={patient} onClose={handleCloseModals} onUpdate={onUpdate} />}
        </>
    );
};
