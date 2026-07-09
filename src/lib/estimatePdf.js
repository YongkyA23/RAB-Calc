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

  if (line.layer === 'additional' && inputs.percent) {
    return `${inputs.percent}% of grand total = ${total}`
  }

  if (line.layer === 'additional' && inputs.amount) {
    return `${formatIdr(inputs.amount)} = ${total}`
  }

  return `Line total = ${total}`
}

function infoCard(label, value) {
  return `
    <div class="info-card">
      <p class="info-label">${escapeHtml(label)}</p>
      <p class="info-value">${escapeHtml(value || '-')}</p>
    </div>
  `
}

function totalRow(label, value, accent = false) {
  return `
    <div class="total-row${accent ? ' total-row-grand' : ''}">
      <span>${escapeHtml(label)}</span>
      <span class="total-amount">${escapeHtml(value)}</span>
    </div>
  `
}

function lineItemRow(line, index) {
  const inputs = readableInputs(line).map((input) => `<span class="chip">${escapeHtml(input)}</span>`).join('') || ''

  return `
    <section class="line-item">
      <div class="line-header">
        <div class="line-heading">
          <span class="line-index">${index + 1}</span>
          <div>
            <p class="line-title">${escapeHtml(line.priceSnapshot?.name ?? line.layer)}</p>
            <p class="line-layer">${escapeHtml(line.layer)}</p>
          </div>
        </div>
        <strong class="line-total">${escapeHtml(formatIdr(line.computedTotal))}</strong>
      </div>
      ${inputs ? `<div class="chips">${inputs}</div>` : ''}
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
    :root { --brand: #2563eb; --ink: #0f172a; --muted: #64748b; --line: #e2e8f0; --soft: #f8fafc; }
    html, body { margin: 0; padding: 0; }
    body { color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { margin: 0 auto; max-width: 760px; padding: 40px; }
    h1, h2, h3, p { margin: 0; }

    .hero { background: linear-gradient(120deg, #1e40af 0%, #2563eb 100%); border-radius: 20px; color: #fff; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; padding: 28px 32px; }
    .hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.8; }
    .hero-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-top: 6px; }
    .hero-sub { font-size: 12px; opacity: 0.85; margin-top: 4px; }
    .hero-total-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; text-align: right; }
    .hero-total { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; text-align: right; white-space: nowrap; }

    .section-title { color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin: 32px 0 14px; }

    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .info-card { background: var(--soft); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }
    .info-label { color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .info-value { font-size: 15px; font-weight: 700; margin-top: 4px; }

    .totals { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
    .total-row { display: flex; justify-content: space-between; padding: 11px 16px; }
    .total-row:nth-child(even) { background: var(--soft); }
    .total-row span:first-child { color: var(--muted); font-weight: 600; }
    .total-amount { font-weight: 700; }
    .total-row-grand { background: var(--brand) !important; color: #fff; font-size: 15px; }
    .total-row-grand span:first-child { color: rgba(255,255,255,0.85); font-weight: 700; }
    .total-row-grand .total-amount { font-weight: 800; }

    .line-item { border: 1px solid var(--line); border-radius: 14px; margin-bottom: 12px; padding: 16px; page-break-inside: avoid; }
    .line-header { align-items: flex-start; display: flex; gap: 16px; justify-content: space-between; }
    .line-heading { align-items: center; display: flex; gap: 12px; }
    .line-index { align-items: center; background: #eff6ff; border-radius: 9px; color: var(--brand); display: inline-flex; font-size: 13px; font-weight: 800; height: 28px; justify-content: center; width: 28px; }
    .line-title { font-size: 15px; font-weight: 700; }
    .line-layer { color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }
    .line-total { font-size: 15px; font-weight: 800; white-space: nowrap; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .chip { background: var(--soft); border: 1px solid var(--line); border-radius: 999px; color: #334155; font-size: 11px; font-weight: 600; padding: 3px 10px; }
    .formula { background: #eff6ff; border-radius: 9px; color: #1e3a8a; font-size: 12px; font-weight: 700; margin-top: 12px; padding: 9px 12px; }

    .empty { color: var(--muted); }
    footer { border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; margin-top: 36px; padding-top: 14px; text-align: center; }

    @media print {
      .page { max-width: none; padding: 0; }
      @page { margin: 16mm; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="hero">
      <div>
        <p class="hero-eyebrow">Internal Estimate</p>
        <h1 class="hero-title">${escapeHtml(estimateLabel(estimate))}</h1>
        <p class="hero-sub">${escapeHtml(estimate?.project || 'Price estimation detail')}</p>
      </div>
      <div>
        <p class="hero-total-label">Grand Total</p>
        <p class="hero-total">${escapeHtml(formatIdr(estimate?.grandTotal))}</p>
      </div>
    </header>

    <p class="section-title">Summary</p>
    <div class="info-grid">
      ${infoCard('No Job', estimate?.jobNo)}
      ${infoCard('SKU', estimate?.sku)}
      ${infoCard('Client', estimate?.client)}
      ${infoCard('Project', estimate?.project)}
      ${infoCard('Turnaround', `${estimate?.turnaroundDays ?? 0} days`)}
      ${infoCard('Line Items', String(lineItems.length))}
    </div>

    <p class="section-title">Layer Totals</p>
    <div class="totals">
      ${totalRow('Print', formatIdr(totals.print))}
      ${totalRow('Digital', formatIdr(totals.digital))}
      ${totalRow('Manual', formatIdr(totals.manual))}
      ${totalRow('Manpower', formatIdr(totals.manpower))}
      ${totalRow('Additional', formatIdr(totals.additional))}
      ${totalRow('Grand Total', formatIdr(estimate?.grandTotal), true)}
    </div>

    <p class="section-title">Line Items</p>
    ${lineItems.length ? lineItems.map(lineItemRow).join('') : '<p class="empty">No line items.</p>'}

    <footer>Generated by RAB Calculator</footer>
  </div>
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
