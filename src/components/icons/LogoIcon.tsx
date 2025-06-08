import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 50" // Adjusted viewBox for potentially wider text
      fill="currentColor"
      aria-label="SucioStudio Logo"
      {...props}
    >
      <text
        x="10" // Adjusted x for "Sucio"
        y="35"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="bold"
        className="fill-primary"
      >
        Sucio
      </text>
      <text
        x="100" // Adjusted x for "Studio"
        y="35"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="bold"
        className="fill-accent"
      >
        Studio
      </text>
    </svg>
  );
}
