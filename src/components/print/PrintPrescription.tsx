'use client'

import { forwardRef } from 'react'

interface PrescriptionData {
  cliente_nome: string
  cliente_indirizzo?: string
  cliente_telefono?: string
  cliente_cf?: string
  data_prescrizione: string
  prescrittore?: string
  tipo: 'occhiali' | 'lac'
  // Lontano
  lontano_od_sph: number | null
  lontano_od_cyl: number | null
  lontano_od_ax: number | null
  lontano_os_sph: number | null
  lontano_os_cyl: number | null
  lontano_os_ax: number | null
  // Vicino
  vicino_od_sph?: number | null
  vicino_od_cyl?: number | null
  vicino_od_ax?: number | null
  vicino_os_sph?: number | null
  vicino_os_cyl?: number | null
  vicino_os_ax?: number | null
  // ADD
  add_od?: number | null
  add_os?: number | null
  // DIP
  dip?: number | null
  dip_vicino?: number | null
  // Note
  note?: string
}

interface PrintPrescriptionProps {
  data: PrescriptionData
  negozio?: {
    nome: string
    indirizzo: string
    telefono: string
    email?: string
    piva?: string
  }
}

function formatDiottria(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

// Componente SVG per disegnare il semicerchio dell'asse (Sistema TABO italiano)
// Nel sistema TABO: 0° a destra, 90° in alto, 180° a sinistra
// VERSIONE GRANDE con linea che attraversa il centro
function AxisSemicircle({
  axis,
  eye,
}: {
  axis: number | null
  eye: 'OD' | 'OS'
}) {
  // Dimensioni GRANDI per stampa professionale
  const width = 220
  const height = 150
  const radius = 80
  const cx = width / 2
  const cy = height - 25 // Centro del semicerchio

  // Sistema TABO: 0° a destra, 90° in alto, 180° a sinistra
  const axisRad = axis !== null ? (axis * Math.PI) / 180 : null

  // La linea ATTRAVERSA il centro e va OLTRE su entrambi i lati
  const getAxisLine = () => {
    if (axisRad === null) return null
    const extension = radius + 20 // La linea va oltre il semicerchio
    // Punto sulla parte superiore (verso l'asse indicato)
    const x1 = cx + extension * Math.cos(axisRad)
    const y1 = cy - extension * Math.sin(axisRad)
    // Punto opposto (sotto la linea base, attraversa il centro)
    const x2 = cx - extension * Math.cos(axisRad)
    const y2 = cy + extension * Math.sin(axisRad)
    return { x1, y1, x2, y2 }
  }

  const axisLine = getAxisLine()

  // Tick marks ogni 10° con etichette ogni 30°
  const allTicks = Array.from({ length: 19 }, (_, i) => i * 10) // 0, 10, 20, ... 180
  const labelTicks = [0, 30, 60, 90, 120, 150, 180]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="axis-semicircle">
      {/* Titolo occhio GRANDE */}
      <text
        x={cx}
        y="22"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill="#1F2937"
      >
        {eye}
      </text>

      {/* Linea base orizzontale estesa */}
      <line
        x1={cx - radius - 15}
        y1={cy}
        x2={cx + radius + 15}
        y2={cy}
        stroke="#374151"
        strokeWidth="2"
      />

      {/* Semicerchio principale - più spesso */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2.5"
      />

      {/* Tick marks - ogni 10° */}
      {allTicks.map((deg) => {
        const rad = (deg * Math.PI) / 180
        const isLabel = labelTicks.includes(deg)
        const innerR = radius - (isLabel ? 10 : 5)
        const outerR = radius + (isLabel ? 8 : 4)
        const x1t = cx + innerR * Math.cos(rad)
        const y1t = cy - innerR * Math.sin(rad)
        const x2t = cx + outerR * Math.cos(rad)
        const y2t = cy - outerR * Math.sin(rad)
        return (
          <line
            key={deg}
            x1={x1t}
            y1={y1t}
            x2={x2t}
            y2={y2t}
            stroke={isLabel ? "#1F2937" : "#9CA3AF"}
            strokeWidth={isLabel ? 2 : 1}
          />
        )
      })}

      {/* Etichette gradi GRANDI */}
      {labelTicks.map((deg) => {
        const rad = (deg * Math.PI) / 180
        const labelR = radius + 22
        const x = cx + labelR * Math.cos(rad)
        const y = cy - labelR * Math.sin(rad)
        return (
          <text
            key={deg}
            x={x}
            y={y + 5}
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            fill="#374151"
          >
            {deg}°
          </text>
        )
      })}

      {/* LINEA ASSE - ATTRAVERSA IL CENTRO E VA OLTRE */}
      {axisLine && (
        <>
          <line
            x1={axisLine.x1}
            y1={axisLine.y1}
            x2={axisLine.x2}
            y2={axisLine.y2}
            stroke="#DC2626"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Pallino all'estremità superiore */}
          <circle
            cx={axisLine.x1}
            cy={axisLine.y1}
            r="6"
            fill="#DC2626"
          />
        </>
      )}

      {/* Punto centrale GRANDE */}
      <circle
        cx={cx}
        cy={cy}
        r="6"
        fill="#DC2626"
        stroke="white"
        strokeWidth="2"
      />

      {/* Box con valore asse - PIÙ GRANDE */}
      <rect
        x={cx - 32}
        y={cy + 12}
        width="64"
        height="26"
        fill={axis !== null ? '#FEE2E2' : '#F3F4F6'}
        stroke={axis !== null ? '#DC2626' : '#9CA3AF'}
        strokeWidth="2"
        rx="4"
      />
      <text
        x={cx}
        y={cy + 31}
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill={axis !== null ? '#DC2626' : '#6B7280'}
      >
        {axis !== null ? `${axis}°` : '—'}
      </text>
    </svg>
  )
}

const PrintPrescription = forwardRef<HTMLDivElement, PrintPrescriptionProps>(
  ({ data, negozio }, ref) => {
    const defaultNegozio = {
      nome: 'Ottica Balestrieri',
      indirizzo: 'Via Roma 123, 00100 Roma (RM)',
      telefono: '06 1234567',
      email: 'info@otticabalestrieri.it',
      piva: 'P.IVA 12345678901'
    }

    const shop = negozio || defaultNegozio

    return (
      <div ref={ref} className="print-prescription">
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body * {
              visibility: hidden;
            }
            .print-prescription, .print-prescription * {
              visibility: visible;
            }
            .print-prescription {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }

          .print-prescription {
            font-family: 'Times New Roman', Times, serif;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
            background: white;
            color: #1a1a1a;
          }

          .print-prescription .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 5mm;
            border-bottom: 2px solid #1a1a1a;
            margin-bottom: 5mm;
          }

          .print-prescription .logo-section {
            display: flex;
            align-items: center;
            gap: 4mm;
          }

          .print-prescription .logo {
            width: 20mm;
            height: 20mm;
            border: 2px solid #f97316;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            font-weight: bold;
            font-size: 14pt;
          }

          .print-prescription .shop-name {
            font-size: 18pt;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0;
          }

          .print-prescription .shop-subtitle {
            font-size: 9pt;
            color: #666;
            margin: 1mm 0 0 0;
          }

          .print-prescription .shop-info {
            text-align: right;
            font-size: 9pt;
            color: #444;
            line-height: 1.4;
          }

          .print-prescription .title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 5mm 0;
            padding: 3mm;
            background: #f5f5f5;
            border: 1px solid #ddd;
          }

          .print-prescription .patient-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5mm;
            margin-bottom: 5mm;
            padding: 3mm;
            border: 1px solid #ddd;
            background: #fafafa;
          }

          .print-prescription .patient-field {
            display: flex;
            gap: 2mm;
          }

          .print-prescription .patient-label {
            font-weight: bold;
            font-size: 10pt;
            min-width: 25mm;
          }

          .print-prescription .patient-value {
            font-size: 10pt;
            border-bottom: 1px dotted #999;
            flex: 1;
            padding-bottom: 1mm;
          }

          .print-prescription .rx-table {
            width: 100%;
            border-collapse: collapse;
            margin: 5mm 0;
            font-size: 10pt;
          }

          .print-prescription .rx-table th,
          .print-prescription .rx-table td {
            border: 1px solid #333;
            padding: 2.5mm;
            text-align: center;
          }

          .print-prescription .rx-table th {
            background: #e5e5e5;
            font-weight: bold;
          }

          .print-prescription .rx-table .eye-header {
            background: #1a1a1a;
            color: white;
            font-size: 11pt;
          }

          .print-prescription .rx-table .eye-od {
            background: #dbeafe;
          }

          .print-prescription .rx-table .eye-os {
            background: #fef3c7;
          }

          .print-prescription .rx-table .row-label {
            background: #f5f5f5;
            font-weight: bold;
            width: 15mm;
          }

          .print-prescription .rx-table .row-lontano .row-label {
            background: #dbeafe;
            color: #1e40af;
          }

          .print-prescription .rx-table .row-vicino .row-label {
            background: #dcfce7;
            color: #166534;
          }

          .print-prescription .rx-table .add-cell {
            background: #dcfce7;
            color: #166534;
            font-weight: bold;
          }

          .print-prescription .rx-table .value {
            font-family: 'Courier New', monospace;
            font-size: 11pt;
          }

          .print-prescription .axis-section {
            display: flex;
            justify-content: center;
            gap: 15mm;
            margin: 8mm 0;
            padding: 8mm 5mm;
            border: 2px solid #ddd;
            background: #fafafa;
          }

          .print-prescription .axis-container {
            text-align: center;
          }

          .print-prescription .axis-title {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 3mm;
          }

          .print-prescription .measurements {
            display: flex;
            justify-content: center;
            gap: 10mm;
            margin: 5mm 0;
            padding: 3mm;
            border: 1px solid #ddd;
          }

          .print-prescription .measurement {
            display: flex;
            align-items: center;
            gap: 2mm;
            font-size: 11pt;
          }

          .print-prescription .measurement-label {
            font-weight: bold;
          }

          .print-prescription .measurement-value {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #1e40af;
            background: #dbeafe;
            padding: 1mm 3mm;
            border: 1px solid #1e40af;
          }

          .print-prescription .notes-section {
            margin: 5mm 0;
            padding: 3mm;
            border: 1px solid #ddd;
            min-height: 20mm;
          }

          .print-prescription .notes-title {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 2mm;
          }

          .print-prescription .notes-content {
            font-size: 10pt;
            white-space: pre-wrap;
          }

          .print-prescription .footer {
            margin-top: 10mm;
            display: flex;
            justify-content: space-between;
            padding-top: 5mm;
            border-top: 1px solid #ddd;
          }

          .print-prescription .signature-box {
            width: 60mm;
            text-align: center;
          }

          .print-prescription .signature-line {
            border-bottom: 1px solid #333;
            height: 15mm;
            margin-bottom: 2mm;
          }

          .print-prescription .signature-label {
            font-size: 9pt;
            color: #666;
          }

          .print-prescription .date-box {
            font-size: 10pt;
          }

          .print-prescription .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 60pt;
            color: rgba(0,0,0,0.03);
            pointer-events: none;
            white-space: nowrap;
          }
        `}</style>

        <div className="watermark">OTTICA BALESTRIERI</div>

        {/* Header */}
        <div className="header">
          <div className="logo-section">
            <div className="logo">OB</div>
            <div>
              <p className="shop-name">{shop.nome}</p>
              <p className="shop-subtitle">Ottica - Optometria - Contattologia</p>
            </div>
          </div>
          <div className="shop-info">
            <div>{shop.indirizzo}</div>
            <div>Tel: {shop.telefono}</div>
            {shop.email && <div>Email: {shop.email}</div>}
            {shop.piva && <div>{shop.piva}</div>}
          </div>
        </div>

        {/* Title */}
        <div className="title">
          Prescrizione {data.tipo === 'occhiali' ? 'Lenti Oftalmiche' : 'Lenti a Contatto'}
        </div>

        {/* Patient Info */}
        <div className="patient-section">
          <div className="patient-field">
            <span className="patient-label">Paziente:</span>
            <span className="patient-value">{data.cliente_nome}</span>
          </div>
          <div className="patient-field">
            <span className="patient-label">Data:</span>
            <span className="patient-value">
              {new Date(data.data_prescrizione).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          {data.cliente_indirizzo && (
            <div className="patient-field">
              <span className="patient-label">Indirizzo:</span>
              <span className="patient-value">{data.cliente_indirizzo}</span>
            </div>
          )}
          {data.prescrittore && (
            <div className="patient-field">
              <span className="patient-label">Prescrittore:</span>
              <span className="patient-value">{data.prescrittore}</span>
            </div>
          )}
        </div>

        {/* Prescription Table */}
        <table className="rx-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: '15mm' }}></th>
              <th colSpan={4} className="eye-header">OCCHIO DESTRO (OD)</th>
              <th colSpan={4} className="eye-header">OCCHIO SINISTRO (OS)</th>
            </tr>
            <tr>
              <th className="eye-od">SPH</th>
              <th className="eye-od">CYL</th>
              <th className="eye-od">ASSE</th>
              <th className="eye-od">ADD</th>
              <th className="eye-os">SPH</th>
              <th className="eye-os">CYL</th>
              <th className="eye-os">ASSE</th>
              <th className="eye-os">ADD</th>
            </tr>
          </thead>
          <tbody>
            {/* Lontano */}
            <tr className="row-lontano">
              <td className="row-label">L</td>
              <td className="value">{formatDiottria(data.lontano_od_sph)}</td>
              <td className="value">{formatDiottria(data.lontano_od_cyl)}</td>
              <td className="value">{data.lontano_od_ax ? `${data.lontano_od_ax}°` : ''}</td>
              <td className="value" style={{ background: '#f5f5f5' }}>—</td>
              <td className="value">{formatDiottria(data.lontano_os_sph)}</td>
              <td className="value">{formatDiottria(data.lontano_os_cyl)}</td>
              <td className="value">{data.lontano_os_ax ? `${data.lontano_os_ax}°` : ''}</td>
              <td className="value" style={{ background: '#f5f5f5' }}>—</td>
            </tr>
            {/* Vicino */}
            {(data.vicino_od_sph || data.vicino_os_sph || data.add_od || data.add_os) && (
              <tr className="row-vicino">
                <td className="row-label">V</td>
                <td className="value">{formatDiottria(data.vicino_od_sph)}</td>
                <td className="value">{formatDiottria(data.vicino_od_cyl)}</td>
                <td className="value">{data.vicino_od_ax ? `${data.vicino_od_ax}°` : ''}</td>
                <td className="value add-cell">{data.add_od ? `+${data.add_od.toFixed(2)}` : ''}</td>
                <td className="value">{formatDiottria(data.vicino_os_sph)}</td>
                <td className="value">{formatDiottria(data.vicino_os_cyl)}</td>
                <td className="value">{data.vicino_os_ax ? `${data.vicino_os_ax}°` : ''}</td>
                <td className="value add-cell">{data.add_os ? `+${data.add_os.toFixed(2)}` : ''}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Axis Diagrams - GRANDI E PROFESSIONALI */}
        {(data.lontano_od_ax || data.lontano_os_ax) && (
          <div className="axis-section">
            <div className="axis-container">
              <AxisSemicircle axis={data.lontano_od_ax} eye="OD" />
            </div>
            <div className="axis-container">
              <AxisSemicircle axis={data.lontano_os_ax} eye="OS" />
            </div>
          </div>
        )}

        {/* Measurements */}
        <div className="measurements">
          {data.dip && (
            <div className="measurement">
              <span className="measurement-label">DIP (Lontano):</span>
              <span className="measurement-value">{data.dip} mm</span>
            </div>
          )}
          {data.dip_vicino && (
            <div className="measurement">
              <span className="measurement-label">DIP (Vicino):</span>
              <span className="measurement-value">{data.dip_vicino} mm</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {data.note && (
          <div className="notes-section">
            <div className="notes-title">Note:</div>
            <div className="notes-content">{data.note}</div>
          </div>
        )}

        {/* Footer with signature */}
        <div className="footer">
          <div className="date-box">
            <strong>Data:</strong> {new Date(data.data_prescrizione).toLocaleDateString('it-IT')}
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Timbro e Firma</div>
          </div>
        </div>
      </div>
    )
  }
)

PrintPrescription.displayName = 'PrintPrescription'

export { PrintPrescription }
export type { PrescriptionData, PrintPrescriptionProps }
