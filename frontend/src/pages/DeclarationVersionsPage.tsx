import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeclarationsByBillingPeriod } from '../api/declarations';
import { DeclarationResponse } from '../types';

export default function DeclarationVersionsPage() {
  const { billingPeriodId } = useParams<{ billingPeriodId: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<DeclarationResponse[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (billingPeriodId) {
      getDeclarationsByBillingPeriod(parseInt(billingPeriodId, 10))
        .then(setVersions)
        .catch((e) => setError(e.message));
    }
  }, [billingPeriodId]);

  if (error) return <div className="error-banner">{error}</div>;
  if (!versions) return <div className="loading">Ladowanie...</div>;
  if (versions.length === 0)
    return <div className="error-banner">Brak oswiadczen dla tego okresu</div>;

  const first = versions[0];

  return (
    <div className="declaration-detail">
      <h2>
        Wersje oswiadczen: {first.feeTypeName} ({first.feeTypeCode})
      </h2>
      <p className="dashboard-context">
        Okres: {first.month}/{first.year} | Kontrahent: {first.contractorName}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Wersja</th>
            <th>Numer</th>
            <th>Data zlozenia</th>
            <th>Skladajacy</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v) => (
            <tr key={v.id}>
              <td>{v.version}</td>
              <td>{v.declarationNumber}</td>
              <td>
                {v.submittedAt
                  ? new Date(v.submittedAt).toLocaleString('pl-PL')
                  : '-'}
              </td>
              <td>{v.createdBy}</td>
              <td>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/declarations/${v.id}`)}
                >
                  Zobacz
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          Powrot do dashboardu
        </button>
      </div>
    </div>
  );
}
