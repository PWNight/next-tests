'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TestsPage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!user) return;
        const endpoint = user.role === 'creator' ? '/api/tests/me' : '/api/tests';
        fetch(`http://localhost:8000${endpoint}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Accept-Language': 'ru',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setTests(data.tests || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Ошибка загрузки тестов');
                setLoading(false);
            });
    }, [user]);

    if (!user) {
        return <div className="container">Загрузка...</div>;
    }

    return (
        <div className="container">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">{user.role === 'creator' ? 'Мои тесты' : 'Доступные тесты'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : error ? (
                        <p className="text-red-500 text-sm">{error}</p>
                    ) : tests.length === 0 ? (
                        <p>Тесты не найдены</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px] sm:w-[300px]">Название</TableHead>
                                        <TableHead>Описание</TableHead>
                                        <TableHead className="w-[100px]">Вопросы</TableHead>
                                        <TableHead className="w-[200px] sm:w-[300px]">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tests.map((test: any) => (
                                        <TableRow key={test.id}>
                                            <TableCell className="font-medium">{test.title}</TableCell>
                                            <TableCell>{test.description || '-'}</TableCell>
                                            <TableCell>{test.question_count}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    {user.role === 'creator' ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="hover:scale-105 active:scale-95 transition-transform duration-200"
                                                                onClick={() => router.push(`/tests/edit/${test.id}`)}
                                                            >
                                                                Редактировать
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="hover:scale-105 active:scale-95 transition-transform duration-200"
                                                                onClick={async () => {
                                                                    if (confirm('Удалить тест?')) {
                                                                        await fetch(`http://localhost:8000/api/tests/${test.id}`, {
                                                                            method: 'DELETE',
                                                                            headers: {
                                                                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                                                'Accept-Language': 'ru',
                                                                            },
                                                                        });
                                                                        setTests(tests.filter((t: any) => t.id !== test.id));
                                                                    }
                                                                }}
                                                            >
                                                                Удалить
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="hover:scale-105 active:scale-95 transition-transform duration-200"
                                                            onClick={() => router.push(`/tests/take/${test.id}`)}
                                                        >
                                                            Пройти
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}