import { formatIdr } from './format'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function readNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function estimateLabel(estimate) {
  return estimate?.jobNo || estimate?.sku || estimate?.client || 'Untitled estimate'
}

function unitPrice(line) {
  const size = line.inputs?.size
  return readNumber(line.priceSnapshot?.prices?.[size])
}

function readableInputs(line) {
  const inputs = line.inputs ?? {}
  const rows = []

  if (inputs.size) rows.push(`Size: ${inputs.size}`)
  if (inputs.qty) rows.push(`Quantity: ${inputs.qty}`)
  if (inputs.quantity) rows.push(`Quantity: ${inputs.quantity}`)
  if (inputs.p) rows.push(`Length: ${inputs.p} cm`)
  if (inputs.l) rows.push(`Width: ${inputs.l} cm`)
  if (inputs.lengthCm) rows.push(`Length: ${inputs.lengthCm} cm`)
  if (inputs.widthCm) rows.push(`Width: ${inputs.widthCm} cm`)
  if (inputs.jmlAlat) rows.push(`Tool count: ${inputs.jmlAlat}`)
  if (inputs.days) rows.push(`Days: ${inputs.days}`)
  if (inputs.amount) rows.push(`Amount: ${formatIdr(inputs.amount)}`)
  if (inputs.notes) rows.push(`Notes: ${inputs.notes}`)

  return rows
}

function formulaSummary(line) {
  const inputs = line.inputs ?? {}
  const total = formatIdr(line.computedTotal)

  if (line.layer === 'print' || line.layer === 'digital') {
    return `${formatIdr(unitPrice(line))} × ${inputs.qty || 0} = ${total}`
  }

  if (line.layer === 'manpower') {
    return `${formatIdr(line.priceSnapshot?.dailyRate)} × ${inputs.days || 0} day = ${total}`
  }

  if (line.layer === 'additional' && line.priceSnapshot?.additionalMode === 'area') {
    return `${inputs.lengthCm || 0} × ${inputs.widthCm || 0} × ${inputs.quantity || 0} × Rp ${line.priceSnapshot?.rate || 0} = ${total}`
  }

  if (line.layer === 'additional' && line.priceSnapshot?.additionalMode === 'rate') {
    return `${formatIdr(line.priceSnapshot?.rate)} × ${inputs.quantity || 0} = ${total}`
  }

  if (line.layer === 'additional' && inputs.amount) {
    return `${formatIdr(inputs.amount)} = ${total}`
  }

  return `Line total = ${total}`
}

function detailRow(label, value) {
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || '-')}</td></tr>`
}

function lineItemRow(line, index) {
  const inputs = readableInputs(line).map((input) => `<li>${escapeHtml(input)}</li>`).join('') || '<li>-</li>'

  return `
    <section class="line-item">
      <div class="line-header">
        <div>
          <p class="line-title">${index + 1}. ${escapeHtml(line.priceSnapshot?.name ?? line.layer)}</p>
          <p class="muted">${escapeHtml(line.layer)}</p>
        </div>
        <strong>${escapeHtml(formatIdr(line.computedTotal))}</strong>
      </div>
      <ul>${inputs}</ul>
      <p class="formula">${escapeHtml(formulaSummary(line))}</p>
    </section>
  `
}

export function buildInternalEstimatePdfHtml(estimate) {
  const totals = estimate?.totals ?? {}
  const lineItems = estimate?.lineItems ?? []

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(estimateLabel(estimate))} - Internal Estimate Detail</title>
  <style>
    * { box-sizing: border-box; }
    body { color: #0f172a; font-family: Arial, sans-serif; margin: 32px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 26px; }
    h2 { font-size: 16px; margin: 28px 0 12px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #e2e8f0; padding: 9px 10px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; color: #475569; width: 180px; }
    .muted { color: #64748b; font-size: 12px; margin-top: 4px; }
    .total { font-size: 22px; font-weight: 800; margin-top: 8px; }
    .line-item { border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 12px; padding: 14px; page-break-inside: avoid; }
    .line-header { align-items: flex-start; display: flex; gap: 16px; justify-content: space-between; }
    .line-title { font-weight: 800; }
    .formula { background: #f8fafc; border-radius: 10px; font-weight: 700; margin-top: 10px; padding: 10px; }
    ul { margin: 10px 0 0; padding-left: 20px; }
    @media print { body { margin: 18mm; } button { display: none; } }
  </style>
</head>
<body>
  <header>
    <p class="muted">Internal Estimate Detail</p>
    <h1>${escapeHtml(estimateLabel(estimate))}</h1>
    <p class="total">${escapeHtml(formatIdr(estimate?.grandTotal))}</p>
  </header>

  <h2>Summary</h2>
  <table>
    <tbody>
      ${detailRow('No Job', estimate?.jobNo)}
      ${detailRow('SKU', estimate?.sku)}
      ${detailRow('Client', estimate?.client)}
      ${detailRow('Project', estimate?.project)}
      ${detailRow('Status', estimate?.status)}
      ${detailRow('Created By', estimate?.createdByName ?? estimate?.createdBy?.name)}
      ${detailRow('Turnaround', `${estimate?.turnaroundDays ?? 0} days`)}
    </tbody>
  </table>

  <h2>Layer Totals</h2>
  <table>
    <tbody>
      ${detailRow('Print', formatIdr(totals.print))}
      ${detailRow('Digital', formatIdr(totals.digital))}
      ${detailRow('Manual', formatIdr(totals.manual))}
      ${detailRow('Manpower', formatIdr(totals.manpower))}
      ${detailRow('Additional', formatIdr(totals.additional))}
      ${detailRow('Grand Total', formatIdr(estimate?.grandTotal))}
    </tbody>
  </table>

  <h2>Line Items</h2>
  ${lineItems.length ? lineItems.map(lineItemRow).join('') : '<p class="muted">No line items.</p>'}
</body>
</html>`
}

export function printInternalEstimatePdf(estimate, opener) {
  const openWindow = opener ?? window.open
  const printWindow = openWindow('', '_blank', 'width=900,height=700')
  if (!printWindow) return

  printWindow.document.write(buildInternalEstimatePdfHtml(estimate))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
