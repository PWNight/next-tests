'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditTestPage() {
    const [test, setTest] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [questions, setQuestions] = useState([{ text: '', type: 'open', options: [''], correct_answer: '' }]);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { id } = useParams();

    useEffect(() => {
        if (!user) return;
        fetch(`http://localhost:8000/api/tests/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Accept-Language': 'ru',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setTest(data);
                setTitle(data.title);
                setDescription(data.description || '');
                setTimeLimit(data.time_limit?.toString() || '');
                setShuffleQuestions(data.shuffle_questions);
                setQuestions(
                    data.questions.map((q: any) => ({
                        text: q.text,
                        type: q.type,
                        options: q.options || [''],
                        correct_answer: q.correct_answer || '',
                    }))
                );
            })
            .catch(() => setError('Ошибка загрузки теста'));
    }, [user, id]);

    const addQuestion = () => {
        setQuestions([...questions, { text: '', type: 'open', options: [''], correct_answer: '' }]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const addOption = (index: number) => {
        const newQuestions = [...questions];
        newQuestions[index].options = [...newQuestions[index].options, ''];
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                title,
                description: description || null,
                time_limit: timeLimit ? parseInt(timeLimit) : null,
                shuffle_questions: shuffleQuestions,
                questions,
            };
            const res = await fetch(`http://localhost:8000/api/tests/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Accept-Language': 'ru',
                },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (res.ok) {
                router.push('/tests');
            } else {
                setError(result.detail || 'Ошибка обновления теста');
            }
        } catch {
            setError('Произошла ошибка. Попробуйте снова.');
        }
    };

    if (!user || user.role !== 'creator') {
        return <div className="container">Доступ запрещен</div>;
    }

    if (!test) {
        return <div className="container">Загрузка...</div>;
    }

    return (
        <div className="container">
            <Card>
                <CardHeader>
                    <CardTitle>Редактировать тест</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Название</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="description">Описание</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="timeLimit">Лимит времени (минуты)</Label>
                            <Input id="timeLimit" type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="shuffleQuestions"
                                checked={shuffleQuestions}
                                onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
                            />
                            <Label htmlFor="shuffleQuestions">Перемешивать вопросы</Label>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Вопросы</h3>
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="border p-4 rounded mb-4">
                                    <div>
                                        <Label>Текст вопроса</Label>
                                        <Textarea
                                            value={q.text}
                                            onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Тип вопроса</Label>
                                        <Select
                                            value={q.type}
                                            onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">Открытый</SelectItem>
                                                <SelectItem value="multiple_choice">Множественный выбор</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {q.type === 'multiple_choice' && (
                                        <>
                                            <div>
                                                <Label>Варианты ответа</Label>
                                                {q.options.map((opt, oIndex) => (
                                                    <Input
                                                        key={oIndex}
                                                        value={opt}
                                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                        className="mb-2"
                                                        placeholder={`Вариант ${oIndex + 1}`}
                                                    />
                                                ))}
                                                <Button type="button" variant="outline" onClick={() => addOption(qIndex)}>
                                                    Добавить вариант
                                                </Button>
                                            </div>
                                            <div>
                                                <Label>Правильный ответ</Label>
                                                <Select
                                                    value={q.correct_answer}
                                                    onValueChange={(value) => updateQuestion(qIndex, 'correct_answer', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите правильный ответ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {q.options.map((opt, oIndex) => (
                                                            <SelectItem key={oIndex} value={opt}>
                                                                {opt || `Вариант ${oIndex + 1}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                    {q.type === 'open' && (
                                        <div>
                                            <Label>Правильный ответ</Label>
                                            <Input
                                                value={q.correct_answer}
                                                onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addQuestion}>
                                Добавить вопрос
                            </Button>
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <Button type="submit" className="w-full">Сохранить изменения</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}