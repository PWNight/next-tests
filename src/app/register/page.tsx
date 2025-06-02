'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('participant');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ru' },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await res.json();
            if (res.ok) {
                const loginRes = await fetch('http://localhost:8000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ru' },
                    body: JSON.stringify({ email, password }),
                });
                const loginData = await loginRes.json();
                if (loginRes.ok) {
                    login(loginData.access_token);
                } else {
                    router.push('/login');
                }
            } else {
                setError(data.detail || 'Ошибка регистрации');
            }
        } catch {
            setError('Произошла ошибка. Попробуйте снова.');
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-screen py-4">
            <Card className="w-full max-w-md sm:max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Регистрация</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Роль</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="border-2">
                                    <SelectValue placeholder="Выберите роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="participant">Участник</SelectItem>
                                    <SelectItem value="creator">Создатель</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full">Зарегистрироваться</Button>
                        <p className="text-center text-sm">
                            Уже есть аккаунт?{' '}
                            <Button
                                variant="link"
                                onClick={() => router.push('/login')}
                                className="text-primary"
                            >
                                Войти
                            </Button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}