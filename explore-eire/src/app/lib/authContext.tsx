"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

// define the shape of the auth context
interface AuthContextType {
    user: User | null;
    session: Session | null;
}

// create the auth context with an initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth provider component to wrap around parts of the app that need auth info
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    // use effect to listen for auth state changes
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(event, session);

            // update user and session state based on auth events
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                setUser(session?.user ?? null);
                setSession(session);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setSession(null);
            }
        });

        // clean up the listener on component unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // provide the user and session state to children components
    return (
        <AuthContext.Provider value={{ user, session }}>
            {children}
        </AuthContext.Provider>
    );
};

// custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};