'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {Label} from "@/components/ui/label";

export default function StatsPage() {
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) return;
        fetch('http://localhost:8000/api/tests/me', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Accept-Language': 'ru',
            },
        })
            .then((res) => res.json())
            .then((data) => setTests(data.tests || []))
            .catch(() => setError('Ошибка загрузки тестов'));
    }, [user]);

    useEffect(() => {
        if (selectedTest) {
            fetch(`http://localhost:8000/api/tests/${selectedTest}/stats`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Accept-Language': 'ru',
                },
            })
                .then((res) => res.json())
                .then((data) => setStats(data))
                .catch(() => setError('Ошибка загрузки статистики'));
        }
    }, [selectedTest]);

    const handleExport = async (format: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/tests/${selectedTest}/stats/export?format=${format}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Accept-Language': 'ru',
                },
            });
            const disposition = res.headers.get('Content-Disposition');
            const filename = disposition?.match(/filename="(.+)"/)?.[1] || `stats.${format}`;
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            setError('Ошибка экспорта');
        }
    };

    if (!user || user.role !== 'creator') {
        return <div className="container">Доступ запрещен</div>;
    }

    return (
        <div className="container">
            <Card>
                <CardHeader>
                    <CardTitle>Статистика тестов</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Label htmlFor="testSelect">Выберите тест</Label>
                        <Select value={selectedTest} onValueChange={setSelectedTest}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите тест" />
                            </SelectTrigger>
                            <SelectContent>
                                {tests.map((test: any) => (
                                    <SelectItem key={test.id} value={test.id.toString()}>
                                        {test.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    {stats && (
                        <>
                            <p><strong>Средняя оценка:</strong> {stats.average_score}%</p>
                            <p><strong>Среднее время прохождения:</strong> {stats.completion_time} сек</p>
                            <h3 className="text-lg font-semibold mt-4">Сложность вопросов</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Вопрос</TableHead>
                                        <TableHead>Процент правильных ответов</TableHead>
                                        <TableHead>Среднее время ответа (сек)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(stats.difficulty).map(([qId, data]: [string, any]) => (
                                        <TableRow key={qId}>
                                            <TableCell>{qId}</TableCell>
                                            <TableCell>{data.correct_percentage.toFixed(1)}%</TableCell>
                                            <TableCell>{data.average_time.toFixed(1)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4 space-x-2">
                                <Button onClick={() => handleExport('csv')}>Экспорт в CSV</Button>
                                <Button onClick={() => handleExport('excel')}>Экспорт в Excel</Button>
                                <Button onClick={() => handleExport('json')}>Экспорт в JSON</Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}