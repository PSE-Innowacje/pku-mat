import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/declarations';
import { DashboardResponse } from '../types';

const STATUS_LABELS: Record<string, string> = {
  NIE_ZLOZONE: 'Nie zlozone',
  ROBOCZE: 'Robocze',
  ZLOZONE: 'Zlozone',
};

const STATUS_CLASSES: Record<string, string> = {
  NIE_ZLOZONE: 'status-not-submitted',
  ROBOCZE: 'status-draft',
  ZLOZONE: 'status-submitted',
};

const MONTH_NAMES = [
  '',
  'Styczen',
  'Luty',
  'Marzec',
  'Kwiecien',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpien',
  'Wrzesien',
  'Pazdziernik',
  'Listopad',
  'Grudzien',
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!dashboard) return <div className="loading">Ladowanie...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Oswiadczenia do zlozenia</h2>
        <p className="dashboard-context">
          Kontrahent: <strong>{dashboard.contractorName}</strong> (
          {dashboard.contractorType}) | Okres:{' '}
          <strong>
            {MONTH_NAMES[dashboard.month]} {dashboard.year}
          </strong>
        </p>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Typ oplaty</th>
            <th>Nazwa</th>
            <th>Status</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
          {dashboard.feeDeclarations.map((fd) => (
            <tr key={fd.feeTypeCode}>
              <td>
                <strong>{fd.feeTypeCode}</strong>
              </td>
              <td>{fd.feeTypeName}</td>
              <td>
                <span className={`status-badge ${STATUS_CLASSES[fd.status]}`}>
                  {STATUS_LABELS[fd.status] || fd.status}
                </span>
              </td>
              <td>
                {fd.status === 'NIE_ZLOZONE' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate(`/declarations/new/${fd.feeTypeCode}`)
                    }
                  >
                    Zloz oswiadczenie
                  </button>
                ) : fd.declarationId ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      navigate(`/declarations/${fd.declarationId}`)
                    }
                  >
                    Zobacz
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
