import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDeclaration } from '../api/declarations';
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
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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

export default function DeclarationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [declaration, setDeclaration] = useState<DeclarationResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getDeclaration(parseInt(id))
        .then(setDeclaration)
        .catch((e) => setError(e.message));
    }
  }, [id]);

  const exportToExcel = () => {
    if (!declaration) return;
    const infoRows = [
      ['Numer', declaration.declarationNumber],
      ['Status', STATUS_LABELS[declaration.status] || declaration.status],
      ['Typ oplaty', `${declaration.feeTypeName} (${declaration.feeTypeCode})`],
      ['Kontrahent', declaration.contractorName],
      ['Okres', `${declaration.month}/${declaration.year}`],
      ['Wersja', declaration.version],
      ['Data zlozenia', declaration.submittedAt ? new Date(declaration.submittedAt).toLocaleString('pl-PL') : '-'],
      ['Skladajacy', declaration.createdBy],
      ...(declaration.templateVersionName ? [['Wersja szablonu', declaration.templateVersionName]] : []),
      [],
      ['LP', 'Nazwa', 'Wartosc', 'Jednostka'],
    ];
    if (declaration.fields) {
      declaration.fields.forEach((field, idx) => {
        infoRows.push([idx + 1, field.label, declaration.items[field.code] ?? '', field.unit || ''] as (string | number)[]);
      });
    } else {
      Object.entries(declaration.items).forEach(([code, value], idx) => {
        infoRows.push([idx + 1, code, value, '']);
      });
    }
    if (declaration.comment) infoRows.push([], ['Komentarz', declaration.comment]);
    const ws = XLSX.utils.aoa_to_sheet(infoRows);
    ws['!cols'] = [{ wch: 5 }, { wch: 60 }, { wch: 15 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Oswiadczenie');
    XLSX.writeFile(wb, `${declaration.declarationNumber.replace(/\//g, '_')}.xlsx`);
  };

  const exportToPdf = () => {
    if (!declaration) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;
    doc.setFontSize(14);
    doc.text('Oswiadczenie rozliczeniowe', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.text(declaration.declarationNumber, pageWidth / 2, y, { align: 'center' });
    y += 8;
    const info: [string, string][] = [
      ['Status', STATUS_LABELS[declaration.status] || declaration.status],
      ['Typ oplaty', `${declaration.feeTypeName} (${declaration.feeTypeCode})`],
      ['Kontrahent', declaration.contractorName],
      ['Okres', `${declaration.month}/${declaration.year}`],
      ['Wersja', String(declaration.version)],
      ['Data zlozenia', declaration.submittedAt ? new Date(declaration.submittedAt).toLocaleString('pl-PL') : '-'],
      ['Skladajacy', declaration.createdBy],
    ];
    if (declaration.templateVersionName) info.push(['Wersja szablonu', declaration.templateVersionName]);
    autoTable(doc, {
      startY: y, body: info, theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
      margin: { left: 15, right: 15 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 6;
    const itemRows = declaration.fields
      ? declaration.fields.map((field, idx) => [String(idx + 1), field.label, String(declaration.items[field.code] ?? '-'), field.unit || ''])
      : Object.entries(declaration.items).map(([code, value], idx) => [String(idx + 1), code, String(value), '']);
    autoTable(doc, {
      startY: y, head: [['LP', 'Nazwa', 'Wartosc', 'Jednostka']], body: itemRows,
      theme: 'striped', styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [13, 27, 42], fontSize: 8 },
      columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 2: { cellWidth: 25, halign: 'right' }, 3: { cellWidth: 20, halign: 'center' } },
      margin: { left: 15, right: 15 },
    });
    if (declaration.comment) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Komentarz:', 15, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      doc.text(doc.splitTextToSize(declaration.comment, pageWidth - 30), 15, y);
    }
    doc.save(`${declaration.declarationNumber.replace(/\//g, '_')}.pdf`);
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!declaration) return <Skeleton variant="rounded" height={400} />;

  const infoItems: [string, React.ReactNode][] = [
    ['Numer', declaration.declarationNumber],
    ['Status', <Chip label={STATUS_LABELS[declaration.status] || declaration.status} color={STATUS_COLORS[declaration.status]} size="small" />],
    ['Typ oplaty', `${declaration.feeTypeName} (${declaration.feeTypeCode})`],
    ['Kontrahent', declaration.contractorName],
    ['Okres', `${declaration.month}/${declaration.year}`],
    ['Wersja', declaration.version],
    ['Data zlozenia', declaration.submittedAt ? new Date(declaration.submittedAt).toLocaleString('pl-PL') : '-'],
    ['Skladajacy', declaration.createdBy],
  ];
  if (declaration.templateVersionName) {
    infoItems.push(['Wersja szablonu', <Chip label={declaration.templateVersionName} size="small" variant="outlined" color="primary" />]);
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Oswiadczenie: {declaration.declarationNumber}
      </Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dane podstawowe
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 1.5, alignItems: 'center' }}>
          {infoItems.map(([label, value], i) => (
            <Box key={i} sx={{ display: 'contents' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {label}
              </Typography>
              <Typography variant="body2" component="div">
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6">Dane dotyczace oplaty</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0d1b2a' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }}>LP</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nazwa</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, width: 150 }}>Wartosc</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, width: 90, textAlign: 'center' }}>Jednostka</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {declaration.fields
                ? declaration.fields.map((field, idx) => (
                    <TableRow key={field.code} sx={{ bgcolor: idx % 2 === 0 ? 'white' : 'grey.50' }}>
                      <TableCell sx={{ textAlign: 'center', color: 'text.secondary' }}>{idx + 1}</TableCell>
                      <TableCell>{field.label}</TableCell>
                      <TableCell>{declaration.items[field.code] ?? '-'}</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: 'text.secondary' }}>{field.unit || '\u2014'}</TableCell>
                    </TableRow>
                  ))
                : Object.entries(declaration.items).map(([code, value], idx) => (
                    <TableRow key={code} sx={{ bgcolor: idx % 2 === 0 ? 'white' : 'grey.50' }}>
                      <TableCell sx={{ textAlign: 'center', color: 'text.secondary' }}>{idx + 1}</TableCell>
                      <TableCell>{code}</TableCell>
                      <TableCell>{value}</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: 'text.secondary' }}>{'\u2014'}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {declaration.comment && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Komentarz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {declaration.comment}
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
          Zamknij
        </Button>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToExcel}>
          Pobierz Excel
        </Button>
        <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={exportToPdf}>
          Pobierz PDF
        </Button>
      </Box>
    </Box>
  );
}
