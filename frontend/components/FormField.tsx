/**
 * FormField Component
 * Reusable form field with label, input, error message, and hint
 * Used across all admin forms (create, edit) to ensure consistency
 */

import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type BaseFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * TEXT INPUT FIELD
 * ═══════════════════════════════════════════════════════════════════════════ */

interface TextInputProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      hint,
      error,
      required,
      className = '',
      containerClassName = '',
      disabled = false,
      icon,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const baseInputClass = `
      w-full px-3 py-2 border rounded-lg transition-all
      focus:outline-none focus:ring-2
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    `;

    const inputClass = hasError
      ? `${baseInputClass} border-red-300 focus:ring-red-200 focus:border-red-500`
      : `${baseInputClass} border-gray-300 focus:ring-blue-200 focus:border-blue-500`;

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && <div className="absolute left-3 top-2.5 text-gray-400">{icon}</div>}
          <input
            ref={ref}
            disabled={disabled}
            className={`${inputClass} ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
          {hasError && (
            <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
          )}
        </div>

        {error && <p className="text-xs font-medium text-red-600 flex items-center gap-1">{error}</p>}
        {!error && hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

/* ═══════════════════════════════════════════════════════════════════════════
 * TEXTAREA FIELD
 * ═══════════════════════════════════════════════════════════════════════════ */

interface TextAreaProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      hint,
      error,
      required,
      className = '',
      containerClassName = '',
      disabled = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const baseClass = `
      w-full px-3 py-2 border rounded-lg transition-all resize-none
      focus:outline-none focus:ring-2
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    `;

    const textareaClass = hasError
      ? `${baseClass} border-red-300 focus:ring-red-200 focus:border-red-500`
      : `${baseClass} border-gray-300 focus:ring-blue-200 focus:border-blue-500`;

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={`${textareaClass} ${className}`}
          {...props}
        />

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {!error && hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

/* ═══════════════════════════════════════════════════════════════════════════
 * SELECT FIELD
 * ═══════════════════════════════════════════════════════════════════════════ */

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      hint,
      error,
      required,
      className = '',
      containerClassName = '',
      disabled = false,
      options,
      placeholder,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const baseClass = `
      w-full px-3 py-2 border rounded-lg transition-all
      focus:outline-none focus:ring-2
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
      bg-white
    `;

    const selectClass = hasError
      ? `${baseClass} border-red-300 focus:ring-red-200 focus:border-red-500`
      : `${baseClass} border-gray-300 focus:ring-blue-200 focus:border-blue-500`;

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <select ref={ref} disabled={disabled} className={`${selectClass} ${className}`} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {!error && hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

/* ═══════════════════════════════════════════════════════════════════════════
 * CHECKBOX FIELD
 * ═══════════════════════════════════════════════════════════════════════════ */

interface CheckboxFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

export const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  (
    {
      label,
      hint,
      error,
      className = '',
      containerClassName = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`
              w-4 h-4 border-gray-300 rounded cursor-pointer
              focus:ring-2 focus:ring-blue-200
              disabled:cursor-not-allowed disabled:bg-gray-100
              ${className}
            `}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-gray-700 cursor-pointer">{label}</label>
          )}
        </div>

        {error && <p className="text-xs font-medium text-red-600 ml-6">{error}</p>}
        {!error && hint && <p className="text-xs text-gray-500 ml-6">{hint}</p>}
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

/* ═══════════════════════════════════════════════════════════════════════════
 * RADIO FIELD GROUP
 * ═══════════════════════════════════════════════════════════════════════════ */

interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps extends BaseFieldProps {
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  direction?: 'row' | 'column';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  hint,
  error,
  required,
  containerClassName = '',
  options,
  value,
  onChange,
  direction = 'column',
  disabled = false,
}) => {
  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className={`flex gap-4 ${direction === 'column' ? 'flex-col' : 'flex-row flex-wrap'}`}>
        {options.map((opt) => (
          <div key={opt.value} className="flex items-start gap-2">
            <input
              type="radio"
              id={`radio-${opt.value}`}
              name="radio-group"
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled || opt.disabled}
              className="mt-1 w-4 h-4 border-gray-300 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col">
              <label
                htmlFor={`radio-${opt.value}`}
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {opt.label}
              </label>
              {opt.description && <p className="text-xs text-gray-500">{opt.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * FILE INPUT FIELD
 * ═══════════════════════════════════════════════════════════════════════════ */

interface FileInputProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onChange?: (files: FileList | null) => void;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      label,
      hint,
      error,
      required,
      className = '',
      containerClassName = '',
      disabled = false,
      accept,
      multiple,
      maxSize,
      onChange,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const baseClass = `
      w-full px-3 py-2 border-2 border-dashed rounded-lg transition-all
      focus:outline-none cursor-pointer
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
      file:mr-2 file:py-1 file:px-2 file:rounded file:border-0
      file:font-medium file:bg-gray-100 file:text-gray-700
    `;

    const inputClass = hasError
      ? `${baseClass} border-red-300 hover:border-red-400`
      : `${baseClass} border-gray-300 hover:border-blue-400`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.files);
    };

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type="file"
          disabled={disabled}
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className={`${inputClass} ${className}`}
          {...props}
        />

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {!error && hint && (
          <p className="text-xs text-gray-500">
            {hint}
            {maxSize && ` (Max ${maxSize}MB)`}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

/* ═══════════════════════════════════════════════════════════════════════════
 * FORM WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════ */

interface FormWrapperProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const FormWrapper = React.forwardRef<HTMLFormElement, FormWrapperProps>(
  ({ children, isLoading, ...props }, ref) => (
    <form
      ref={ref}
      className={isLoading ? 'opacity-50 pointer-events-none' : ''}
      {...props}
    >
      {children}
    </form>
  )
);

FormWrapper.displayName = 'FormWrapper';
