'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import {Sun, Moon, LogOut, User, FileText, BarChart2, Menu, X, Settings2} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-primary-foreground"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <aside
                className={cn(
                    'w-64 bg-card shadow-lg lg:static fixed top-0 left-0 h-full z-40 transition-transform duration-300',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="p-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-primary">Tests App</h2>
                    <button
                        className="lg:hidden p-2"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex flex-col p-4 space-y-2">
                    {user && (
                        <>
                            <Button
                                variant="ghost"
                                className="flex items-center justify-start w-full p-2 text-left rounded-md hover:bg-accent hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary"
                                onClick={() => router.push('/profile')}
                            >
                                <User className="mr-2 h-5 w-5" /> Профиль
                            </Button>
                            {user.role === 'creator' ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center justify-start w-full p-2 text-left rounded-md hover:bg-accent hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary"
                                        onClick={() => router.push('/tests')}
                                    >
                                        <FileText className="mr-2 h-5 w-5" /> Мои тесты
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center justify-start w-full p-2 text-left rounded-md hover:bg-accent hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary"
                                        onClick={() => router.push('/tests/create')}
                                    >
                                        <FileText className="mr-2 h-5 w-5" /> Создать тест
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="flex items-center justify-start w-full p-2 text-left rounded-md hover:bg-accent hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary"
                                    onClick={() => router.push('/tests')}
                                >
                                    <FileText className="mr-2 h-5 w-5" /> Доступные тесты
                                </Button>
                            )}
                            {user.role === 'creator' && (
                                <Button
                                    variant="ghost"
                                    className="flex items-center justify-start w-full p-2 text-left rounded-md hover:bg-accent hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary"
                                    onClick={() => router.push('/stats')}
                                >
                                    <BarChart2 className="mr-2 h-5 w-5" /> Статистика
                                </Button>
                            )}
                        </>
                    )}
                    <Button
                        variant="ghost"
                        className="flex items-center justify-start w-full p-2 text-left rounded-md hover:bg-accent hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Settings2 className="mr-2 h-5 w-5"/> Сменить тему
                    </Button>
                    {user && (
                        <Button
                            variant="ghost"
                            className="flex items-center justify-start w-full p-2 text-left rounded-md hover:bg-accent hover:shadow-lg transition-all duration-200 border border-transparent hover:border-red-500 text-red-600"
                            onClick={() => {
                                logout();
                                router.push('/login');
                            }}
                        >
                            <LogOut className="mr-2 h-5 w-5" /> Выйти
                        </Button>
                    )}
                </nav>
            </aside>
        </>
    );
}