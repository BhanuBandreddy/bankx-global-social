
import { SVGProps } from "react";

export const CustomIcons = {
  Heart: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      <circle cx="12" cy="8" r="2" fill="currentColor"/>
      <circle cx="8" cy="12" r="1" fill="currentColor"/>
      <circle cx="16" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  
  Comment: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="2"/>
      <circle cx="6" cy="6" r="1" fill="currentColor"/>
      <circle cx="18" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),
  
  Share: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      <path d="M12 2v4M12 18v4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  
  Shop: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="15" cy="9" r="1" fill="currentColor"/>
      <path d="M8 15l8-2M16 15l-8-2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  
  Location: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 7v6M9 10h6" stroke="currentColor" strokeWidth="2"/>
      <circle cx="7" cy="5" r="1" fill="currentColor"/>
      <circle cx="17" cy="15" r="1" fill="currentColor"/>
    </svg>
  ),
  
  Trust: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
      <circle cx="12" cy="8" r="2" fill="currentColor"/>
      <path d="M8 16l8-8M16 16l-8-8" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),

  Sparkle: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <path d="M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>
      <path d="M19 19l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>
      <path d="M5 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>
    </svg>
  ),

  Globe: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      <circle cx="6" cy="6" r="1" fill="currentColor"/>
      <circle cx="18" cy="6" r="1" fill="currentColor"/>
      <circle cx="6" cy="18" r="1" fill="currentColor"/>
      <circle cx="18" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),

  Lightning: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
      <circle cx="16" cy="6" r="1" fill="currentColor"/>
      <circle cx="8" cy="16" r="1" fill="currentColor"/>
      <path d="M7 7l2 2M17 17l-2-2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
};

