import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormTemplate, submitDeclaration } from '../api/declarations';
import { DeclarationFormTemplate } from '../types';

export default function DeclarationFormPage() {
  const { feeType, billingPeriodId } = useParams<{
    feeType: string;
    billingPeriodId: string;
  }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<DeclarationFormTemplate | null>(
    null
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (feeType && billingPeriodId) {
      getFormTemplate(feeType, parseInt(billingPeriodId, 10))
        .then((t) => {
          setTemplate(t);
          const initial: Record<string, string> = {};
          t.fields.forEach((f) => (initial[f.code] = ''));
          setValues(initial);
        })
        .catch((e) => setError(e.message));
    }
  }, [feeType, billingPeriodId]);

  const handleChange = (code: string, value: string) => {
    setValues((prev) => ({ ...prev, [code]: value }));
    setErrors((prev) => ({ ...prev, [code]: '' }));
  };

  const validate = (): boolean => {
    if (!template) return false;
    const newErrors: Record<string, string> = {};
    template.fields.forEach((f) => {
      if (f.required && !values[f.code]) {
        newErrors[f.code] = 'Pole wymagane';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!template || !feeType || !billingPeriodId) return;
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const items: Record<string, number> = {};
      Object.entries(values).forEach(([k, v]) => {
        if (v) items[k] = parseFloat(v);
      });

      const result = await submitDeclaration({
        feeTypeCode: feeType,
        billingPeriodId: parseInt(billingPeriodId, 10),
        items,
        comment: comment || undefined,
      });

      navigate(`/declarations/${result.id}/confirmation`, {
        state: { declaration: result },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Blad wysylania');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="error-banner">{error}</div>;
  if (!template) return <div className="loading">Ladowanie formularza...</div>;

  return (
    <div className="declaration-form">
      <h2>
        Skladanie oswiadczenia: {template.feeTypeName} ({template.feeTypeCode})
      </h2>
      <p className="text-muted">
        Wersja szablonu: <strong>{template.templateVersionName}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <table className="table form-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>LP</th>
              <th>Opis</th>
              <th style={{ width: '180px' }}>Wartosc</th>
              <th style={{ width: '80px' }}>Jednostka</th>
            </tr>
          </thead>
          <tbody>
            {template.fields.map((field, idx) => (
              <tr
                key={field.code}
                className={errors[field.code] ? 'form-table-row-error' : ''}
              >
                <td className="text-center">{idx + 1}</td>
                <td>
                  {field.label}
                  {field.required && <span className="required"> *</span>}
                  {errors[field.code] && (
                    <div className="form-error">{errors[field.code]}</div>
                  )}
                </td>
                <td>
                  <input
                    id={field.code}
                    type="number"
                    step={
                      field.precision > 0
                        ? Math.pow(10, -field.precision)
                        : 1
                    }
                    value={values[field.code] || ''}
                    onChange={(e) => handleChange(field.code, e.target.value)}
                    className={`form-input ${errors[field.code] ? 'form-input-error' : ''}`}
                    required={field.required}
                  />
                </td>
                <td className="text-center text-muted">
                  {field.unit || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {template.commentAllowed && (
          <div className="form-field">
            <label htmlFor="comment" className="form-label">
              Komentarz (opcjonalny)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-input form-textarea"
              maxLength={1000}
              rows={3}
            />
            <span className="form-hint">{comment.length}/1000</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Wysylanie...' : 'Zapisz i wyslij'}
          </button>
        </div>
      </form>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Potwierdzenie</h3>
            <p>Czy na pewno chcesz wyslac oswiadczenie?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Anuluj
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                Zatwierdz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
