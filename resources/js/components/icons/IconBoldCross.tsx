
import React from 'react';

export const IconBoldCross: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c.414 0 .75.336.75.75v8.25h8.25a.75.75 0 010 1.5h-8.25v8.25a.75.75 0 01-1.5 0v-8.25H3a.75.75 0 010-1.5h8.25V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);
