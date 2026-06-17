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

export function buildJobLogCsv(quotes) {
  return buildCsv({
    rows: quotes,
    columns: [
      { header: 'Date', value: (quote) => quote.date },
      { header: 'No Job', value: (quote) => quote.jobNo },
      { header: 'SKU', value: (quote) => quote.sku },
      { header: 'Client', value: (quote) => quote.client },
      { header: 'Project', value: (quote) => quote.project },
      { header: 'Created By', value: (quote) => quote.createdByName },
      { header: 'Total Print', value: (quote) => quote.totals?.print ?? 0 },
      { header: 'Total Digital', value: (quote) => quote.totals?.digital ?? 0 },
      { header: 'Total Manual', value: (quote) => quote.totals?.manual ?? 0 },
      { header: 'Total Manpower', value: (quote) => quote.totals?.manpower ?? 0 },
      { header: 'Total Additional', value: (quote) => quote.totals?.additional ?? 0 },
      { header: 'Grand Total', value: (quote) => quote.grandTotal ?? 0 },
    ],
  })
}
