'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}