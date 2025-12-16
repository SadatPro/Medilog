import React from 'react';
import { FaHeartbeat, FaCapsules, FaStethoscope } from 'react-icons/fa';

export const MedilogLogo: React.FC = () => {
    return (
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="relative flex items-center justify-center">
                    <FaHeartbeat className="h-8 w-8 text-white drop-shadow" />
                    <FaCapsules className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-300 drop-shadow" />
                </div>
            </div>
            <div className="flex items-start">
                <div className="mr-2 mt-1 text-white/80">
                    <FaStethoscope className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-plex-mono tracking-wider bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        Medilog
                    </h1>
                    <p className="text-xs text-white/60 font-plex-mono">AI-Powered Health Management</p>
                </div>
            </div>
        </div>
    );
};
