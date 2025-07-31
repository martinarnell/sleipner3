import React from 'react'



export const DollarSign = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

export const Zap = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

export const Code = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

export const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export const Check = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const TrendingUp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

export const AlertTriangle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

// Placeholder logos for "Trusted By" section
export const CompanyLogo1 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 30" fill="currentColor" {...props}><path d="M10 30V0h10v30H10zm20 0V0h10v30H30zm20 0V0h10v30H50zm20 0V0h10v30H70z"></path></svg>
);
export const CompanyLogo2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 30" fill="currentColor" {...props}><path d="M0 15a15 15 0 1030 0 15 15 0 00-30 0zm70 0a15 15 0 1030 0 15 15 0 00-30 0z"></path></svg>
);
export const CompanyLogo3 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 30" fill="currentColor" {...props}><path d="M10 0l10 30 10-30H10zm40 0l10 30 10-30H50z"></path></svg>
);
export const CompanyLogo4 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 30" fill="currentColor" {...props}><path d="M0 0h30v10H0V0zm70 0h30v10H70V0zM35 20h30v10H35V20z"></path></svg>
);
export const CompanyLogo5 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 30" fill="currentColor" {...props}><path d="M15 0a15 15 0 110 30 15 15 0 010-30zm35 0h30v30H50V0z"></path></svg>
);
export const CompanyLogo6 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 30" fill="currentColor" {...props}><path d="M0 0l30 30H0V0zm70 0l30 30h-30V0z"></path></svg>
); 