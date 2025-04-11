import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const EventIcons = {
  Goal: (props: IconProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
      <path d="M12 2v20" />
      <path d="M12 7l2.5 2.5L12 12l-2.5-2.5L12 7z" fill="currentColor" />
    </svg>
  ),

  YellowCard: (props: IconProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      {...props}
    >
      <path d="M5 2C4.44772 2 4 2.44772 4 3V21C4 21.5523 4.44772 22 5 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H5Z" />
      <path d="M7 4H17V20H7V4Z" fill="#FFF176" stroke="none" />
    </svg>
  ),

  RedCard: (props: IconProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      {...props}
    >
      <path d="M5 2C4.44772 2 4 2.44772 4 3V21C4 21.5523 4.44772 22 5 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H5Z" />
      <path d="M7 4H17V20H7V4Z" fill="#EF5350" stroke="none" />
    </svg>
  ),

  SecondYellowCard: (props: IconProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      {...props}
    >
      <g transform="translate(0 0)">
        <path d="M5 2C4.44772 2 4 2.44772 4 3V21C4 21.5523 4.44772 22 5 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H5Z" fill="currentColor" className="text-yellow-500" />
        <path d="M7 4H17V20H7V4Z" fill="#FFF176" stroke="none" />
      </g>
      <g transform="translate(24 0)">
        <path d="M5 2C4.44772 2 4 2.44772 4 3V21C4 21.5523 4.44772 22 5 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H5Z" fill="currentColor" className="text-red-500" />
        <path d="M7 4H17V20H7V4Z" fill="#EF5350" stroke="none" />
      </g>
      <path d="M22 2L26 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M22 22L26 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),

  Substitution: (props: IconProps) => (
    <ArrowRightLeft {...props} />
  ),

  Penalty: (props: IconProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M2 7h20" />
      <path d="M2 17h20" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </svg>
  ),

  PhaseChange: (props: IconProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M12 22c5.5 0 10-4.5 10-10" />
      <path d="M12 2C6.5 2 2 6.5 2 12" />
      <path d="M17 12h3" />
      <path d="M4 12h3" />
    </svg>
  ),

  Default: (props: IconProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v.01" />
      <path d="M12 8v4" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
    </svg>
  )
};

