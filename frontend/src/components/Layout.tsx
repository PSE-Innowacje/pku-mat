import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            PKU-MAT
          </Link>
          <nav className="nav">
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </div>
        <div className="header-right">
          {user && (
            <>
              <span className="user-info">
                {user.displayName} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-logout">
                Wyloguj
              </button>
            </>
          )}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
