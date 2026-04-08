import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDeclaration } from '../api/declarations';
import { DeclarationResponse } from '../types';

const STATUS_LABELS: Record<string, string> = {
  NIE_ZLOZONE: 'Nie zlozone',
  ROBOCZE: 'Robocze',
  ZLOZONE: 'Zlozone',
};

export default function DeclarationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [declaration, setDeclaration] = useState<DeclarationResponse | null>(
    null
  );
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
      [
        'Typ oplaty',
        `${declaration.feeTypeName} (${declaration.feeTypeCode})`,
      ],
      ['Kontrahent', declaration.contractorName],
      ['Okres', `${declaration.month}/${declaration.year}`],
      ['Wersja', declaration.version],
      [
        'Data zlozenia',
        declaration.submittedAt
          ? new Date(declaration.submittedAt).toLocaleString('pl-PL')
          : '-',
      ],
      ['Skladajacy', declaration.createdBy],
      ...(declaration.templateVersionName
        ? [['Wersja szablonu', declaration.templateVersionName]]
        : []),
      [],
      ['LP', 'Nazwa', 'Wartosc', 'Jednostka'],
    ];

    if (declaration.fields) {
      declaration.fields.forEach((field, idx) => {
        infoRows.push([
          idx + 1,
          field.label,
          declaration.items[field.code] ?? '',
          field.unit || '',
        ] as (string | number)[]);
      });
    } else {
      Object.entries(declaration.items).forEach(([code, value], idx) => {
        infoRows.push([idx + 1, code, value, '']);
      });
    }

    if (declaration.comment) {
      infoRows.push([], ['Komentarz', declaration.comment]);
    }

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
    if (declaration.templateVersionName) {
      info.push(['Wersja szablonu', declaration.templateVersionName]);
    }

    autoTable(doc, {
      startY: y,
      body: info,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
      margin: { left: 15, right: 15 },
    });

    y = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).lastAutoTable.finalY + 6;

    const itemRows = declaration.fields
      ? declaration.fields.map((field, idx) => [
          String(idx + 1),
          field.label,
          String(declaration.items[field.code] ?? '-'),
          field.unit || '',
        ])
      : Object.entries(declaration.items).map(([code, value], idx) => [
          String(idx + 1),
          code,
          String(value),
          '',
        ]);

    autoTable(doc, {
      startY: y,
      head: [['LP', 'Nazwa', 'Wartosc', 'Jednostka']],
      body: itemRows,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [26, 54, 93], fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 15, right: 15 },
    });

    if (declaration.comment) {
      y = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).lastAutoTable.finalY + 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Komentarz:', 15, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      const lines = doc.splitTextToSize(declaration.comment, pageWidth - 30);
      doc.text(lines, 15, y);
    }

    doc.save(`${declaration.declarationNumber.replace(/\//g, '_')}.pdf`);
  };

  if (error) return <div className="error-banner">{error}</div>;
  if (!declaration) return <div className="loading">Ladowanie...</div>;

  return (
    <div className="declaration-detail">
      <h2>Oswiadczenie: {declaration.declarationNumber}</h2>

      <div className="detail-section">
        <h3>Dane podstawowe</h3>
        <dl className="detail-grid">
          <dt>Numer</dt>
          <dd>{declaration.declarationNumber}</dd>
          <dt>Status</dt>
          <dd>
            <span className="status-badge status-submitted">
              {STATUS_LABELS[declaration.status] || declaration.status}
            </span>
          </dd>
          <dt>Typ oplaty</dt>
          <dd>
            {declaration.feeTypeName} ({declaration.feeTypeCode})
          </dd>
          <dt>Kontrahent</dt>
          <dd>{declaration.contractorName}</dd>
          <dt>Okres</dt>
          <dd>
            {declaration.month}/{declaration.year}
          </dd>
          <dt>Wersja</dt>
          <dd>{declaration.version}</dd>
          <dt>Data zlozenia</dt>
          <dd>
            {declaration.submittedAt
              ? new Date(declaration.submittedAt).toLocaleString('pl-PL')
              : '-'}
          </dd>
          <dt>Skladajacy</dt>
          <dd>{declaration.createdBy}</dd>
          {declaration.templateVersionName && (
            <>
              <dt>Wersja szablonu</dt>
              <dd>{declaration.templateVersionName}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="detail-section">
        <h3>Dane dotyczace oplaty</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>LP</th>
              <th>Nazwa</th>
              <th style={{ width: '150px' }}>Wartosc</th>
              <th style={{ width: '80px' }}>Jednostka</th>
            </tr>
          </thead>
          <tbody>
            {declaration.fields
              ? declaration.fields.map((field, idx) => (
                  <tr key={field.code}>
                    <td className="text-center">{idx + 1}</td>
                    <td>{field.label}</td>
                    <td>{declaration.items[field.code] ?? '-'}</td>
                    <td className="text-center text-muted">
                      {field.unit || '—'}
                    </td>
                  </tr>
                ))
              : Object.entries(declaration.items).map(([code, value], idx) => (
                  <tr key={code}>
                    <td className="text-center">{idx + 1}</td>
                    <td>{code}</td>
                    <td>{value}</td>
                    <td className="text-center text-muted">—</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {declaration.comment && (
        <div className="detail-section">
          <h3>Komentarz</h3>
          <p>{declaration.comment}</p>
        </div>
      )}

      <div className="form-actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          Zamknij
        </button>
        <button className="btn btn-primary" onClick={exportToExcel}>
          Pobierz Excel
        </button>
        <button className="btn btn-primary" onClick={exportToPdf}>
          Pobierz PDF
        </button>
      </div>
    </div>
  );
}
