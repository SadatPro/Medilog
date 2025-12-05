import React, { useState, useCallback } from 'react';
import { Patient, PrescriptionItem, Finding } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { MedicineSearch } from './MedicineSearch';
import { PrescriptionList } from './PrescriptionList';
import { InteractionChecker } from './InteractionChecker';
import { PrintPreviewModal } from './modals/PrintPreviewModal';
import { apiService } from '../services/apiService';
import { IconFlask, IconClipboardList, IconTrash, IconClipboardCheck, IconPrescription } from './icons';

interface PrescriptionComposerProps {
    patient: Patient;
    onSuccess: () => void;
}

const AdviceSection: React.FC<{
    title: string;
    placeholder: string;
    items: string[];
    onAdd: (item: string) => void;
    onRemove: (index: number) => void;
    icon: React.ReactNode;
}> = ({ title, placeholder, items, onAdd, onRemove, icon }) => {
    const { t } = useTranslations();
    const [input, setInput] = useState('');

    const handleAdd = () => {
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    };

    return (
        <fieldset className="p-4 list-item-bg rounded-lg">
            <legend className="px-2 font-plex-mono text-sm text-white flex items-center gap-2">
                {icon}
                <span>{title}</span>
            </legend>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    placeholder={placeholder}
                    className="flex-grow px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="action-btn px-4 py-2 bg-white text-black rounded-md font-semibold text-sm hover:bg-gray-300 transition-colors"
                >
                    {t('add')}
                </button>
            </div>
            {items.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center bg-black/50 p-2 rounded-md animate-fade-in">
                            <span className="text-sm text-gray-300">{item}</span>
                            <button onClick={() => onRemove(index)} className="text-gray-500 hover:text-red-500">
                                <IconTrash />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </fieldset>
    );
};

const FindingsSection: React.FC<{
    patient: Patient;
    findings: Finding[];
    onAddFinding: (finding: Finding) => void;
    onRemoveFinding: (index: number) => void;
}> = ({ patient, findings, onAddFinding, onRemoveFinding }) => {
    const { t } = useTranslations();
    const [selectedRecord, setSelectedRecord] = useState('');
    const [comment, setComment] = useState('');

    const allRecords = [
        ...patient.records.map(r => ({ ...r, recordType: 'medical' as const })),
        ...patient.prescriptionRecords.map(r => ({ ...r, recordType: 'prescription' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAddFinding = () => {
        const [type, id] = selectedRecord.split('-');
        const record = allRecords.find(r => r.id === id);
        if (record && comment.trim()) {
            onAddFinding({
                recordId: record.id,
                recordName: `${record.name} (${new Date(record.date).toLocaleDateString('en-CA')})${record.institution ? ` - ${record.institution}` : ''}`,
                recordType: type as 'medical' | 'prescription',
                comment: comment.trim(),
            });
            setSelectedRecord('');
            setComment('');
        }
    };

    return (
        <fieldset className="p-4 list-item-bg rounded-lg">
            <legend className="px-2 font-plex-mono text-sm text-white flex items-center gap-2">
                <IconClipboardCheck />
                <span>{t('findings')}</span>
            </legend>
            <div className="space-y-3">
                <select
                    value={selectedRecord}
                    onChange={(e) => setSelectedRecord(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"
                >
                    <option value="" disabled>{t('selectRecord')}</option>
                    {allRecords.length > 0 ? (
                        allRecords.map(r => (
                            <option key={`${r.recordType}-${r.id}`} value={`${r.recordType}-${r.id}`}>
                                {r.name} ({new Date(r.date).toLocaleDateString('en-CA')})
                            </option>
                        ))
                    ) : (
                        <option disabled>{t('noRecordsToComment')}</option>
                    )}
                </select>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('comment')}
                    rows={2}
                    className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"
                />
                <button
                    type="button"
                    onClick={handleAddFinding}
                    disabled={!selectedRecord || !comment.trim()}
                    className="w-full action-btn py-2 bg-white text-black rounded-md font-semibold text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                    {t('addFinding')}
                </button>
                 {findings.length > 0 && (
                    <ul className="mt-3 space-y-2 border-t border-gray-700 pt-3">
                        {findings.map((finding, index) => (
                            <li key={index} className="bg-black/50 p-2 rounded-md animate-fade-in text-sm">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-300">{finding.recordName}</p>
                                    <button onClick={() => onRemoveFinding(index)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-2">
                                        <IconTrash />
                                    </button>
                                </div>
                                <p className="text-gray-400 mt-1">"{finding.comment}"</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </fieldset>
    );
};

export const PrescriptionComposer: React.FC<PrescriptionComposerProps> = ({ patient, onSuccess }) => {
    const { t } = useTranslations();
    const [items, setItems] = useState<PrescriptionItem[]>([]);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [investigations, setInvestigations] = useState<string[]>([]);
    const [advice, setAdvice] = useState<string[]>([]);
    const [followUp, setFollowUp] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const handleAddItem = (item: PrescriptionItem) => {
        setItems(prev => [...prev, item]);
    };

    const handleSaveAndPrint = async () => {
        const prescriptionData = { items, findings, investigations, advice, followUp };
        await apiService.addPrescription(patient.id, prescriptionData);
        onSuccess();
        window.print();
    };

    const resetComposer = () => {
        setItems([]);
        setFindings([]);
        setInvestigations([]);
        setAdvice([]);
        setFollowUp('');
    };

    return (
        <>
            <div className="p-6 card-bg rounded-lg shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <IconPrescription className="h-6 w-6 text-gray-400" />
                    <h2 className="font-plex-mono text-xl text-white">{t('composePrescription')}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-3 space-y-4">
                        <MedicineSearch onAddItem={handleAddItem} />
                        <PrescriptionList items={items} onUpdateItems={setItems} />
                    </div>

                    {/* Side Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <InteractionChecker items={items} />
                        <FindingsSection
                            patient={patient}
                            findings={findings}
                            onAddFinding={(f) => setFindings(prev => [...prev, f])}
                            onRemoveFinding={(i) => setFindings(prev => prev.filter((_, idx) => idx !== i))}
                        />
                        <AdviceSection
                            title={t('investigations')}
                            placeholder={t('addInvestigation')}
                            items={investigations}
                            onAdd={(item) => setInvestigations(prev => [...prev, item])}
                            onRemove={(i) => setInvestigations(prev => prev.filter((_, idx) => idx !== i))}
                            icon={<IconFlask />}
                        />
                        <AdviceSection
                            title={t('advice')}
                            placeholder={t('addAdvice')}
                            items={advice}
                            onAdd={(item) => setAdvice(prev => [...prev, item])}
                            onRemove={(i) => setAdvice(prev => prev.filter((_, idx) => idx !== i))}
                            icon={<IconClipboardList />}
                        />
                         <fieldset className="p-4 list-item-bg rounded-lg">
                            <legend className="px-2 font-plex-mono text-sm text-white">
                                {t('followUp')}
                            </legend>
                            <input
                                type="text"
                                value={followUp}
                                onChange={(e) => setFollowUp(e.target.value)}
                                placeholder={t('recheckupTime')}
                                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-sm"
                            />
                        </fieldset>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => setShowPreview(true)}
                        disabled={items.length === 0}
                        className="action-btn px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-900 disabled:text-gray-600"
                    >
                        {t('finalizePrint')}
                    </button>
                </div>
            </div>

            {showPreview && (
                <PrintPreviewModal
                    patient={patient}
                    items={items}
                    findings={findings}
                    investigations={investigations}
                    advice={advice}
                    followUp={followUp}
                    onClose={() => setShowPreview(false)}
                    onSaveAndPrint={() => handleSaveAndPrint().then(() => {
                        setShowPreview(false);
                        resetComposer();
                    })}
                />
            )}
        </>
    );
};
