'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type TestResult = {
    score: number;
    correct_answers: { question_id: number; correct_answer: string }[];
};

export default function TestResultPage() {
    const [result, setResult] = useState<TestResult | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        if (!id) return;

        const fetchResult = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/tests/${id}/result`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Accept-Language': 'ru',
                    },
                });

                if (!res.ok) {
                    throw new Error('Ошибка получения результатов');
                }

                const data = await res.json();
                setResult(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [id]);

    if (loading) {
        return <div className="container flex items-center justify-center min-h-screen">Загрузка...</div>;
    }

    if (error) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <Card>
                    <CardHeader>
                        <CardTitle>Ошибка</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">{error}</p>
                        <Button onClick={() => router.push('/tests')} className="mt-4">
                            Вернуться к тестам
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <Card>
                    <CardHeader>
                        <CardTitle>Результаты не найдены</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/tests')} className="mt-4">
                            Вернуться к тестам
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Результаты теста</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">
                        <strong>Оценка:</strong>{' '}
                        {typeof result.score === 'number' ? `${result.score.toFixed(1)}%` : 'Н/Д'}
                    </p>
                    <h3 className="text-lg font-semibold mt-4">Правильные ответы:</h3>
                    {result.correct_answers && result.correct_answers.length > 0 ? (
                        <div className="space-y-2">
                            {result.correct_answers.map((ans) => (
                                <div key={ans.question_id} className="border-b pb-2">
                                    <p>
                                        <strong>Вопрос {ans.question_id}:</strong> {ans.correct_answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Правильные ответы не предоставлены</p>
                    )}
                    <Button onClick={() => router.push('/tests')} className="mt-6 w-full sm:w-auto">
                        Вернуться к тестам
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}