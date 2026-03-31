import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Nieprawidlowy login lub haslo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>PKU-MAT</h1>
        <p className="login-subtitle">System oswiadczen rozliczeniowych</p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username" className="form-label">
              Nazwa uzytkownika
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
              autoFocus
            />
          </div>
          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Haslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          {error && <div className="form-error-banner">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj sie'}
          </button>
        </form>
      </div>
    </div>
  );
}
