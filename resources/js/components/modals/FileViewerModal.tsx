
import React from 'react';
import { MedicalRecordFile } from '../../types';
import { useTranslations } from '../../contexts/TranslationContext';
import { ModalWrapper } from './ModalWrapper';

interface FileViewerModalProps {
    file: MedicalRecordFile;
    onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose }) => {
    const { t } = useTranslations();
    
    let content: React.ReactNode;
    if (file.mimeType.startsWith('image/')) {
        content = <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="max-w-full max-h-[80vh] object-contain" />;
    } else if (file.mimeType === 'application/pdf') {
        content = <iframe src={`data:application/pdf;base64,${file.data}`} className="w-[80vw] h-[80vh]" title={file.name}></iframe>;
    } else {
        content = <p className="text-white">Unsupported file type: {file.mimeType}</p>;
    }

    return (
        <ModalWrapper onClose={onClose} className="w-auto h-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <p className="text-sm font-plex-mono text-white">{file.name}</p>
                <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-4 flex items-center justify-center">
                {content}
            </div>
        </ModalWrapper>
    );
};
