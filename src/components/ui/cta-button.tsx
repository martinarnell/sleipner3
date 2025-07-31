import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTAButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
  fullWidth?: boolean
  target?: '_blank' | '_self'
  aurora?: boolean | 'default' | 'intense' | 'badge'
  onClick?: () => void
}

const DEFAULT_HREF = 'https://forms.gle/2r1R3BbCbC4fNnrr9'

export const CTAButton = ({ 
  children, 
  variant = 'primary',
  size = 'lg',
  href = DEFAULT_HREF,
  className,
  fullWidth = false,
  target = '_blank',
  aurora = false,
  onClick
}: CTAButtonProps) => {
  const baseClasses = "font-medium transition-all duration-200 relative overflow-hidden"
  
  const sizeClasses = {
    sm: "text-sm px-4 py-1.5 h-auto",
    md: "text-base px-6 py-2 h-auto", 
    lg: "text-lg px-8 py-3 h-auto",
    xl: "text-xl px-10 py-4 h-auto"
  }

  const getAuroraClass = () => {
    if (!aurora) return ''
    if (aurora === true || aurora === 'default') return 'aurora-button'
    if (aurora === 'intense') return 'aurora-button-intense'
    if (aurora === 'badge') return 'aurora-button-badge'
    return ''
  }

  const auroraClass = getAuroraClass()

  if (variant === 'gradient') {
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={cn(
            baseClasses,
            sizeClasses[size],
            aurora ? "inline-flex items-center justify-center shadow-lg hover:shadow-xl rounded-md text-white font-bold border-0 bg-transparent cursor-pointer" 
                   : "inline-flex items-center justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl rounded-md text-primary-foreground border-0 cursor-pointer",
            auroraClass,
            fullWidth && "w-full",
            className
          )}
        >
          {aurora && (
            <div className="absolute inset-0 bg-black/20 rounded-md" />
          )}
          <span className="relative z-10">{children}</span>
        </button>
      )
    }
    
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={cn(
          baseClasses,
          sizeClasses[size],
          aurora ? "inline-flex items-center justify-center shadow-lg hover:shadow-xl rounded-md text-white font-bold" 
                 : "inline-flex items-center justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl rounded-md text-primary-foreground",
          auroraClass,
          fullWidth && "w-full",
          className
        )}
      >
        {aurora && (
          <div className="absolute inset-0 bg-black/20 rounded-md" />
        )}
        <span className="relative z-10">{children}</span>
      </a>
    )
  }

  const buttonVariant = variant === 'outline' ? 'outline' : 'default'
  const buttonClasses = cn(
    sizeClasses[size],
    variant === 'primary' && !aurora && "shadow-lg shadow-primary/20",
    aurora && "shadow-lg hover:shadow-xl text-white font-bold border-0",
    auroraClass,
    fullWidth && "w-full",
    className
  )

  if (aurora) {
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={cn(
            baseClasses,
            buttonClasses,
            "inline-flex items-center justify-center rounded-md border-0 bg-transparent cursor-pointer"
          )}
        >
          <div className="absolute inset-0 bg-black/20 rounded-md" />
          <span className="relative z-10">{children}</span>
        </button>
      )
    }
    
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={cn(
          baseClasses,
          buttonClasses,
          "inline-flex items-center justify-center rounded-md"
        )}
      >
        <div className="absolute inset-0 bg-black/20 rounded-md" />
        <span className="relative z-10">{children}</span>
      </a>
    )
  }

  if (onClick) {
    return (
      <Button 
        onClick={onClick}
        variant={buttonVariant}
        className={buttonClasses}
      >
        {children}
      </Button>
    )
  }

  return (
    <Button 
      asChild 
      variant={buttonVariant}
      className={buttonClasses}
    >
      <a 
        href={href} 
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    </Button>
  )
}