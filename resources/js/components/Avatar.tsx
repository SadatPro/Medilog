import React from 'react';
import { User } from '../types';

interface AvatarProps {
    user: User | { name: string; profilePictureUrl?: string };
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
};

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'sm', className }) => {
    const baseClasses = "rounded-full flex items-center justify-center font-plex-mono text-white object-cover";

    if (user.profilePictureUrl) {
        return (
            <img
                src={user.profilePictureUrl}
                alt={user.name}
                className={`${baseClasses} ${sizeClasses[size]} ${className}`}
            />
        );
    }

    return (
        <div className={`${baseClasses} ${sizeClasses[size]} bg-gray-700 border-2 border-gray-600 ${className}`}>
            {user.name?.charAt(0).toUpperCase() || '?'}
        </div>
    );
};
