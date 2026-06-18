# Estimate Detail Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete estimate detail display plus Edit, Duplicate, Delete actions for created and draft estimates.

**Architecture:** Keep `PriceEstimationContainer` as action owner. `PriceEstimationListView` renders table actions and detail-panel actions, using existing handlers. Delete confirmation becomes status-neutral.

**Tech Stack:** React 19, Testing Library, Vitest.

## Global Constraints

- Every estimate row shows View, Edit, Duplicate, and Delete actions.
- Detail panel shows Edit, Duplicate, and Delete buttons when an estimate is selected.
- Delete confirmation works for draft and created estimates.
- Delete confirmation copy must not say draft-only.
- Detail panel shows header fields: No Job, SKU, Client, Project, Status, Total, Turnaround.
- Detail panel shows each line item with layer, item name, saved inputs, notes if present, and line total.
- No commits unless user explicitly asks.

---

## File Structure

- Modify `src/features/priceEstimation/PriceEstimationListView.jsx`: actions, detail view, confirmation text.
- Modify `src/features/priceEstimation/PriceEstimationListView.test.jsx`: tests for created edit/delete and detail actions.
- Modify `src/features/priceEstimation/PriceEstimationView.test.jsx`: align legacy test with new neutral delete flow if needed.

---

### Task 1: Expand actions and details

**Files:**
- Modify: `src/features/priceEstimation/PriceEstimationListView.jsx`
- Modify: `src/features/priceEstimation/PriceEstimationListView.test.jsx`

**Interfaces:**
- Consumes existing props: `onEditDraft(estimate)`, `onDuplicateEstimate(estimate)`, `onDeleteEstimate(estimate)`.

- [ ] **Step 1: Add failing tests**

In `PriceEstimationListView.test.jsx`, ensure created estimate has Edit and Delete:

```jsx
fireEvent.click(screen.getByRole('button', { name: 'Edit JOB-002' }))
expect(onEditDraft).toHaveBeenCalledWith(estimates[1])

fireEvent.click(screen.getByRole('button', { name: 'Delete JOB-002' }))
expect(screen.getByText('Confirm deletion of "JOB-002"')).toBeInTheDocument()
```

Add detail action test:

```jsx
fireEvent.click(screen.getByRole('button', { name: 'View JOB-002' }))
expect(screen.getByText('No Job')).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Edit selected estimate' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Duplicate selected estimate' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Delete selected estimate' })).toBeInTheDocument()
```

- [ ] **Step 2: Run tests**

Run: `npm test -- src/features/priceEstimation/PriceEstimationListView.test.jsx`

Expected: FAIL because created estimate lacks edit/delete and detail actions.

- [ ] **Step 3: Implement actions**

For every table row, render View, Edit, Duplicate, Delete. Edit label is `Edit ${estimateLabel(estimate)}`. Delete label is `Delete ${estimateLabel(estimate)}`. Confirmation text is `Confirm deletion of "${estimateLabel(estimate)}"`.

- [ ] **Step 4: Implement detail panel**

When `selectedEstimate` exists, render:

- action buttons with aria labels:
  - `Edit selected estimate`
  - `Duplicate selected estimate`
  - `Delete selected estimate`
- details list with labels No Job, SKU, Client, Project, Status, Total, Turnaround
- line cards with item name, layer, inputs formatted as `key: value`, and line total

- [ ] **Step 5: Run tests**

Run: `npm test -- src/features/priceEstimation/PriceEstimationListView.test.jsx src/features/priceEstimation/PriceEstimationView.test.jsx`

Expected: PASS.

---

### Task 2: Verification

**Files:**
- Verify changed list/detail view.

- [ ] **Step 1: Focused tests and build**

Run:

```powershell
npm test -- src/features/priceEstimation/PriceEstimationListView.test.jsx src/features/priceEstimation/PriceEstimationView.test.jsx
npm run build
```

Expected: PASS.

---

## Self-Review

Spec coverage:

- Row actions: Task 1.
- Detail actions: Task 1.
- Header details and line details: Task 1.
- Delete confirmation: Task 1.

Placeholder scan: no TBD/TODO placeholders.

Type consistency: existing handler prop names are reused unchanged.
