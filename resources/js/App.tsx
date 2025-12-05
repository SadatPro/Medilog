import React, { useState, useEffect, useCallback } from 'react';
import { User, UserType, Language, Theme, Patient } from './types';
import { apiService } from './services/apiService';
import { AuthView } from './components/AuthView';
import { PortalView } from './components/PortalView';
import { TranslationProvider } from './contexts/TranslationContext';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
        const [userType, setUserType] = useState<UserType | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [theme, setTheme] = useState<Theme>('dark');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('medilog-theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('light-theme', theme === 'light');
        document.body.classList.toggle('font-bengali', language === 'bn');
        document.documentElement.lang = language;
    }, [theme, language]);

    const handleLogin = useCallback(async (type: UserType, identifier: string, password?: string) => {
        let loggedInUser: User | undefined;
        if (type === 'doctor') {
            loggedInUser = await apiService.loginDoctor(identifier, password);
        } else {
            loggedInUser = await apiService.loginPatient(identifier, password);
        }

        if (loggedInUser) {
            setUser(loggedInUser);
            setUserType(type);
        } else {
            throw new Error("Invalid credentials");
        }
    }, []);
    
    const handleUpdateUser = useCallback(async () => {
        if (user && userType) {
            const identifier = userType === 'patient' ? (user as Patient).username : user.id;
             let updatedUser: User | undefined;
            if (userType === 'patient') {
                updatedUser = await apiService.getPatient(identifier);
            } else {
                updatedUser = await apiService.getDoctor(identifier);
            }
            if (updatedUser) {
                setUser(updatedUser);
            }
        }
    }, [user, userType]);

    const handleRegister = useCallback((newUser: User, type: UserType) => {
        setUser(newUser);
        setUserType(type);
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
        setUserType(null);
    }, []);
    
    const handleThemeChange = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('medilog-theme', newTheme);
            return newTheme;
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <TranslationProvider language={language} setLanguage={setLanguage}>
            <div className="min-h-screen">
                {user && userType ? (
                    <PortalView
                        user={user}
                        userType={userType}
                        onLogout={handleLogout}
                        theme={theme}
                        onThemeChange={handleThemeChange}
                        onUpdateUser={handleUpdateUser}
                    />
                ) : (
                    <AuthView
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                        theme={theme}
                        onThemeChange={handleThemeChange}
                    />
                )}
            </div>
        </TranslationProvider>
    );
};

export default App;