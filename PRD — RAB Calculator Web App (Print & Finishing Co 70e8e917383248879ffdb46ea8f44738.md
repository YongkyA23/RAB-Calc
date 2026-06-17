# PRD — RAB Calculator Web App (Print & Finishing Cost Estimator)

<aside>
🎯

**One-line:** A web app that lets account executives and production staff build accurate cost estimates (RAB) for print + finishing mockup jobs in minutes, using a centrally managed price list, and saves every quote to a searchable job log.

</aside>

## 1. Overview

This product replaces a manual spreadsheet-based cost calculator used to quote **printing and finishing of packaging mockups**. A job is priced across four cost layers — printing, digital finishing, manual (area-based) finishing, manpower — plus operational add-ons. The app standardizes pricing, automates the formulas, estimates turnaround time, and logs every quote for reporting.

## 2. Problem statement

- Estimating is done in a shared spreadsheet that is error-prone, easy to overwrite, and hard to govern.
- Price lists live next to live calculations, so a wrong edit silently changes quotes.
- Manual finishing uses area-based formulas (P × L × rate × qty) that staff frequently miscalculate.
- There is no reliable history of past quotes for reporting or reuse.

## 3. Goals & non-goals

### Goals

- Produce a correct grand-total estimate from structured inputs in under 2 minutes.
- Keep the master price list separate from the calculator, with every item fully editable, addable, and removable.
- Auto-calculate all four cost layers and a combined turnaround estimate.
- Persist each finalized quote to a job log with key metadata and totals.

### Non-goals

- Not an invoicing, payment, or accounting system.
- Not a full ERP or production-scheduling tool (turnaround is an estimate only).
- No customer-facing self-service quoting in v1 (internal tool first).

## 4. User

The system supports **multiple users** managed by an admin. Each user has a role:

- **Admin** — full access: creates quotes, edits the master price list, and manages users. Multiple Admin users are allowed.
- **Estimator** — creates and reviews quotes and views the job log.

User accounts (add / edit / deactivate, role assignment) are handled in a dedicated User Management menu.

### 4.1 App structure (dedicated menus)

The app is organized around the following dedicated menus:

| Menu | Purpose |
| --- | --- |
| **1. Create Estimation** | The workspace for building a new estimate: job header → Print → Digital Finishing → Manual Finishing → Manpower → Additional Costs → grand total, then save to the log. (See Section 6.1–6.7.) |
| **2. Price List / Master Data** | The workspace for managing catalog items, with a dedicated section per category where the admin can add, edit, and remove items. (See Section 6.0.) |
| **3. Job Log** | Read-only history of all saved estimates for review and reuse. (See Section 6.7.) |
| **4. User Management** | Admin-only menu to add, edit, deactivate, and assign roles to users. (See Section 6.8.) |

The menus are connected: editing items in **Price List / Master Data** updates the dropdowns and rates used in **Create Estimation** automatically, and User Management controls who can access each menu.

## 5. Core concepts & data model

### 5.1 Job header

Every estimate carries: **No Job**, **SKU**, **Nama Klien** (client name), **Judul Project** (project title), and creation date.

### 5.2 Master price list (fully editable)

The single source of truth for all rates. **Every item in every category can be edited, added, or removed at any time** — nothing is hardcoded. Item names, sizes, prices, tooling/labor rates, minimums, and turnaround values are all configurable. The tables below are starting defaults, not fixed options. Three sub-catalogs:

**A. Print materials** — price per unit by size (A3 = 29.7×42 cm, B2 = 50×70 cm), with a per-unit turnaround.

| Material | A3 price (Rp) | B2 price (Rp) | Est. time |
| --- | --- | --- | --- |
| POD | 20,000 | 30,000 | 1 day |
| HVS 80–100 gsm | 20,000 | 30,000 | 1 day |
| Art Paper / Matte 120–150 gsm | 20,000 | 30,000 | 1 day |
| Art Carton 210–260 gsm | 25,000 | 35,000 | 1 day |
| Duplex 270–350 gsm | 30,000 | 40,000 | 1 day |
| Stiker Vinyl | 25,000 | N/A | 2 days |
| Stiker Transparant + White Ink | 35,000 | N/A | 2 days |
| Stiker Metalized + White Ink | 40,000 | N/A | 2 days |

**B. Digital finishing** — price per unit by size; some options are A3-only (N/A for B2).

| Finishing | A3 price (Rp) | B2 price (Rp) | Est. time |
| --- | --- | --- | --- |
| Spot UV Digital | 20,000 | N/A | 2 days |
| Foil Hot Stamp (standard color) | 20,000 | N/A | 2 days |
| Emboss Digital | 20,000 | N/A | 2 days |
| Cutting Otomatis (Zund, Graphtec) | 15,000 | N/A | 2 days |
| Foil Hot Stamp Effect Rainbow | 30,000 | N/A | 2 days |
| Laminating Glossy/Matte | 10,000 | 15,000 | 1 day |

**C. Manual finishing** — area-based, with a minimum order charge and a per-area rate. Cost combines a tooling/plate charge and a labor charge.

| Finishing | Tooling rate (Rp) | Labor rate (Rp) | Minimum (Rp) | Est. time |
| --- | --- | --- | --- | --- |
| Spot UV | — | ×0.75 / area | 650,000 | 2 days |
| UV Varnish Glossy | — | ×0.75 / area | 600,000 | 2 days |
| UV Varnish Matte | — | ×0.75 / area | by request | 2 days |
| Spot UV / Varnish Effect | — | ×0.75 / area | by request | 2 days |
| Emboss | P×L×2,500 (plate) | P×L×25×qty | 250,000 (labor) | 3 days |
| Die Cut Manual | P×L×3,500 (knife) | P×L×15×qty | 250,000 (labor) | 3 days |

**D. Manpower & operational rates** — outsourced/in-house man power at a daily rate (default Rp 275,000/day), plus operational add-ons (rush job, overtime, in-house finishing, metalize material at Rp 5/cm, paper purchase at Rp 5,000/sheet, product purchase, operator fees, mockup operations).

## 6. Functional requirements (calculator flow)

### 6.0 Price list management (CRUD) — core flexibility requirement

- Admin users can manage every category's items directly in the app: **add**, **edit**, and **delete** rows with no code changes.
- Editable fields adapt per category (e.g. name, A3/B2 price, tooling rate, labor rate, minimum charge, daily rate, turnaround days, A3-only flag).
- The admin can also **add or rename categories** and define new fields/columns where needed (e.g. sizes beyond A3/B2, new operational cost types).
- All calculator dropdowns and rates update automatically from the current price list.

### 6.1 Print Calculator

- Repeatable line items with inputs: **Jenis Print** (material), **Ukuran** (A3/B2), **Qty**.
- Output per line: `Print line total = unit price(material, size) × Qty`; **Total Print** = sum of all print lines.
- Worked example from reference: Duplex 270–350 gsm, B2, Qty 110 → 40,000 × 110 = **Rp 4,400,000**.

### 6.2 Digital Finishing Calculator

- Repeatable line items: **Finishing type**, **Size**, **Qty**, auto unit price → line total.
- Output: sum of all digital finishing lines = **Total Finishing Digital**.
- Must enforce A3-only constraints (block/flag B2 where N/A).

### 6.3 Manual Finishing (area-based) Calculator

- Repeatable line items with inputs: **Finishing type**, **P (cm)**, **L (cm)**, **Qty**, **Jml Alat** (tool count).
- Computes **Biaya Alat** (tooling) + **Ongkos Jasa** (labor) per the manual-finishing formulas, applying the per-type minimum charge. `Jml Alat` defaults to 1 and may be 0 for manual finishing types with no tooling component.
- For manual items with no tooling rate, tooling cost is 0 and labor is calculated as `P × L × laborRate × Qty`.
- For manual items with a minimum marked **by request**, the estimator must enter a manual quoted amount before saving; the line cannot auto-finalize from formula alone.
- Output: **Total Finishing Manual**.

### 6.4 Manpower

- Repeatable line items: **Nama Manpower**, **Jumlah Hari** (days), **Rate** → `Total = days × rate`.
- Output: **Total Biaya Manpower**.

### 6.5 Additional / Operational costs

- Toggleable rows (Ya/Tidak) with notes and value fields: Rush Job, Over Time, In-house Finishing, Metalize Material, Paper Purchase, Product Purchase, Operator Fee, Mockup Operations.
- Additional cost rows support two input modes: direct manual amount, or quantity × master rate where a default rate exists (e.g. Metalize Material Rp 5/cm, Paper Purchase Rp 5,000/sheet). The admin can configure which mode each row uses.
- Output: **Total Biaya Tambahan**.

### 6.6 Grand total & turnaround

- `GRAND TOTAL = Total Print + Total Finishing Digital + Total Finishing Manual + Total Manpower + Total Tambahan`.
- **Estimasi Waktu Pengerjaan**: derived from the maximum turnaround days among selected print, finishing, manpower, and additional-cost components. Note: excludes FA mockup file prep and machine/file trouble.

### 6.7 Save to job log

- On finalize, persist the full quote detail (job header, line items, input snapshots, price snapshots, computed totals, turnaround) plus a log row: Date, No Job, SKU, Client, Project, Total Print, Total Finishing, Total Manpower, Total Tambahan, Grand Total.
- Log is searchable/filterable for reporting and quote reuse.
- Quote reuse is included in v1 as **Duplicate to New Draft**: copying a saved quote creates an editable draft with a new date and new quote id while preserving the original immutable quote.

### 6.8 User management

- Admin users can **add, edit, and deactivate** users. In-app deletion is implemented as deactivation to preserve quote history.
- Each user has a role: **Admin** (full access incl. price list and user management) or **Estimator** (create quotes, view job log).
- Multiple Admin users are allowed.
- All users authenticate before using the app; access to Price List / Master Data and User Management is Admin-only. Self-registration is disabled; Admin users create accounts. The first Admin is seeded during project setup.

## 7. Business logic summary

```
Print line total       = printUnitPrice[material][size] × qty
Total Print            = ΣPrintLines
Digital line total     = digitalUnitPrice[type][size] × qty
Manual formula total   = toolingCost + laborCost
Manual line total      = manualQuotedAmount when minimum is by request; otherwise max(minimumCharge[type], Manual formula total)
  toolingCost          = P × L × toolingRate[type] × jmlAlat (0 when no tooling rate)
  laborCost            = P × L × laborRate[type] × qty
Manpower line total    = days × dailyRate
Additional line total  = manual amount OR quantity × master rate
Grand Total            = ΣPrint + ΣDigital + ΣManual + ΣManpower + ΣAdditional
```

## 8. Non-functional requirements

- **Currency/format:** Indonesian Rupiah, thousands separators, no decimals.
- **User management:** multiple users with role-based access (Admin, Estimator); an admin can add, edit, deactivate, and assign roles to users.
- **Flexibility (core principle):** everything is CRUD-editable per category — add, edit, or remove materials, finishing types, manpower, and operational cost rows, and create new categories, without touching code.
- **Auditability:** price-list changes recorded in a full audit log; quotes immutable once logged.
- **Usability:** dropdowns driven by the master list so the user never types rates manually, except manual quoted amounts for **by request** items and direct-amount additional costs.
- **Validation:** prevent invalid size/material/finishing combinations; require Qty > 0.

## 9. Tech stack

- **Frontend:** React (single-page web app).
- **Database:** Firebase Firestore (cloud NoSQL) for catalog, quotes, job log, and users.
- **Authentication & user management:** Firebase Authentication (with roles).
- **Hosting:** Firebase Hosting.

## 10. Open questions / future

- Margin/markup and tax (PPN) handling — in scope later?
- Client-facing PDF export of the quote.
- Multi-currency or multi-branch price lists.
- Formula-builder support for admin-created custom categories and fields beyond display/storage-only master data.