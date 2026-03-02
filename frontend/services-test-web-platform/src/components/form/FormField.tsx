import React from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, description, children, required }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] px-1">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">{children}</div>
      {description && !error && (
        <p className="text-[10px] text-text-secondary/60 px-1 italic">{description}</p>
      )}
      {error && (
        <p className="text-[10px] font-bold text-rose-500 px-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
