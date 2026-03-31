import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DeclarationFormPage from './pages/DeclarationFormPage';
import DeclarationDetailPage from './pages/DeclarationDetailPage';
import ConfirmationPage from './pages/ConfirmationPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/declarations/new/:feeType"
              element={<DeclarationFormPage />}
            />
            <Route
              path="/declarations/:id/confirmation"
              element={<ConfirmationPage />}
            />
            <Route
              path="/declarations/:id"
              element={<DeclarationDetailPage />}
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
