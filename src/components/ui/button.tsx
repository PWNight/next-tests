'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border-2',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:scale-105 active:scale-95',
                destructive:
                    'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:scale-105 active:scale-95',
                outline:
                    'border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary hover:scale-105 active:scale-95',
                secondary:
                    'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80 hover:scale-105 active:scale-95',
                ghost:
                    'border-transparent hover:bg-accent hover:text-accent-foreground hover:border-primary hover:scale-105 active:scale-95',
                link:
                    'underline-offset-4 hover:underline text-primary border-transparent hover:border-b-2 hover:border-primary',
            },
            size: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-3 rounded-md',
                lg: 'h-11 px-8 rounded-md',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };