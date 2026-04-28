import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex touch-min touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padma-champagne/55 focus-visible:ring-offset-2 focus-visible:ring-offset-padma-cream dark:focus-visible:ring-padma-lavender/50 dark:focus-visible:ring-offset-padma-night disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#c9a96e] to-[#c5b4d4] text-padma-night shadow-soft hover:shadow-glow hover:-translate-y-0.5",
        secondary:
          "bg-oasis-cream dark:bg-oasis-night/80 text-oasis-night dark:text-oasis-cream border border-oasis-champagne/40 hover:-translate-y-0.5",
        ghost: "hover:bg-oasis-lavender/25 dark:hover:bg-oasis-lavender/15 text-oasis-night dark:text-oasis-cream",
        oracle:
          "bg-gradient-to-r from-[#c9a96e] via-oasis-lavender to-[#d8bfd8] text-oasis-night shadow-soft hover:shadow-glow hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
