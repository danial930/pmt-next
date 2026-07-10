import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  className?: string;
}

const styles = {
  success: { wrapper: 'bg-green-50 border-green-200 text-green-800', icon: '✓' },
  error:   { wrapper: 'bg-red-50 border-red-200 text-red-800',       icon: '✕' },
  warning: { wrapper: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: '⚠' },
  info:    { wrapper: 'bg-blue-50 border-blue-200 text-blue-800',    icon: 'ℹ' },
};

export function Alert({ type, title, children, className = '' }: AlertProps) {
  const s = styles[type];
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${s.wrapper} ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 font-bold shrink-0">{s.icon}</span>
        <div>
          {title && <p className="font-semibold mb-0.5">{title}</p>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}