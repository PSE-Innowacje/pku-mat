import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeclarationsByBillingPeriod } from '../api/declarations';
import { DeclarationResponse } from '../types';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  Alert,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!versions) return <Skeleton variant="rounded" height={300} />;
  if (versions.length === 0) return <Alert severity="info">Brak oswiadczen dla tego okresu</Alert>;

  const first = versions[0];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Wersje oswiadczen: {first.feeTypeName} ({first.feeTypeCode})
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Okres: {first.month}/{first.year} | Kontrahent: {first.contractorName}
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#0d1b2a' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Wersja</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Numer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Data zlozenia</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Skladajacy</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 100 }}>Akcja</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.map((v, idx) => (
              <TableRow key={v.id} sx={{ bgcolor: idx % 2 === 0 ? 'white' : 'grey.50', '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 600 }}>v{v.version}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{v.declarationNumber}</TableCell>
                <TableCell>
                  {v.submittedAt ? new Date(v.submittedAt).toLocaleString('pl-PL') : '-'}
                </TableCell>
                <TableCell>{v.createdBy}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/declarations/${v.id}`)}
                  >
                    Zobacz
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
        Powrot do dashboardu
      </Button>
    </Box>
  );
}
