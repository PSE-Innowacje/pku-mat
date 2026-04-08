import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#0d1b2a' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              color: 'white',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              mr: 3,
            }}
          >
            PKU-MAT
          </Typography>
          <Button
            component={Link}
            to="/dashboard"
            startIcon={<DashboardIcon />}
            sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: 'white' } }}
          >
            Dashboard
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                {user.displayName.charAt(0)}
              </Avatar>
              <Chip
                label={`${user.displayName}`}
                size="small"
                sx={{ color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.1)' }}
              />
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                }}
              >
                Wyloguj
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
