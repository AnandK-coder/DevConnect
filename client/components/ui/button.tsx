import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold uppercase tracking-wide ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary via-violet-500 to-cyan-400 text-primary-foreground shadow-[0_18px_50px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 hover:brightness-105',
        secondary:
          'border border-white/15 bg-white/10 text-white shadow-[0_10px_40px_rgba(2,6,23,0.55)] hover:bg-white/20 hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_12px_40px_rgba(248,113,113,0.35)] hover:bg-destructive/90',
        outline:
          'border border-white/20 bg-transparent text-white hover:bg-white/10 hover:-translate-y-0.5',
        ghost: 'text-white/70 hover:text-white hover:bg-white/5',
        muted: 'bg-white/5 text-white/80 hover:bg-white/10',
        link: 'text-primary underline-offset-8 hover:underline',
      },
      size: {
        default: 'h-11 px-6 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as any}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

