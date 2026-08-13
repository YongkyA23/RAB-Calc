import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildVendorEstimatePdfHtml,
  prepareVendorAttachmentPages,
  printVendorEstimatePdf,
} from './vendorEstimatePdf'

const estimate = {
  id: 've-1',
  projectTitle: 'Carton <Mockup>',
  vendorName: 'Vendor & Co',
  aeName: 'Ayu <AE>',
  jobNo: 'JOB-001',
  quantity: 3,
  unitPrice: 25000,
  price: 75000,
  attachmentUrl: 'https://example.com/quote.pdf',
  attachmentName: 'quote.pdf',
  attachmentType: 'pdf',
}

describe('vendor estimate PDF helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('builds escaped vendor PDF HTML with attachment pages and AE signature', () => {
    const html = buildVendorEstimatePdfHtml(estimate, {
      attachmentPages: [
        { label: 'Halaman 1 dari 2', src: 'data:image/jpeg;base64,page-one' },
        { label: 'Halaman 2 dari 2', src: 'data:image/jpeg;base64,page-two' },
      ],
    })

    expect(html).toContain('Carton &lt;Mockup&gt;')
    expect(html).toContain('Vendor &amp; Co')
    expect(html).toContain('Rp 75.000')
    expect(html).toContain('data:image/jpeg;base64,page-one')
    expect(html).toContain('data:image/jpeg;base64,page-two')
    expect(html).toContain('Account Executive')
    expect(html).toContain('Ayu &lt;AE&gt;')
    expect(html).not.toContain('Carton <Mockup>')
  })

  it('prepares an uploaded image as an embedded data URL', async () => {
    const pages = await prepareVendorAttachmentPages(
      { ...estimate, attachmentType: 'image', attachmentName: 'quote.png' },
      {
        fetcher: vi.fn().mockResolvedValue({
          ok: true,
          blob: () => Promise.resolve(new Blob(['image'], { type: 'image/png' })),
        }),
      },
    )

    expect(pages).toHaveLength(1)
    expect(pages[0].label).toBe('quote.png')
    expect(pages[0].src).toMatch(/^data:image\/png;base64,/) 
  })

  it('renders every uploaded PDF page as an exportable image', async () => {
    const cleanup = vi.fn()
    const destroy = vi.fn()
    const render = vi.fn(() => ({ promise: Promise.resolve() }))
    const getPage = vi.fn(async () => ({
      cleanup,
      getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale }),
      render,
    }))
    const pdfLoader = vi.fn(() => ({
      promise: Promise.resolve({ destroy, getPage, numPages: 2 }),
    }))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({})
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValueOnce('data:image/jpeg;base64,page-one')
      .mockReturnValueOnce('data:image/jpeg;base64,page-two')

    const pages = await prepareVendorAttachmentPages(estimate, {
      fetcher: vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
      }),
      pdfLoader,
    })

    expect(pages.map((page) => page.src)).toEqual([
      'data:image/jpeg;base64,page-one',
      'data:image/jpeg;base64,page-two',
    ])
    expect(getPage).toHaveBeenCalledTimes(2)
    expect(render).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledTimes(2)
    expect(destroy).toHaveBeenCalledOnce()
  })

  it('opens a print view after attachment pages are prepared', async () => {
    const write = vi.fn()
    const close = vi.fn()
    const focus = vi.fn()
    const print = vi.fn()
    const opener = vi.fn(() => ({
      document: { write, close, querySelectorAll: () => [] },
      focus,
      print,
    }))
    const prepareAttachment = vi.fn().mockResolvedValue([
      { label: 'Lampiran', src: 'data:image/png;base64,preview' },
    ])

    await printVendorEstimatePdf(estimate, opener, prepareAttachment)

    expect(opener).toHaveBeenCalledWith('', '_blank', 'width=900,height=700')
    expect(write).toHaveBeenCalledWith(expect.stringContaining('data:image/png;base64,preview'))
    expect(close).toHaveBeenCalledOnce()
    expect(focus).toHaveBeenCalledOnce()
    expect(print).toHaveBeenCalledOnce()
  })
})
