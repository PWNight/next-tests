'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function TakeTestPage() {
    const [test, setTest] = useState<any>(null);
    const [answers, setAnswers] = useState<{ question_id: number; answer: string; answer_time: number }[]>([]);
    const [error, setError] = useState('');
    const [startTime, setStartTime] = useState<number>(0);
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { id } = useParams();

    useEffect(() => {
        if (!user) return;
        fetch(`http://localhost:8000/api/tests/${id}/start`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Accept-Language': 'ru',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setTest(data);
                if (data.questions) {
                    setAnswers(data.questions.map((q: any) => ({ question_id: q.id, answer: '', answer_time: 0 })));
                    setStartTime(Date.now());
                }
            })
            .catch((err) => setError(err.detail || 'Ошибка запуска теста'));
    }, [user, id]);

    const handleAnswerChange = (qIndex: number, answer: string) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = {
            ...newAnswers[qIndex],
            answer,
            answer_time: (Date.now() - startTime) / 1000,
        };
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/tests/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Accept-Language': 'ru',
                },
                body: JSON.stringify({ answers }),
            });
            const result = await res.json();
            if (res.ok) {
                router.push(`/tests/`);
            } else {
                setError(result.detail || 'Ошибка отправки ответов');
            }
        } catch {
            setError('Произошла ошибка. Попробуйте снова.');
        }
    };

    if (!user || user.role !== 'participant') {
        return <div className="container">Доступ запрещен</div>;
    }

    if (!test) {
        return <div className="container">Загрузка...</div>;
    }

    return (
        <div className="container">
            <Card>
                <CardHeader>
                    <CardTitle>{test.test_id}: Прохождение теста</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500">{error}</p>}
                    {test.questions.map((q: any, qIndex: number) => (
                        <div key={q.id} className="mb-6">
                            <h3 className="text-lg font-semibold">{q.text}</h3>
                            {q.type === 'multiple_choice' ? (
                                <RadioGroup
                                    value={answers[qIndex]?.answer}
                                    onValueChange={(value) => handleAnswerChange(qIndex, value)}
                                >
                                    {q.options.map((opt: string, oIndex: number) => (
                                        <div key={oIndex} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt} id={`option-${q.id}-${oIndex}`} />
                                            <Label htmlFor={`option-${q.id}-${oIndex}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <Input
                                    value={answers[qIndex]?.answer}
                                    onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                    placeholder="Введите ответ"
                                />
                            )}
                        </div>
                    ))}
                    <Button onClick={handleSubmit} className="w-full">Отправить ответы</Button>
                </CardContent>
            </Card>
        </div>
    );
}