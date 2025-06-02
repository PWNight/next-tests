'use client';

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    id: number;
    email: string;
    role: 'participant' | 'creator';
};

type AuthContextType = {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {},
    setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:8000/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.id) {
                        setUser({ id: data.id, email: data.email, role: data.role });
                    } else {
                        localStorage.removeItem('token');
                        router.push('/login');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    router.push('/login');
                });
        }
    }, [router]);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        fetch('http://localhost:8000/api/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.id) {
                    setUser({ id: data.id, email: data.email, role: data.role });
                    router.push(data.role === 'creator' ? '/tests' : '/tests');
                }
            });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}