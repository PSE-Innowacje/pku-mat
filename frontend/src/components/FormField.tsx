import { FormFieldDef } from '../types';

interface FormFieldProps {
  field: FormFieldDef;
  value: string;
  onChange: (code: string, value: string) => void;
  error?: string;
}

export default function FormField({
  field,
  value,
  onChange,
  error,
}: FormFieldProps) {
  const step = field.precision > 0 ? Math.pow(10, -field.precision) : 1;

  return (
    <div className="form-field">
      <label htmlFor={field.code} className="form-label">
        {field.label}
        {field.required && <span className="required"> *</span>}
      </label>
      <div className="form-input-group">
        <input
          id={field.code}
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(field.code, e.target.value)}
          className={`form-input ${error ? 'form-input-error' : ''}`}
          required={field.required}
        />
        {field.unit && <span className="form-unit">{field.unit}</span>}
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
