import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionContainer({ children, className = '' }: Props) {
  return (
    <div className={`w-full px-4 md:px-[69px] ${className}`}>{children}</div>
  );
}
