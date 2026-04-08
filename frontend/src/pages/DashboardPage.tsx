import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/declarations';
import { DashboardResponse, PeriodDeclarationStatus } from '../types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Skeleton,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const STATUS_LABELS: Record<string, string> = {
  NIE_ZLOZONE: 'Nie zlozone',
  ROBOCZE: 'Robocze',
  ZLOZONE: 'Zlozone',
};

const STATUS_COLORS: Record<string, 'error' | 'warning' | 'success'> = {
  NIE_ZLOZONE: 'error',
  ROBOCZE: 'warning',
  ZLOZONE: 'success',
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

const PAGE_SIZE = 5;

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState('');
  const [visibleFeeTypes, setVisibleFeeTypes] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((data) => {
        setDashboard(data);
        const allTypes = Array.from(
          new Set(data.periodDeclarations.map((pd) => pd.feeTypeCode))
        );
        setVisibleFeeTypes(allTypes);
        const initialPages: Record<string, number> = {};
        allTypes.forEach((code) => (initialPages[code] = 0));
        setPageIndex(initialPages);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!dashboard)
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={60} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width="33%" height={200} />
          ))}
        </Box>
      </Box>
    );

  const feeTypes = Array.from(
    new Map(
      dashboard.periodDeclarations.map((pd) => [
        pd.feeTypeCode,
        { code: pd.feeTypeCode, name: pd.feeTypeName },
      ])
    ).values()
  );

  const periodsByFeeType = new Map<string, PeriodDeclarationStatus[]>();
  dashboard.periodDeclarations.forEach((pd) => {
    const list = periodsByFeeType.get(pd.feeTypeCode) || [];
    list.push(pd);
    periodsByFeeType.set(pd.feeTypeCode, list);
  });

  const missingCounts = new Map<string, number>();
  feeTypes.forEach((ft) => {
    const periods = periodsByFeeType.get(ft.code) || [];
    missingCounts.set(ft.code, periods.filter((pd) => pd.status === 'NIE_ZLOZONE').length);
  });

  const handleToggle = (_: unknown, newVal: string[]) => {
    if (newVal.length > 0) setVisibleFeeTypes(newVal);
  };

  const getPage = (code: string) => pageIndex[code] ?? 0;
  const goPage = (code: string, delta: number) => {
    const periods = periodsByFeeType.get(code) || [];
    const totalPages = Math.ceil(periods.length / PAGE_SIZE);
    setPageIndex((prev) => ({
      ...prev,
      [code]: Math.max(0, Math.min(totalPages - 1, (prev[code] ?? 0) + delta)),
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Oswiadczenia do zlozenia
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kontrahent: <strong>{dashboard.contractorName}</strong> ({dashboard.contractorType})
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={visibleFeeTypes}
        onChange={handleToggle}
        sx={{ mb: 4, flexWrap: 'wrap', gap: 1, '& .MuiToggleButton-root': { borderRadius: '24px !important', border: '2px solid', px: 3 } }}
      >
        {feeTypes.map((ft) => {
          const missing = missingCounts.get(ft.code) || 0;
          return (
            <ToggleButton key={ft.code} value={ft.code} sx={{ gap: 1 }}>
              {ft.name} ({ft.code})
              {missing > 0 && (
                <Badge badgeContent={missing} color="error" sx={{ ml: 1 }} />
              )}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {feeTypes
        .filter((ft) => visibleFeeTypes.includes(ft.code))
        .map((ft) => {
          const allPeriods = periodsByFeeType.get(ft.code) || [];
          const totalPages = Math.ceil(allPeriods.length / PAGE_SIZE);
          const page = getPage(ft.code);
          const start = page * PAGE_SIZE;
          const visiblePeriods = allPeriods.slice(start, start + PAGE_SIZE);

          return (
            <Box key={ft.code} sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  {ft.name} ({ft.code})
                </Typography>
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" disabled={page === 0} onClick={() => goPage(ft.code, -1)}>
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {start + 1}&ndash;{Math.min(start + PAGE_SIZE, allPeriods.length)} z {allPeriods.length}
                    </Typography>
                    <IconButton size="small" disabled={page === totalPages - 1} onClick={() => goPage(ft.code, 1)}>
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                {visiblePeriods.map((pd) => (
                  <PeriodCard key={pd.billingPeriodId} pd={pd} navigate={navigate} />
                ))}
              </Box>
            </Box>
          );
        })}
    </Box>
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
  const isOverdue = !hasDeclaration && new Date(pd.submissionDeadline) < new Date();

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isOverdue ? 'error.light' : 'divider',
        borderLeft: '4px solid',
        borderLeftColor: isOverdue ? 'error.main' : hasDeclaration ? 'success.main' : 'grey.300',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {formatDate(pd.startDate)} &ndash; {formatDate(pd.endDate)}
          </Typography>
          <Chip
            label={STATUS_LABELS[pd.status] || pd.status}
            color={STATUS_COLORS[pd.status] || 'default'}
            size="small"
            variant={pd.status === 'NIE_ZLOZONE' ? 'outlined' : 'filled'}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Termin zgloszenia
            </Typography>
            <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'} sx={{ fontWeight: 500 }}>
              {formatDate(pd.submissionDeadline)}
            </Typography>
          </Box>
          {hasDeclaration && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Ostatnia wersja
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    v{(() => {
                      const parts = pd.declarationNumber?.split('/') || [];
                      const isKor = parts[parts.length - 1] === 'KOR';
                      return isKor ? parts[parts.length - 2] : parts[parts.length - 1];
                    })()}
                  </Typography>
                  {pd.declarationNumber?.endsWith('/KOR') && (
                    <Chip label="KOR" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Numer
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', maxWidth: 180, textAlign: 'right', wordBreak: 'break-all' }}>
                  {pd.declarationNumber}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        {hasDeclaration && pd.declarationId && (
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/declarations/${pd.declarationId}`)}
          >
            Podglad
          </Button>
        )}
        {hasDeclaration && (
          <Button
            size="small"
            startIcon={<HistoryIcon />}
            onClick={() => navigate(`/declarations/versions/${pd.billingPeriodId}`)}
          >
            Wersje
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          size="small"
          variant="contained"
          startIcon={hasDeclaration ? <EditIcon /> : <AddIcon />}
          onClick={() => navigate(`/declarations/new/${pd.feeTypeCode}/${pd.billingPeriodId}`)}
        >
          {hasDeclaration ? 'Nowa wersja' : 'Zloz'}
        </Button>
      </CardActions>
    </Card>
  );
}
