import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Tests App',
    description: 'Modern test management and execution platform',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
                <div className="flex min-h-screen flex-col lg:flex-row">
                    <Sidebar />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}