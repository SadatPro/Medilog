import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
    return (
        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-800 rounded-lg animate-fade-in">
            <div className="mx-auto h-12 w-12 flex items-center justify-center text-gray-600">
                {icon}
            </div>
            <p className="mt-3 text-lg font-plex-mono text-white">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
};
