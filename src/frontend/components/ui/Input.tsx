import { forwardRef, InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  showToggle?: boolean; // only relevant when type="password"
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, showToggle = false, className = '', id, type, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const [visible, setVisible] = useState(false);

    const isPassword = type === 'password';
    const resolvedType = isPassword && visible ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={`
              w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900
              placeholder:text-gray-400 outline-none transition-all
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${error
                ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
              ${isPassword && showToggle ? 'pr-11' : ''}
              ${className}
            `}
            {...props}
          />

          {isPassword && showToggle && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="
                absolute inset-y-0 right-0 flex items-center px-3.5
                text-gray-400 hover:text-gray-600 transition-colors
                focus:outline-none focus-visible:text-blue-500
              "
              aria-label={visible ? 'Hide password' : 'Show password'}
              tabIndex={-1} // don't interrupt tab flow on forms
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
// Inlined so you have zero icon library dependency.
// Swap for lucide-react if you already use it: import { Eye, EyeOff } from 'lucide-react'

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}