import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { formatIdr } from './format'

async function loadPdfRenderer() {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist/build/pdf.mjs')
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  return getDocument
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Lampiran tidak dapat dibaca'))
    reader.readAsDataURL(blob)
  })
}

async function fetchAttachment(url, fetcher) {
  const response = await fetcher(url)
  if (!response.ok) throw new Error('Lampiran tidak dapat diunduh untuk ekspor')
  return response
}

async function renderPdfPages(arrayBuffer, pdfLoader) {
  const loader = pdfLoader ?? await loadPdfRenderer()
  const loadingTask = loader({ data: new Uint8Array(arrayBuffer) })
  const pdf = await loadingTask.promise
  const pages = []

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = Math.min(2, 1240 / baseViewport.width)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d', { alpha: false })
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)

      if (!context) throw new Error('Browser tidak mendukung render PDF')
      await page.render({ canvas, canvasContext: context, viewport }).promise
      pages.push({
        label: `Halaman ${pageNumber} dari ${pdf.numPages}`,
        src: canvas.toDataURL('image/jpeg', 0.92),
      })
      page.cleanup()
    }
  } finally {
    await pdf.destroy()
  }

  return pages
}

export async function prepareVendorAttachmentPages(
  estimate,
  { fetcher = fetch, pdfLoader } = {},
) {
  if (!estimate?.attachmentUrl) return []

  const response = await fetchAttachment(estimate.attachmentUrl, fetcher)
  if (estimate.attachmentType === 'image') {
    return [{
      label: estimate.attachmentName || 'Lampiran gambar',
      src: await blobToDataUrl(await response.blob()),
    }]
  }

  return renderPdfPages(await response.arrayBuffer(), pdfLoader)
}

function infoCard(label, value) {
  return `
    <div class="info-card">
      <p class="info-label">${escapeHtml(label)}</p>
      <p class="info-value">${escapeHtml(value || '-')}</p>
    </div>
  `
}

function attachmentSection(estimate, attachmentPages, attachmentError) {
  if (attachmentPages.length) {
    return `
      ${attachmentPages.map((page, index) => `
        <figure class="attachment-page">
          ${index === 0 ? `<p class="section-title">Lampiran - ${escapeHtml(estimate.attachmentName || 'Vendor quote')}</p>` : ''}
          <img alt="${escapeHtml(page.label)}" src="${page.src}" />
          <figcaption>${escapeHtml(page.label)}</figcaption>
        </figure>
      `).join('')}
    `
  }

  if (attachmentError) {
    return `
      <p class="section-title">Lampiran</p>
      <div class="attachment-error">
        <strong>Preview lampiran tidak dapat dimuat.</strong>
        <span>${escapeHtml(attachmentError)}</span>
        <span>${escapeHtml(estimate.attachmentName || estimate.attachmentUrl)}</span>
      </div>
    `
  }

  return ''
}

