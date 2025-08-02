import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-heading",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-heritage transform hover:scale-105 craft-smooth",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-card hover:shadow-heritage craft-smooth hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-card craft-smooth",
        ghost: "hover:bg-accent hover:text-accent-foreground craft-smooth hover:shadow-card",
        link: "text-primary underline-offset-4 hover:underline craft-smooth",
        hero: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-heritage transform hover:scale-105 hover:bg-gradient-heritage craft-smooth font-semibold",
        glass: "bg-card/80 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card/90 shadow-card hover:shadow-heritage craft-smooth",
        heritage: "bg-gradient-heritage text-gold-foreground shadow-heritage hover:shadow-glow transform hover:scale-105 craft-smooth",
        accent: "bg-accent text-accent-foreground shadow-elegant hover:shadow-heritage transform hover:scale-105 craft-smooth",
        navy: "bg-navy text-navy-foreground shadow-elegant hover:shadow-heritage transform hover:scale-105 craft-smooth"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
