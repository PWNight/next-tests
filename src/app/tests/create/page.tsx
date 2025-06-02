'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

export default function CreateTestPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [questions, setQuestions] = useState([
        { text: '', type: 'open', options: [''] as string[], correct_answer: '' },
    ]);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const router = useRouter();

    const addQuestion = () => {
        setQuestions([...questions, { text: '', type: 'open', options: [''], correct_answer: '' }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) {
            setError('Тест должен содержать хотя бы один вопрос');
            return;
        }
        setQuestions(questions.filter((_, i) => i !== index));
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

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options.length <= 2) {
            setError('Вопрос с множественным выбором должен иметь минимум два варианта');
            return;
        }
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        if (newQuestions[qIndex].correct_answer === newQuestions[qIndex].options[oIndex]) {
            newQuestions[qIndex].correct_answer = '';
        }
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const validateForm = () => {
        if (!title.trim()) {
            return 'Название теста обязательно';
        }
        if (timeLimit && (isNaN(parseInt(timeLimit)) || parseInt(timeLimit) <= 0)) {
            return 'Лимит времени должен быть положительным числом';
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                return `Текст вопроса ${i + 1} обязателен`;
            }
            if (!q.correct_answer.trim()) {
                return `Правильный ответ для вопроса ${i + 1} обязателен`;
            }
            if (q.type === 'multiple_choice') {
                const validOptions = q.options.filter(opt => opt.trim());
                if (validOptions.length < 2) {
                    return `Вопрос ${i + 1} должен иметь минимум два непустых варианта ответа`;
                }
                if (!validOptions.includes(q.correct_answer)) {
                    return `Правильный ответ для вопроса ${i + 1} должен быть одним из вариантов`;
                }
            }
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const data = {
                title,
                description: description.trim() || null,
                time_limit: timeLimit ? parseInt(timeLimit) : null,
                shuffle_questions: shuffleQuestions,
                questions: questions.map(q => ({
                    ...q,
                    options: q.type === 'multiple_choice' ? q.options.filter(opt => opt.trim()) : [],
                })),
            };
            const res = await fetch('http://localhost:8000/api/tests', {
                method: 'POST',
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
                setError(result.detail || 'Ошибка создания теста');
            }
        } catch {
            setError('Произошла ошибка. Попробуйте снова.');
        }
    };

    if (!user || user.role !== 'creator') {
        return <div className="container flex items-center justify-center min-h-screen">Доступ запрещен</div>;
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-4">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Создать тест</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <Input
                                id="timeLimit"
                                type="number"
                                min="1"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(e.target.value)}
                            />
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
                            <h3 className="text-lg font-semibold mb-4">Вопросы</h3>
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="border p-4 rounded mb-4 space-y-4 relative">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        onClick={() => removeQuestion(qIndex)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
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
                                                <SelectValue placeholder="Выберите тип ответа" />
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
                                                    <div key={oIndex} className="flex items-center space-x-2 mb-2">
                                                        <Input
                                                            value={opt}
                                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                            placeholder={`Вариант ${oIndex + 1}`}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => removeOption(qIndex, oIndex)}
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
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
                                                        {q.options
                                                            .map((opt, oIndex) => ({ opt, oIndex }))
                                                            .filter(({ opt }) => opt.trim())
                                                            .map(({ opt, oIndex }) => (
                                                                <SelectItem key={oIndex} value={opt}>
                                                                    {opt}
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
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addQuestion}>
                                Добавить вопрос
                            </Button>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full sm:w-auto">Создать тест</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}