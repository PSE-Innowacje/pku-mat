import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/declarations';
import { DashboardResponse, PeriodDeclarationStatus } from '../types';

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

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState('');
  const [visibleFeeTypes, setVisibleFeeTypes] = useState<Set<string>>(
    new Set()
  );
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((data) => {
        setDashboard(data);
        const allTypes = new Set(
          data.periodDeclarations.map((pd) => pd.feeTypeCode)
        );
        setVisibleFeeTypes(allTypes);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!dashboard) return <div className="loading">Ladowanie...</div>;

  const feeTypes = Array.from(
    new Map(
      dashboard.periodDeclarations.map((pd) => [
        pd.feeTypeCode,
        { code: pd.feeTypeCode, name: pd.feeTypeName },
      ])
    ).values()
  );

  const toggleFeeType = (code: string) => {
    setVisibleFeeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        if (next.size > 1) {
          next.delete(code);
        }
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const periodsByFeeType = new Map<string, PeriodDeclarationStatus[]>();
  dashboard.periodDeclarations.forEach((pd) => {
    const list = periodsByFeeType.get(pd.feeTypeCode) || [];
    list.push(pd);
    periodsByFeeType.set(pd.feeTypeCode, list);
  });

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

      <div className="fee-type-toggles">
        {feeTypes.map((ft) => (
          <button
            key={ft.code}
            className={`btn fee-type-toggle ${visibleFeeTypes.has(ft.code) ? 'fee-type-toggle-active' : ''}`}
            onClick={() => toggleFeeType(ft.code)}
          >
            {ft.name} ({ft.code})
          </button>
        ))}
      </div>

      {feeTypes
        .filter((ft) => visibleFeeTypes.has(ft.code))
        .map((ft) => (
          <div key={ft.code} className="fee-type-region">
            <h3 className="fee-type-region-title">
              {ft.name} ({ft.code})
            </h3>
            <div className="period-cards">
              {(periodsByFeeType.get(ft.code) || []).map((pd) => (
                <PeriodCard key={pd.billingPeriodId} pd={pd} navigate={navigate} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function PeriodCard({
  pd,
  navigate,
}: {
  pd: PeriodDeclarationStatus;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const hasDeclaration = pd.status !== 'NIE_ZLOZONE';
  const isOverdue =
    !hasDeclaration && new Date(pd.submissionDeadline) < new Date();

  return (
    <div className={`period-card ${isOverdue ? 'period-card-overdue' : ''}`}>
      <div className="period-card-header">
        <span className="period-card-dates">
          {formatDate(pd.startDate)} &ndash; {formatDate(pd.endDate)}
        </span>
        <span className={`status-badge ${STATUS_CLASSES[pd.status]}`}>
          {STATUS_LABELS[pd.status] || pd.status}
        </span>
      </div>

      <div className="period-card-body">
        <div className="period-card-info">
          <span className="period-card-label">Termin zgloszenia</span>
          <span className={isOverdue ? 'period-card-overdue-text' : ''}>
            {formatDate(pd.submissionDeadline)}
          </span>
        </div>
        {hasDeclaration && (
          <>
            <div className="period-card-info">
              <span className="period-card-label">Ostatnia wersja</span>
              <span>v{pd.declarationNumber?.split('/').slice(-1)[0]?.replace('KOR', '') || '?'}</span>
              {pd.declarationNumber?.endsWith('/KOR') && (
                <span className="period-card-correction">KOR</span>
              )}
            </div>
            <div className="period-card-info">
              <span className="period-card-label">Numer</span>
              <span className="period-card-number">{pd.declarationNumber}</span>
            </div>
          </>
        )}
      </div>

      <div className="period-card-actions">
        {hasDeclaration && pd.declarationId && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/declarations/${pd.declarationId}`)}
          >
            Podglad
          </button>
        )}
        {hasDeclaration && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              navigate(`/declarations/versions/${pd.billingPeriodId}`)
            }
          >
            Wersje
          </button>
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={() =>
            navigate(
              `/declarations/new/${pd.feeTypeCode}/${pd.billingPeriodId}`
            )
          }
        >
          {hasDeclaration ? 'Nowa wersja' : 'Zloz oswiadczenie'}
        </button>
      </div>
    </div>
  );
}
