'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useResourceStore } from '@/lib/store';
import { User } from '@/types';

export default function AuthSync() {
    const { setUser, setSession, setLoading } = useAuthStore();
    const { refreshFromSupabase } = useResourceStore();

    useEffect(() => {
        // 0. Global Store Sync
        refreshFromSupabase();

        // 1. Initial Check
        const checkSession = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setSession(session);

                // Fetch extra profile info (including role) from public table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                const userObj: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: profile?.full_name || session.user.user_metadata.full_name || 'User',
                    addresses: profile?.addresses || [],
                    created_at: session.user.created_at,
                    avatar_url: profile?.avatar_url || session.user.user_metadata.avatar_url,
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

                // Also fetch here during login/auth state changes
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data: profile }) => {
                        const userObj: User = {
                            id: session.user.id,
                            email: session.user.email || '',
                            full_name: profile?.full_name || session.user.user_metadata.full_name || 'User',
                            addresses: profile?.addresses || [],
                            created_at: session.user.created_at,
                            avatar_url: profile?.avatar_url || session.user.user_metadata.avatar_url,
                        };
                        setUser(userObj);
                    });
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
