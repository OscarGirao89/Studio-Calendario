import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      fill="currentColor"
      aria-label="FusionArte Logo"
      {...props}
    >
      <text
        x="10"
        y="35"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="bold"
        className="fill-primary"
      >
        Fusion
      </text>
      <text
        x="105"
        y="35"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="bold"
        className="fill-accent"
      >
        Arte
      </text>
    </svg>
  );
}