export function buildVendorEstimatePdfHtml(
  estimate,
  { attachmentPages = [], attachmentError = '' } = {},
) {
  const quantity = Number(estimate?.quantity) > 0 ? Number(estimate.quantity) : 1
  const unitPrice = Number(estimate?.unitPrice) > 0
    ? Number(estimate.unitPrice)
    : Number(estimate?.price) || 0

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(estimate?.projectTitle || 'Vendor Estimate')} - Vendor Estimate</title>
  <style>
    * { box-sizing: border-box; }
    :root { --brand: #2563eb; --ink: #0f172a; --muted: #64748b; --line: #e2e8f0; --soft: #f8fafc; }
    html, body { margin: 0; padding: 0; }
    body { color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { margin: 0 auto; max-width: 760px; padding: 40px; }
    h1, p, figure { margin: 0; }
    .hero { align-items: flex-end; background: linear-gradient(120deg, #1e40af, #2563eb); border-radius: 20px; color: white; display: flex; gap: 24px; justify-content: space-between; padding: 28px 32px; }
    .eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; opacity: 0.82; text-transform: uppercase; }
    .hero h1 { font-size: 27px; letter-spacing: -0.03em; margin-top: 5px; }
    .hero-sub { margin-top: 5px; opacity: 0.82; }
    .total-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; opacity: 0.82; text-align: right; text-transform: uppercase; }
    .total { font-size: 29px; font-weight: 900; white-space: nowrap; }
    .section-title { color: var(--muted); font-size: 11px; font-weight: 800; letter-spacing: 0.13em; margin: 30px 0 13px; text-transform: uppercase; }
    .info-grid { display: grid; gap: 11px; grid-template-columns: repeat(2, 1fr); }
    .info-card { background: var(--soft); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }
    .info-label { color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
    .info-value { font-size: 14px; font-weight: 800; margin-top: 4px; }
    .price-table { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
    .price-row { display: flex; justify-content: space-between; padding: 12px 16px; }
    .price-row:nth-child(even) { background: var(--soft); }
    .price-row span:first-child { color: var(--muted); font-weight: 700; }
    .price-row strong { font-weight: 900; }
    .price-total { background: var(--brand) !important; color: white; font-size: 15px; }
    .price-total span:first-child { color: rgba(255,255,255,0.85); }
    .attachment-page { break-before: page; page-break-before: always; text-align: center; }
    .attachment-page img { display: block; height: auto; margin: 0 auto; max-height: 245mm; max-width: 100%; object-fit: contain; }
    .attachment-page figcaption { color: var(--muted); font-size: 10px; margin-top: 8px; }
    .attachment-error { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; color: #9a3412; display: grid; gap: 4px; padding: 14px; }
    .signature-wrap { display: flex; justify-content: flex-end; margin-top: 42px; page-break-inside: avoid; }
    .signature { min-width: 220px; text-align: center; }
    .signature-label { color: var(--muted); font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
    .signature-space { height: 58px; }
    .signature-name { border-top: 1px solid var(--ink); font-weight: 800; padding-top: 8px; }
    footer { border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; margin-top: 34px; padding-top: 12px; text-align: center; }
    @media print { .page { max-width: none; padding: 0; } @page { margin: 15mm; } }
  </style>
</head>
<body>
  <main class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">Vendor Estimate</p>
        <h1>${escapeHtml(estimate?.projectTitle || 'Estimasi Vendor')}</h1>
        <p class="hero-sub">${escapeHtml(estimate?.vendorName || '-')}</p>
      </div>
      <div>
        <p class="total-label">Total Harga</p>
        <p class="total">${escapeHtml(formatIdr(estimate?.price))}</p>
      </div>
    </header>

    <p class="section-title">Informasi Pekerjaan</p>
    <div class="info-grid">
      ${infoCard('Nama Job', estimate?.projectTitle)}
      ${infoCard('No Job', estimate?.jobNo)}
      ${infoCard('Nama Vendor', estimate?.vendorName)}
      ${infoCard('Nama AE', estimate?.aeName)}
    </div>

    <p class="section-title">Rincian Harga</p>
    <div class="price-table">
      <div class="price-row"><span>Kuantiti</span><strong>${escapeHtml(quantity)}</strong></div>
      <div class="price-row"><span>Harga Satuan</span><strong>${escapeHtml(formatIdr(unitPrice))}</strong></div>
      <div class="price-row price-total"><span>Total Harga</span><strong>${escapeHtml(formatIdr(estimate?.price))}</strong></div>
    </div>

    ${attachmentSection(estimate, attachmentPages, attachmentError)}

    <div class="signature-wrap">
      <div class="signature">
        <p class="signature-label">Account Executive</p>
        <div class="signature-space"></div>
        <p class="signature-name">${escapeHtml(estimate?.aeName || '-')}</p>
      </div>
    </div>
    <footer>Generated by RAB Calculator</footer>
  </main>
</body>
</html>`
}

async function waitForImages(printWindow) {
  const images = [...(printWindow.document.querySelectorAll?.('img') ?? [])]
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve()
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true })
      image.addEventListener('error', resolve, { once: true })
    })
  }))
}

export async function printVendorEstimatePdf(
  estimate,
  opener = window.open,
  prepareAttachment = prepareVendorAttachmentPages,
) {
  const printWindow = opener('', '_blank', 'width=900,height=700')
  if (!printWindow) throw new Error('Popup ekspor PDF diblokir oleh browser')

  let attachmentPages = []
  let attachmentError = ''
  try {
    attachmentPages = await prepareAttachment(estimate)
  } catch (error) {
    attachmentError = error.message || 'Lampiran gagal diproses'
  }

  printWindow.document.write(buildVendorEstimatePdfHtml(estimate, { attachmentPages, attachmentError }))
  printWindow.document.close()
  await waitForImages(printWindow)
  printWindow.focus()
  printWindow.print()
  return true
}
