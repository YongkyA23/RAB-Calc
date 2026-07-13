import { describe, expect, it } from 'vitest'
import {
  buildPriceAuditEntry,
  buildPaperCalculationPayload,
  buildPaperCalculatorDraftPayload,
  buildPaperCustomSizePayload,
  buildQuotePayload,
  buildUserProfilePayload,
  buildVendorEstimatePayload,
  diffChangedFields,
} from './payloads'

describe('firebase payload builders', () => {
  it('builds an active user profile payload', () => {
    expect(
      buildUserProfilePayload({ uid: 'u1', email: 'admin@example.com', name: 'Admin', role: 'Admin' }),
    ).toMatchObject({
      uid: 'u1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'Admin',
      status: 'active',
    })
  })

  it('diffs changed fields between previous and next values', () => {
    expect(diffChangedFields({ name: 'Old', rate: 5 }, { name: 'New', rate: 5 })).toEqual({
      changedFields: ['name'],
      previousValues: { name: 'Old' },
      newValues: { name: 'New' },
    })
  })

  it('builds a price audit entry with changed field details', () => {
    expect(
      buildPriceAuditEntry({
        itemId: 'item-1',
        categoryId: 'cat-1',
        action: 'update',
        previous: { name: 'Old' },
        next: { name: 'New' },
        editedBy: 'u1',
      }),
    ).toMatchObject({
      itemId: 'item-1',
      categoryId: 'cat-1',
      action: 'update',
      changedFields: ['name'],
      previousValues: { name: 'Old' },
      newValues: { name: 'New' },
      editedBy: 'u1',
    })
  })

  it('omits undefined values from price audit diffs', () => {
    const entry = buildPriceAuditEntry({
      itemId: 'item-1',
      categoryId: 'cat-1',
      action: 'create',
      previous: {},
      next: { id: 'item-1', name: 'New', rate: undefined },
      editedBy: 'u1',
    })

    expect(entry.changedFields).toEqual(['id', 'name'])
    expect(Object.hasOwn(entry.previousValues, 'id')).toBe(false)
    expect(Object.hasOwn(entry.previousValues, 'name')).toBe(false)
    expect(entry.newValues).toEqual({ id: 'item-1', name: 'New' })
  })

  it('builds immutable quote payload with summary fields', () => {
    expect(
      buildQuotePayload({
        id: 'quote-1',
        header: { jobNo: 'JOB-001', sku: 'SKU-1', client: 'PT Client', project: 'Mockup' },
        lineItems: [{ id: 'line-1', layer: 'print', computedTotal: 1000 }],
        totals: { print: 1000, digital: 0, manual: 0, manpower: 0, additional: 0 },
        grandTotal: 1000,
        turnaroundDays: 1,
        createdBy: { uid: 'u1', name: 'Admin' },
      }),
    ).toMatchObject({
      id: 'quote-1',
      jobNo: 'JOB-001',
      sku: 'SKU-1',
      client: 'PT Client',
      project: 'Mockup',
      lineItems: [{ id: 'line-1', layer: 'print', computedTotal: 1000 }],
      totals: { print: 1000, digital: 0, manual: 0, manpower: 0, additional: 0 },
      grandTotal: 1000,
      turnaroundDays: 1,
      createdBy: 'u1',
      createdByName: 'Admin',
      sourceQuoteId: null,
      draft: null,
      updatedAt: expect.any(String),
      status: 'created',
    })
  })

  it('builds vendor estimate payload and keeps createdAt when provided', () => {
    const createdAt = '2026-06-22T00:00:00.000Z'

    expect(
      buildVendorEstimatePayload({
        id: 've-1',
        projectTitle: 'Project A',
        projectInfo: 'Info A',
        vendorName: 'Vendor A',
        price: '5000',
        attachmentUrl: 'https://res.cloudinary.com/demo/raw/upload/a.pdf',
        attachmentName: 'a.pdf',
        attachmentType: 'pdf',
        createdBy: { uid: 'u1', name: 'Admin' },
        createdAt,
      }),
    ).toMatchObject({
      id: 've-1',
      projectTitle: 'Project A',
      projectInfo: 'Info A',
      vendorName: 'Vendor A',
      price: 5000,
      currency: 'IDR',
      attachmentUrl: 'https://res.cloudinary.com/demo/raw/upload/a.pdf',
      attachmentName: 'a.pdf',
      attachmentType: 'pdf',
      createdBy: 'u1',
      createdByName: 'Admin',
      createdAt,
      updatedAt: expect.any(String),
    })
  })

  it('builds serializable calculator drafts and calculation snapshots', () => {
    const draft = buildPaperCalculatorDraftPayload({
      userId: 'u1', activeTab: 'layout', drafts: { layout: { width: '29,7', ignored: undefined } }, updatedAt: '2026-07-13T00:00:00.000Z',
    })
    expect(draft).toEqual({ schemaVersion: 1, userId: 'u1', activeTab: 'layout', drafts: { layout: { width: '29,7' } }, updatedAt: '2026-07-13T00:00:00.000Z' })

    const calculation = buildPaperCalculationPayload({
      id: 'calc-1', title: 'Layout A3+', module: 'layout', inputs: { qty: '1000' },
      result: { status: 'ready', finishedAt: new Date('2026-07-13T08:00:00.000Z'), invalid: Number.NaN },
      createdBy: { uid: 'u1', name: 'Estimator' }, createdAt: '2026-07-13T00:00:00.000Z',
    })
    expect(calculation).toMatchObject({ schemaVersion: 1, id: 'calc-1', module: 'layout', createdBy: 'u1', createdByName: 'Estimator' })
    expect(calculation.result).toEqual({ status: 'ready', finishedAt: '2026-07-13T08:00:00.000Z', invalid: null })
  })

  it('builds normalized custom size payloads', () => {
    expect(buildPaperCustomSizePayload({
      id: 'size-1', type: 'plano', label: ' Supplier A ', width: '65', height: '100', createdBy: { uid: 'u1', email: 'u1@example.com' }, createdAt: '2026-07-13T00:00:00.000Z',
    })).toMatchObject({ id: 'size-1', type: 'plano', label: 'Supplier A', width: 65, height: 100, createdBy: 'u1', createdByName: 'u1@example.com' })
  })
})
