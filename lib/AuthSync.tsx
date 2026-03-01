'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { User } from '@/types';

export default function AuthSync() {
    const { setUser, setSession, setLoading } = useAuthStore();

    useEffect(() => {
        // 1. Initial Check
        const checkSession = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setSession(session);
                const userObj: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: session.user.user_metadata.full_name || 'User',
                    addresses: [],
                    created_at: session.user.created_at,
                };
                setUser(userObj);
            } else {
                setUser(null);
                setSession(null);
            }
            setLoading(false);
        };

        checkSession();

        // 2. Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession(session);
                const userObj: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: session.user.user_metadata.full_name || 'User',
                    addresses: [],
                    created_at: session.user.created_at,
                };
                setUser(userObj);
            } else {
                setUser(null);
                setSession(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [setUser, setSession, setLoading]);

    return null;
}
