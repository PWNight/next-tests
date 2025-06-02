'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-4 space-y-6">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center">Добро пожаловать в Tests App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-center">
              Tests App — это современная платформа для создания, прохождения и анализа тестов. Независимо от того, являетесь ли вы преподавателем, тренером или студентом, наша платформа поможет вам организовать процесс тестирования.
            </p>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Возможности:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Создание тестов с открытыми вопросами и множественным выбором</li>
                <li>Гибкая настройка: таймеры, перемешивание вопросов</li>
                <li>Прохождение тестов в роли участника</li>
                <li>Анализ результатов и экспорт статистики в CSV, Excel, JSON</li>
                <li>Адаптивный и современный интерфейс</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              {user ? (
                  <Button onClick={() => router.push('/tests')} className="w-full sm:w-auto">
                    {user.role === 'creator' ? 'Мои тесты' : 'Доступные тесты'}
                  </Button>
              ) : (
                  <>
                    <Button onClick={() => router.push('/login')} className="w-full sm:w-auto">
                      Войти
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/register')} className="w-full sm:w-auto">
                      Зарегистрироваться
                    </Button>
                  </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}