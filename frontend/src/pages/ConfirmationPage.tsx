import { useLocation, useNavigate } from 'react-router-dom';
import { DeclarationResponse } from '../types';

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const declaration = location.state?.declaration as
    | DeclarationResponse
    | undefined;

  if (!declaration) {
    return (
      <div className="confirmation">
        <p>Brak danych oswiadczenia.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Wroc do panelu
        </button>
      </div>
    );
  }

  return (
    <div className="confirmation">
      <div className="confirmation-card">
        <div className="confirmation-icon">&#10003;</div>
        <h2>Oswiadczenie zostalo zlozone</h2>
        <p className="confirmation-number">
          Numer: <strong>{declaration.declarationNumber}</strong>
        </p>
        <p>
          Typ oplaty: {declaration.feeTypeName} ({declaration.feeTypeCode})
        </p>
        <p>
          Okres: {declaration.month}/{declaration.year}
        </p>
        <p>
          Data zlozenia:{' '}
          {declaration.submittedAt
            ? new Date(declaration.submittedAt).toLocaleString('pl-PL')
            : '-'}
        </p>

        <div className="confirmation-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Wroc do panelu
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/declarations/${declaration.id}`)}
          >
            Zobacz oswiadczenie
          </button>
        </div>
      </div>
    </div>
  );
}
