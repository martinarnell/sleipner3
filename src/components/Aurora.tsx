interface AuroraProps {
  variant?: 'default' | 'subtle' | 'minimal' | 'dark'
  className?: string
  overlay?: boolean
  overlayOpacity?: number
}

export const Aurora = ({ 
  variant = 'default', 
  className = '', 
  overlay = false, 
  overlayOpacity = 10 
}: AuroraProps) => {
  const getAuroraClass = () => {
    switch (variant) {
      case 'subtle':
        return 'aurora-subtle'
      case 'minimal':
        return 'aurora-minimal'
      case 'dark':
        return 'aurora-dark'
      default:
        return 'aurora-bg'
    }
  }

  return (
    <>
      <div className={`absolute inset-0 ${getAuroraClass()} ${className}`} />
      {overlay && (
        <div 
          className="absolute inset-0 bg-background" 
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}
    </>
  )
} 