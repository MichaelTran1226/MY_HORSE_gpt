import React from 'react';
import { iconPaths } from './icons';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '', color = 'currentColor' }) => {
  const path = iconPaths[name] || iconPaths.info;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
};
