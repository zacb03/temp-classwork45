import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
  speed?: number;
  bgOpacity?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 37,
  color = '#614CFB',
  speed = 0.9,
  bgOpacity = 0.1
}) => {
  return (
    <svg 
      className="spinner-container" 
      viewBox="0 0 37 37" 
      height={size} 
      width={size} 
      preserveAspectRatio="xMidYMid meet"
      style={{
        '--uib-size': `${size}px`,
        '--uib-color': color,
        '--uib-speed': `${speed}s`,
        '--uib-bg-opacity': bgOpacity
      } as React.CSSProperties}
    >
      <path 
        className="track" 
        fill="none" 
        strokeWidth="5" 
        pathLength="100" 
        d="M36.63 31.746 c0 -13.394 -7.3260000000000005 -25.16 -18.13 -31.375999999999998 C7.696 6.66 0.37 18.352 0.37 31.746 c5.328 3.108 11.544 4.8839999999999995 18.13 4.8839999999999995 S31.301999999999996 34.854 36.63 31.746z"
      />
      <path 
        className="car" 
        fill="none" 
        strokeWidth="5" 
        pathLength="100" 
        d="M36.63 31.746 c0 -13.394 -7.3260000000000005 -25.16 -18.13 -31.375999999999998 C7.696 6.66 0.37 18.352 0.37 31.746 c5.328 3.108 11.544 4.8839999999999995 18.13 4.8839999999999995 S31.301999999999996 34.854 36.63 31.746z"
      />
      <style jsx>{`
        .spinner-container {
          --uib-size: 37px;
          --uib-color: black;
          --uib-speed: .9s;
          --uib-bg-opacity: .1;
          height: var(--uib-size);
          width: var(--uib-size);
          transform-origin: center;
          overflow: visible;
        }

        .car {
          fill: none;
          stroke: var(--uib-color);
          stroke-dasharray: 15, 85;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: travel var(--uib-speed) linear infinite;
          will-change: stroke-dasharray, stroke-dashoffset;
          transition: stroke 0.5s ease;
        }

        .track {
          stroke: var(--uib-color);
          opacity: var(--uib-bg-opacity);
          transition: stroke 0.5s ease;
        }

        @keyframes travel {
          0% {
            stroke-dashoffset: 0;
          }

          100% {
            stroke-dashoffset: 100;
          }
        }
      `}</style>
    </svg>
  );
};