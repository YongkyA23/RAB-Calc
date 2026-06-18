# Estimation Line Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show row-level prices and support Excel formulas for Paper Purchase and Metalize Material.

**Architecture:** Calculation helpers gain area-mode support. Estimation model passes additional line dimensions/notes through snapshots. Estimation view renders price summaries and item-specific additional fields.

**Tech Stack:** React 19, Vitest, Testing Library, JavaScript calculation helpers.

## Global Constraints

- Always show each row's individual computed price.
- Additional Cost rows include a Notes field.
- Paper Purchase defaults to `5000` and calculates `5000 × quantity`.
- Metalize Material uses `Length (cm) × Width (cm) × Quantity × Rp 5`.
- Metalize Material shows length and width fields instead of generic amount.
- Save notes and special dimensions in quote draft inputs and line item snapshots.
- No commits unless user explicitly asks.

---

## File Structure

- Modify `src/lib/calculations.js`: add additional area formula.
- Modify `src/lib/calculations.test.js`: area-mode tests.
- Modify `src/data/seedData.js`: make Metalize area-mode with `unitLabel: 'cm²'`, Paper Purchase default amount/rate `5000`.
- Modify `src/features/estimation/estimationModel.js`: pass `lengthCm`, `widthCm`, `notes`, and area mode.
- Modify `src/features/estimation/EstimationView.jsx`: show per-line price summaries and additional notes/special fields.
- Modify `src/features/estimation/EstimationView.test.jsx`: UI tests for Metalize/Paper Purchase.

---

### Task 1: Additional area calculation

**Files:**
- Modify: `src/lib/calculations.js`
- Modify: `src/lib/calculations.test.js`

**Interfaces:**
- `calculateAdditionalLineTotal({ mode, amount, quantity, rate, lengthCm, widthCm })`

- [ ] **Step 1: Add failing test**

Add to `src/lib/calculations.test.js`:

```js
it('calculates additional area-rate totals', () => {
  expect(calculateAdditionalLineTotal({ mode: 'area', lengthCm: 10, widthCm: 20, quantity: 2, rate: 5 })).toBe(2000)
})
```

- [ ] **Step 2: Run test**

Run: `npm test -- src/lib/calculations.test.js`

Expected: FAIL because area mode returns 0.

- [ ] **Step 3: Implement area mode**

In `calculateAdditionalLineTotal`, add before `return 0`:

```js
  if (mode === 'area') {
    return requirePositiveNumber(lengthCm, 'Length')
      * requirePositiveNumber(widthCm, 'Width')
      * requirePositiveNumber(quantity, 'Quantity')
      * requirePositiveNumber(rate, 'Rate')
  }
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/calculations.test.js`

Expected: PASS.

---

### Task 2: Seed data and model support

**Files:**
- Modify: `src/data/seedData.js`
- Modify: `src/features/estimation/estimationModel.js`
- Modify: `src/features/estimation/EstimationView.test.jsx`

**Interfaces:**
- Metalize price item: `additionalMode: 'area'`, `rate: 5`, `unitLabel: 'cm²'`
- Additional line inputs may include `lengthCm`, `widthCm`, `notes`.

- [ ] **Step 1: Add failing model/UI fixture assertions**

In `src/features/estimation/EstimationView.test.jsx`, add price items:

```js
{ id: 'additional-metalize', categoryLayer: 'additional', name: 'Metalize Material', additionalMode: 'area', rate: 5, unitLabel: 'cm²', turnaroundDays: 0 },
```

Add test:

```jsx
it('shows metalize length width fields and calculates area price', () => {
  render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

  fireEvent.click(screen.getByRole('button', { name: 'Add additional line' }))
  fireEvent.change(screen.getByLabelText('Cost type'), { target: { value: 'additional-metalize' } })
  fireEvent.change(screen.getByLabelText('Length (cm)'), { target: { value: '10' } })
  fireEvent.change(screen.getByLabelText('Width (cm)'), { target: { value: '20' } })
  fireEvent.change(screen.getByLabelText('Quantity', { selector: 'input' }), { target: { value: '2' } })

  expect(screen.getByText('10 × 20 × 2 × Rp 5 = Rp 2.000')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test**

Run: `npm test -- src/features/estimation/EstimationView.test.jsx`

Expected: FAIL because fields/summary do not exist.

- [ ] **Step 3: Update seed data**

Change Metalize item:

```js
item({ id: 'additional-metalize', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Metalize Material', additionalMode: 'area', rate: 5, unitLabel: 'cm²', turnaroundDays: 0 }),
```

Keep Paper Purchase `rate: 5000`.

- [ ] **Step 4: Update estimation model**

In additional line calculation, pass:

```js
      lengthCm: line.lengthCm,
      widthCm: line.widthCm,
```

No special notes code needed because `inputs: { ...input }` already snapshots notes.

- [ ] **Step 5: Run model/UI test after view task completes**

Run after Task 3.

---

### Task 3: Estimation UI fields and summaries

**Files:**
- Modify: `src/features/estimation/EstimationView.jsx`
- Modify: `src/features/estimation/EstimationView.test.jsx`

**Interfaces:**
- New helper in view: `formatAdditionalSummary(item, line, total)` returns display text.

- [ ] **Step 1: Add UI helper behavior**

Add helper functions near top of `EstimationView.jsx`:

```js
function isMetalizeItem(item) {
  return item?.id === 'additional-metalize' || item?.name?.toLowerCase().includes('metalize')
}

function safeLineTotal(callback) {
  try {
    return callback()
  } catch {
    return 0
  }
}
```

- [ ] **Step 2: Update addLine defaults**

For `additional`, default to first additional item and:

```js
additional: { itemId: priceItems?.find((item) => item.categoryLayer === 'additional')?.id ?? '', amount: 1, quantity: 1, lengthCm: 1, widthCm: 1, notes: '' },
```

When selected item is Paper Purchase, amount field value should use `line.amount || item.rate || 5000`.

- [ ] **Step 3: Add row summaries**

Under each row, render a small text summary using `formatIdr` and current computed total.

For Metalize summary exact text pattern:

```jsx
<p className="text-sm font-semibold text-slate-700">
  {line.lengthCm || 0} × {line.widthCm || 0} × {line.quantity || 0} × Rp {item.rate || 0} = {formatIdr(total)}
</p>
```

- [ ] **Step 4: Add Additional notes and Metalize fields**

In Additional Costs row:

- Always render Cost type.
- If metalize: render Length (cm), Width (cm), Quantity, Notes.
- Else: render Amount, Quantity, Notes.
- Render line summary.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/features/estimation/EstimationView.test.jsx`

Expected: PASS.

---

### Task 4: Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Focused tests**

Run:

```powershell
npm test -- src/lib/calculations.test.js src/features/estimation/EstimationView.test.jsx
npm run build
```

Expected: PASS.

- [ ] **Step 2: Manual check**

Open Price Estimation:

- Print/Digital rows show row price summary.
- Additional Paper Purchase defaults amount `5000` and summary uses quantity.
- Additional Metalize shows Length/Width/Quantity/Notes and summary uses `Rp 5`.

---

## Self-Review

Spec coverage:

- Individual price display: Task 3.
- Additional notes: Task 3.
- Paper Purchase default/rate: Tasks 2 and 3.
- Metalize length/width and Rp5 area formula: Tasks 1-3.
- Save notes/dimensions: Task 2 through existing input snapshots.

Placeholder scan: no TBD/TODO placeholders.

Type consistency: `lengthCm`, `widthCm`, `notes`, and `additionalMode: 'area'` match across tasks.
