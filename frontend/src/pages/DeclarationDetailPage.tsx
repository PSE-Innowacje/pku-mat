import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeclaration } from '../api/declarations';
import { DeclarationResponse } from '../types';

const STATUS_LABELS: Record<string, string> = {
  NIE_ZLOZONE: 'Nie zlozone',
  ROBOCZE: 'Robocze',
  ZLOZONE: 'Zlozone',
};

export default function DeclarationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [declaration, setDeclaration] = useState<DeclarationResponse | null>(
    null
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getDeclaration(parseInt(id))
        .then(setDeclaration)
        .catch((e) => setError(e.message));
    }
  }, [id]);

if (error) return <div className="error-banner">{error}</div>;
  if (!declaration) return <div className="loading">Ladowanie...</div>;

  return (
    <div className="declaration-detail">
      <h2>Oswiadczenie: {declaration.declarationNumber}</h2>

      <div className="detail-section">
        <h3>Dane podstawowe</h3>
        <dl className="detail-grid">
          <dt>Numer</dt>
          <dd>{declaration.declarationNumber}</dd>
          <dt>Status</dt>
          <dd>
            <span className="status-badge status-submitted">
              {STATUS_LABELS[declaration.status] || declaration.status}
            </span>
          </dd>
          <dt>Typ oplaty</dt>
          <dd>
            {declaration.feeTypeName} ({declaration.feeTypeCode})
          </dd>
          <dt>Kontrahent</dt>
          <dd>{declaration.contractorName}</dd>
          <dt>Okres</dt>
          <dd>
            {declaration.month}/{declaration.year}
          </dd>
          <dt>Wersja</dt>
          <dd>{declaration.version}</dd>
          <dt>Data zlozenia</dt>
          <dd>
            {declaration.submittedAt
              ? new Date(declaration.submittedAt).toLocaleString('pl-PL')
              : '-'}
          </dd>
          <dt>Skladajacy</dt>
          <dd>{declaration.createdBy}</dd>
          {declaration.templateVersionName && (
            <>
              <dt>Wersja szablonu</dt>
              <dd>{declaration.templateVersionName}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="detail-section">
        <h3>Dane dotyczace oplaty</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Kod pozycji</th>
              <th>Wartosc</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(declaration.items).map(([code, value]) => (
              <tr key={code}>
                <td>{code}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {declaration.comment && (
        <div className="detail-section">
          <h3>Komentarz</h3>
          <p>{declaration.comment}</p>
        </div>
      )}

      <div className="form-actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          Zamknij
        </button>
      </div>
    </div>
  );
}
