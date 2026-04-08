import { useLocation, useNavigate } from 'react-router-dom';
import { DeclarationResponse } from '../types';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const declaration = location.state?.declaration as DeclarationResponse | undefined;

  if (!declaration) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ mb: 2 }}>Brak danych oswiadczenia.</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Wroc do panelu
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          p: 5,
          textAlign: 'center',
          maxWidth: 520,
          width: '100%',
        }}
      >
        <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" color="success.dark" sx={{ mb: 2 }}>
          Oswiadczenie zostalo zlozone
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, wordBreak: 'break-all' }}>
          {declaration.declarationNumber}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Typ oplaty: {declaration.feeTypeName} ({declaration.feeTypeCode})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Okres: {declaration.month}/{declaration.year}
          </Typography>
          {declaration.templateVersionName && (
            <Chip label={`Szablon: ${declaration.templateVersionName}`} size="small" variant="outlined" color="primary" sx={{ mt: 0.5 }} />
          )}
          <Typography variant="body2" color="text.secondary">
            Data zlozenia:{' '}
            {declaration.submittedAt ? new Date(declaration.submittedAt).toLocaleString('pl-PL') : '-'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')}>
            Wroc do panelu
          </Button>
          <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/declarations/${declaration.id}`)}>
            Zobacz oswiadczenie
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
