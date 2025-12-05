import React, { useEffect, useRef, ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface ModalWrapperProps {
    children: ReactNode;
    onClose: () => void;
    className?: string;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose, className = "w-full max-w-md" }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div ref={modalRef} className={`${className} modal-bg rounded-lg shadow-2xl`}>
                {children}
            </div>
        </div>,
        document.body
    );
};