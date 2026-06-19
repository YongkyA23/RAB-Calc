# Internal Estimate PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add browser-print PDF generation for each estimate's internal detail.

**Architecture:** Build printable HTML from an estimate in `src/lib/estimatePdf.js`, then open it in a browser print window. Wire a PDF button into the estimate detail screen only. No PDF library dependency.

**Tech Stack:** React 19, Vite, Vitest, browser `window.open`, `document.write`, `print`.

## Global Constraints

- Use browser print PDF approach.
- No new PDF dependency.
- Internal estimate detail content: summary, line items, inputs, formula summaries, totals.
- Add action from each estimate detail page.
- Preserve existing estimate edit/duplicate/delete behavior.
- Follow TDD: tests first, verify red, implement, verify green.
- Do not commit unless user explicitly asks.

---

## File Structure

- Create `src/lib/estimatePdf.js`
  - Pure builder: `buildInternalEstimatePdfHtml(estimate)` returns printable HTML string.
  - Browser side-effect: `printInternalEstimatePdf(estimate, opener = window.open)` opens print window, writes HTML, calls print.
- Create `src/lib/estimatePdf.test.js`
  - Tests HTML includes estimate detail and escapes unsafe strings.
  - Tests print function writes document and triggers print.
- Modify `src/features/priceEstimation/PriceEstimationDetailView.jsx`
  - Add `onGeneratePdf` prop.
  - Add `PDF`/`Generate PDF` button beside existing detail actions.
- Modify `src/features/priceEstimation/PriceEstimationDetailView.test.jsx`
  - Test the PDF button renders and calls handler with current estimate.
- Modify `src/features/priceEstimation/PriceEstimationContainer.jsx`
  - Import `printInternalEstimatePdf`.
  - Pass `onGeneratePdf={printInternalEstimatePdf}` to detail view.

---

### Task 1: PDF HTML builder and print helper

**Files:**
- Create: `src/lib/estimatePdf.js`
- Create: `src/lib/estimatePdf.test.js`

**Interfaces:**
- Produces: `buildInternalEstimatePdfHtml(estimate: object): string`
- Produces: `printInternalEstimatePdf(estimate: object, opener?: Function): void`

Steps:

1. Write tests in `src/lib/estimatePdf.test.js` for HTML content, escaping, and print-window behavior.
2. Run `npm test -- src/lib/estimatePdf.test.js`; expect FAIL because module does not exist.
3. Create `src/lib/estimatePdf.js` with HTML builder and print helper.
4. Run `npm test -- src/lib/estimatePdf.test.js`; expect PASS.

### Task 2: Detail page PDF action

**Files:**
- Modify: `src/features/priceEstimation/PriceEstimationDetailView.jsx`
- Modify: `src/features/priceEstimation/PriceEstimationDetailView.test.jsx`
- Modify: `src/features/priceEstimation/PriceEstimationContainer.jsx`

**Interfaces:**
- Consumes: `printInternalEstimatePdf(estimate)` from `src/lib/estimatePdf.js`
- Produces: `PriceEstimationDetailView({ ..., onGeneratePdf })`

Steps:

1. Add failing test in `PriceEstimationDetailView.test.jsx`: clicking `Generate PDF` calls `onGeneratePdf(estimate)`.
2. Run `npm test -- src/features/priceEstimation/PriceEstimationDetailView.test.jsx`; expect FAIL because button is missing.
3. Add button to detail view and call `onGeneratePdf(estimate)`.
4. Wire container to pass `printInternalEstimatePdf`.
5. Run `npm test -- src/features/priceEstimation/PriceEstimationDetailView.test.jsx src/lib/estimatePdf.test.js`; expect PASS.

### Task 3: Verification

Steps:

1. Run `npm test`; expect PASS.
2. Run `npm run lint`; report exact result. Existing unrelated `AppShell.jsx` unused imports may still fail.
3. Run `grep`/search to confirm no PDF library dependency added.

---

## Self-Review

Spec coverage:
- Browser print PDF: Task 1.
- Internal detail content: Task 1 HTML test and builder.
- Detail-page action: Task 2.
- No dependency: Task 3 check.
- Existing behavior preserved: Task 2 focused tests + full suite.

No placeholders. Function names consistent across tasks.
