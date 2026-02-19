interface Props {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export default function LoadingSpinner({ size = 'md', label = 'Loading…' }: Props) {
  return (
    <div role="status" className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-brand-600`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
