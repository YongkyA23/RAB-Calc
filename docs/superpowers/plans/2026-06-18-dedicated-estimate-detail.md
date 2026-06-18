# Dedicated Estimate Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move estimate detail from sidebar into a dedicated full-page view.

**Architecture:** `PriceEstimationContainer` owns `list`, `form`, and `detail` modes. `PriceEstimationListView` renders only the table. New `PriceEstimationDetailView` renders full detail page and actions.

**Tech Stack:** React 19, Vitest, Testing Library.

## Global Constraints

- Price Estimation detail must be a dedicated page/view, not a sidebar.
- List view must be full width.
- View action opens dedicated detail view.
- Detail view shows Back, Edit, Duplicate, Delete actions.
- Detail view shows header fields and line item details.
- No commits unless user explicitly asks.

---

## File Structure

- Create `src/features/priceEstimation/PriceEstimationDetailView.jsx`
- Create `src/features/priceEstimation/PriceEstimationDetailView.test.jsx`
- Modify `src/features/priceEstimation/PriceEstimationListView.jsx`
- Modify `src/features/priceEstimation/PriceEstimationListView.test.jsx`
- Modify `src/features/priceEstimation/PriceEstimationContainer.jsx`

---

### Task 1: Extract dedicated detail view

**Files:**
- Create: `src/features/priceEstimation/PriceEstimationDetailView.jsx`
- Create: `src/features/priceEstimation/PriceEstimationDetailView.test.jsx`

**Interfaces:**
- `PriceEstimationDetailView({ estimate, loading, onBack, onEdit, onDuplicate, onDelete })`

- [ ] **Step 1: Write failing test**

Test renders header details, line inputs, and calls Edit/Duplicate/Delete/Back.

- [ ] **Step 2: Run test**

Run: `npm test -- src/features/priceEstimation/PriceEstimationDetailView.test.jsx`

Expected: FAIL because file does not exist.

- [ ] **Step 3: Create component**

Move detail rendering logic from `PriceEstimationListView` into new component. Include local delete confirmation state.

- [ ] **Step 4: Run test**

Run: `npm test -- src/features/priceEstimation/PriceEstimationDetailView.test.jsx`

Expected: PASS.

---

### Task 2: Make list full-width and view callback based

**Files:**
- Modify: `src/features/priceEstimation/PriceEstimationListView.jsx`
- Modify: `src/features/priceEstimation/PriceEstimationListView.test.jsx`

**Interfaces:**
- Add prop: `onViewEstimate(estimate)`
- Remove sidebar detail state/rendering from list view.

- [ ] **Step 1: Update tests**

List view test should expect clicking `View JOB-002` calls `onViewEstimate(estimates[1])`.

- [ ] **Step 2: Implement list change**

Remove `selectedEstimate` state and `<aside>`. Root grid becomes simple block/full-width. View button calls `onViewEstimate(estimate)`.

- [ ] **Step 3: Run tests**

Run: `npm test -- src/features/priceEstimation/PriceEstimationListView.test.jsx src/features/priceEstimation/PriceEstimationView.test.jsx`

Expected: PASS.

---

### Task 3: Wire container modes

**Files:**
- Modify: `src/features/priceEstimation/PriceEstimationContainer.jsx`

**Interfaces:**
- `mode`: `list | form | detail`
- `selectedEstimate`: estimate or null

- [ ] **Step 1: Add view handler**

`handleViewEstimate(estimate)` sets selected estimate and mode `detail`.

- [ ] **Step 2: Render detail mode**

When `mode === 'detail'`, render `PriceEstimationDetailView` with handlers:

- Back → list
- Edit → existing `handleEditDraft`
- Duplicate → existing `handleDuplicateEstimate`
- Delete → existing delete handler, then list

- [ ] **Step 3: Run focused tests/build**

Run:

```powershell
npm test -- src/features/priceEstimation/PriceEstimationDetailView.test.jsx src/features/priceEstimation/PriceEstimationListView.test.jsx src/features/priceEstimation/PriceEstimationView.test.jsx
npm run build
```

Expected: PASS.

---

## Self-Review

Spec coverage:

- Dedicated page: Task 1 and Task 3.
- Full-width list: Task 2.
- View opens detail: Task 2 and Task 3.
- Detail actions and details: Task 1.

Placeholder scan: no TBD/TODO placeholders.

Type consistency: `onViewEstimate`, `onBack`, `onEdit`, `onDuplicate`, `onDelete` consistent across tasks.
