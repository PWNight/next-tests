'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <div className="container">Загрузка...</div>;
    }

    return (
        <div className="container">
            <Card>
                <CardHeader>
                    <CardTitle>Профиль</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Роль:</strong> {user.role === 'creator' ? 'Создатель' : 'Участник'}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                </CardContent>
            </Card>
        </div>
    );
}