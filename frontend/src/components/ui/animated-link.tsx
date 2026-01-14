import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"

interface AnimatedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  children: React.ReactNode
  animation?: "slide" | "fade" | "scale"
  className?: string
}

const AnimatedLink = React.forwardRef<HTMLAnchorElement, AnimatedLinkProps>(
  ({ to, children, animation = "slide", className, ...props }, ref) => {
    const animationClasses = {
      slide: "transform transition-all duration-300 hover:scale-105 hover:text-primary/80",
      fade: "transform transition-all duration-300 hover:opacity-80 hover:text-primary/80",
      scale: "transform transition-all duration-300 hover:scale-110 hover:text-primary/80",
    }

    return (
      <Link
        to={to}
        ref={ref}
        className={cn(
          "text-primary hover:underline transition-all duration-300 font-medium relative group",
          animationClasses[animation],
          className
        )}
        {...props}
      >
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
    )
  }
)
AnimatedLink.displayName = "AnimatedLink"

export { AnimatedLink }
