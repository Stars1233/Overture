import { DynamicField } from '@/stores/plan-store';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface DynamicFieldInputProps {
  field: DynamicField;
  onChange: (value: string) => void;
}

export function DynamicFieldInput({ field, onChange }: DynamicFieldInputProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const baseInputClass = clsx(
    'w-full px-2 py-1.5 rounded-md',
    'bg-canvas border border-border',
    'text-xs text-text-primary placeholder-text-muted',
    'focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent',
    'transition-all duration-200'
  );

  const renderInput = () => {
    switch (field.type) {
      case 'secret':
        return (
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={field.value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${field.title.toLowerCase()}`}
              className={clsx(baseInputClass, 'pr-8 font-mono')}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showSecret ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </button>
          </div>
        );

      case 'select':
        const options = field.options?.split(',').map((o) => o.trim()) || [];
        return (
          <select
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={clsx(baseInputClass, 'cursor-pointer')}
          >
            <option value="">Select {field.title.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={field.value === 'true'}
                onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
                className="sr-only"
              />
              <div
                className={clsx(
                  'w-8 h-5 rounded-full transition-colors',
                  field.value === 'true' ? 'bg-accent-blue' : 'bg-border'
                )}
              >
                <div
                  className={clsx(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    field.value === 'true' ? 'translate-x-3.5' : 'translate-x-0.5'
                  )}
                />
              </div>
            </div>
            <span className="text-xs text-text-secondary">
              {field.value === 'true' ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.title.toLowerCase()}`}
            className={clsx(baseInputClass, 'font-mono')}
          />
        );

      case 'question':
        // Render dropdown if options are provided, otherwise render text input
        if (field.options) {
          const questionOptions = field.options.split(',').map((o) => o.trim());
          return (
            <select
              value={field.value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={clsx(baseInputClass, 'cursor-pointer')}
            >
              <option value="">Select an answer</option>
              {questionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter your answer`}
            className={baseInputClass}
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={field.value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-border bg-transparent p-0.5"
            />
            <input
              type="text"
              value={field.value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className={clsx(baseInputClass, 'font-mono flex-1')}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.title.toLowerCase()}`}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div>
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-text-primary flex items-center gap-1">
          {field.title}
          {field.required && <span className="text-accent-red">*</span>}
        </label>

        {field.setupInstructions && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Description */}
      {field.description && (
        <p className="text-[10px] text-text-muted mb-1">{field.description}</p>
      )}

      {/* Setup instructions */}
      {showHelp && field.setupInstructions && (
        <div className="mb-1.5 p-1.5 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-[10px] text-accent-blue">
          {field.setupInstructions}
        </div>
      )}

      {/* Input */}
      {renderInput()}

      {/* Validation */}
      {field.required && !field.value && (
        <p className="text-[10px] text-accent-yellow mt-0.5">Required</p>
      )}
    </div>
  );
}
