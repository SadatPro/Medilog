import React from 'react';
import { User, UserType, Theme } from '../types';
import { Header } from './Header';
import { DoctorPortal } from './DoctorPortal';
import { PatientPortal } from './PatientPortal';

interface PortalViewProps {
    user: User;
    userType: UserType;
    onLogout: () => void;
    theme: Theme;
    onThemeChange: () => void;
    onUpdateUser: () => void;
}

export const PortalView: React.FC<PortalViewProps> = ({ user, userType, onLogout, theme, onThemeChange, onUpdateUser }) => {
    return (
        <div>
            <Header
                user={user}
                onLogout={onLogout}
                theme={theme}
                onThemeChange={onThemeChange}
                onUpdateUser={onUpdateUser}
            />
            <main className="container mx-auto p-4 md:p-8">
                {userType === 'doctor' && <DoctorPortal doctor={user as any} />}
                {userType === 'patient' && <PatientPortal patient={user as any} onUpdateUser={onUpdateUser} />}
            </main>
        </div>
    );
};