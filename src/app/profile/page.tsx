'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type TestAttempt = {
    test_id: number;
    test_title: string;
    start_time: string;
    end_time: string;
    score: number;
};

export default function ProfilePage() {
    const { user } = useContext(AuthContext);
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchAttempts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found in localStorage');
                    throw new Error('Не авторизован. Пожалуйста, войдите в систему.');
                }

                console.debug('Fetching test results with token:', token.slice(0, 10) + '...');
                const res = await fetch('http://localhost:8000/api/tests/results', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept-Language': 'ru',
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.log(errorData);
                    throw new Error(errorData.detail || `Ошибка ${res.status}`);
                }

                const data = await res.json();
                setAttempts(data.results || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла ошибка');
                console.error('Error fetching test results:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, [user, router]);

    if (!user) {
        return <div className="container flex items-center justify-center min-h-screen">Загрузка...</div>;
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-4">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Профиль</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Роль:</strong> {user.role === 'creator' ? 'Создатель' : 'Участник'}</p>
                        <p><strong>ID:</strong> {user.id}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Пройденные тесты</h3>
                        {loading ? (
                            <p>Загрузка...</p>
                        ) : error ? (
                            <p className="text-red-500 text-sm">{error}</p>
                        ) : attempts.length === 0 ? (
                            <p>Вы еще не проходили тесты</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px] sm:w-[250px]">Тест</TableHead>
                                            <TableHead className="w-[150px] sm:w-[200px]">Дата начала</TableHead>
                                            <TableHead className="w-[150px] sm:w-[200px]">Дата окончания</TableHead>
                                            <TableHead className="w-[100px]">Результат</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attempts.map((attempt, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{attempt.test_title}</TableCell>
                                                <TableCell>
                                                    {new Date(attempt.start_time).toLocaleString('ru-RU', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(attempt.end_time).toLocaleString('ru-RU', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell>{attempt.score.toFixed(1)}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}