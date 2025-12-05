
import React from 'react';

export const IconDroplet: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c-3.23.003-6.1-1.93-7.397-4.908l-.513-1.218a9.75 9.75 0 01-1.84-4.32C2.25 6.438 6.438 2.25 11.25 2.25c4.812 0 9 4.188 9 9 0 1.62-.463 3.14-1.28 4.49l-.513 1.217c-1.297 2.978-4.167 4.91-7.397 4.91z" />
    </svg>
);
