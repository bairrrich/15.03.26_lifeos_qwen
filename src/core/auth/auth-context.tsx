'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getLocalUser, signInLocally, signOutLocally, onAuthStateChange, type LocalUser } from '@/core/auth';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
    id: string;
    email: string;
    isLocal: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string) => AuthUser;
    signOut: () => void;
    isLocalMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем текущего пользователя при загрузке
        const localUser = getLocalUser();
        if (localUser) {
            setUser({
                id: localUser.id,
                email: localUser.email,
                isLocal: true,
            });
        }
        setLoading(false);

        // Подписываемся на изменения
        const subscription = onAuthStateChange((supabaseUser: User | null) => {
            if (supabaseUser) {
                setUser({
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    isLocal: false,
                });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = (email: string): AuthUser => {
        const localUser = signInLocally(email);
        const authUser: AuthUser = {
            id: localUser.id,
            email: localUser.email,
            isLocal: true,
        };
        setUser(authUser);
        return authUser;
    };

    const signOut = () => {
        signOutLocally();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signOut,
                isLocalMode: user?.isLocal ?? false,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useCurrentUser() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return user;
}
