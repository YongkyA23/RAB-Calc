function escapeCsvValue(value) {
  const text = String(value ?? '')

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export function buildCsv({ rows, columns }) {
  const headerLine = columns.map((column) => escapeCsvValue(column.header)).join(',')
  const rowLines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(','),
  )

  return [headerLine, ...rowLines].join('\r\n')
}

export function buildPriceEstimationCsv(estimates) {
  return buildCsv({
    rows: estimates,
    columns: [
      { header: 'Date', value: (estimate) => estimate.date },
      { header: 'Status', value: (estimate) => (estimate.status === 'draft' ? 'Draft' : 'Created') },
      { header: 'No Job', value: (estimate) => estimate.jobNo },
      { header: 'SKU', value: (estimate) => estimate.sku },
      { header: 'Client', value: (estimate) => estimate.client },
      { header: 'Project', value: (estimate) => estimate.project },
      { header: 'Created By', value: (estimate) => estimate.createdByName },
      { header: 'Total Print', value: (estimate) => estimate.totals?.print ?? 0 },
      { header: 'Total Digital', value: (estimate) => estimate.totals?.digital ?? 0 },
      { header: 'Total Manual', value: (estimate) => estimate.totals?.manual ?? 0 },
      { header: 'Total Manpower', value: (estimate) => estimate.totals?.manpower ?? 0 },
      { header: 'Total Additional', value: (estimate) => estimate.totals?.additional ?? 0 },
      { header: 'Grand Total', value: (estimate) => estimate.grandTotal ?? 0 },
    ],
  })
}

export function buildJobLogCsv(quotes) {
  return buildPriceEstimationCsv(quotes)
}
