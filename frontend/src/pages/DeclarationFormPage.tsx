import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormTemplate, submitDeclaration } from '../api/declarations';
import { DeclarationFormTemplate } from '../types';
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
  TextField,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function DeclarationFormPage() {
  const { feeType, billingPeriodId } = useParams<{
    feeType: string;
    billingPeriodId: string;
  }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<DeclarationFormTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (feeType && billingPeriodId) {
      getFormTemplate(feeType, parseInt(billingPeriodId, 10))
        .then((t) => {
          setTemplate(t);
          const initial: Record<string, string> = {};
          t.fields.forEach((f) => (initial[f.code] = ''));
          setValues(initial);
        })
        .catch((e) => setError(e.message));
    }
  }, [feeType, billingPeriodId]);

  const handleChange = (code: string, value: string) => {
    setValues((prev) => ({ ...prev, [code]: value }));
    setErrors((prev) => ({ ...prev, [code]: '' }));
  };

  const validate = (): boolean => {
    if (!template) return false;
    const newErrors: Record<string, string> = {};
    template.fields.forEach((f) => {
      if (f.required && !values[f.code]) {
        newErrors[f.code] = 'Pole wymagane';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!template || !feeType || !billingPeriodId) return;
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const items: Record<string, number> = {};
      Object.entries(values).forEach(([k, v]) => {
        if (v) items[k] = parseFloat(v);
      });

      const result = await submitDeclaration({
        feeTypeCode: feeType,
        billingPeriodId: parseInt(billingPeriodId, 10),
        items,
        comment: comment || undefined,
      });

      navigate(`/declarations/${result.id}/confirmation`, {
        state: { declaration: result },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Blad wysylania');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!template)
    return (
      <Box>
        <Skeleton variant="rounded" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Skladanie oswiadczenia: {template.feeTypeName} ({template.feeTypeCode})
        </Typography>
        <Chip
          label={`Szablon: ${template.templateVersionName}`}
          variant="outlined"
          size="small"
          color="primary"
        />
      </Box>

      <form onSubmit={handleSubmit}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0d1b2a' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }}>LP</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Opis</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, width: 180 }}>Wartosc</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, width: 90, textAlign: 'center' }}>Jednostka</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {template.fields.map((field, idx) => (
                <TableRow
                  key={field.code}
                  sx={{
                    bgcolor: errors[field.code] ? 'error.50' : idx % 2 === 0 ? 'white' : 'grey.50',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell sx={{ textAlign: 'center', color: 'text.secondary' }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {field.label}
                      {field.required && <Typography component="span" color="error.main"> *</Typography>}
                    </Typography>
                    {errors[field.code] && (
                      <Typography variant="caption" color="error.main">{errors[field.code]}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={values[field.code] || ''}
                      onChange={(e) => handleChange(field.code, e.target.value)}
                      error={!!errors[field.code]}
                      slotProps={{
                        htmlInput: { step: field.precision > 0 ? Math.pow(10, -field.precision) : 1 },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    {field.unit || '\u2014'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {template.commentAllowed && (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3, mb: 3 }}>
            <TextField
              label="Komentarz (opcjonalny)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              multiline
              rows={3}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${comment.length}/1000`}
            />
          </Paper>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            disabled={submitting}
          >
            {submitting ? 'Wysylanie...' : 'Zapisz i wyslij'}
          </Button>
        </Box>
      </form>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Potwierdzenie</DialogTitle>
        <DialogContent>
          <DialogContentText>Czy na pewno chcesz wyslac oswiadczenie?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)}>Anuluj</Button>
          <Button onClick={handleConfirm} variant="contained">
            Zatwierdz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
