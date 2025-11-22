"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

interface User {
    id: number;
    email: string;
    username?: string;
    name?: string;
}

export function useAuth(requireAuth: boolean = true) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem('auth_token');

            if (!token && requireAuth) {
                router.push('/login');
                return;
            }

            if (token) {
                try {
                    const { response, data } = await api.getCurrentUser();
                    if (response.ok && data.data) {
                        setUser(data.data);
                    } else if (requireAuth) {
                        localStorage.removeItem('auth_token');
                        router.push('/login');
                    }
                } catch (error) {
                    if (requireAuth) {
                        localStorage.removeItem('auth_token');
                        router.push('/login');
                    }
                }
            }

            setLoading(false);
        }

        checkAuth();
    }, [requireAuth, router]);

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        router.push('/login');
    };

    return { user, loading, logout };
}
