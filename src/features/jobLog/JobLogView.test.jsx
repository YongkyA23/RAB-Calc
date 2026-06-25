import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JobLogView } from "./JobLogView";

const quotes = [
  {
    id: "q1",
    date: "2026-06-17T10:00:00.000Z",
    jobNo: "JOB-001",
    sku: "SKU-A",
    client: "PT Alpha",
    project: "Carton Mockup",
    createdByName: "Admin",
    totals: { print: 1000, digital: 0, manual: 0, manpower: 0, additional: 0 },
    grandTotal: 1000,
    turnaroundDays: 1,
    lineItems: [
      {
        id: "l1",
        layer: "print",
        computedTotal: 1000,
        priceSnapshot: { name: "Duplex" },
      },
    ],
  },
  {
    id: "q2",
    date: "2026-06-18T10:00:00.000Z",
    jobNo: "JOB-002",
    sku: "SKU-B",
    client: "PT Beta",
    project: "Label Mockup",
    createdByName: "Estimator",
    totals: { print: 2000, digital: 0, manual: 0, manpower: 0, additional: 0 },
    grandTotal: 2000,
    turnaroundDays: 2,
    lineItems: [],
  },
];

describe("JobLogView", () => {
  it("renders quote list and filters by query", () => {
    render(
      <JobLogView
        loading={false}
        onDuplicateQuote={vi.fn()}
        onExportCsv={vi.fn()}
        quotes={quotes}
      />,
    );

    expect(screen.getByText("JOB-001")).toBeInTheDocument();
    expect(screen.getByText("JOB-002")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Cari"), {
      target: { value: "alpha" },
    });

    expect(screen.getByText("JOB-001")).toBeInTheDocument();
    expect(screen.queryByText("JOB-002")).not.toBeInTheDocument();
  });

  it("shows quote detail", () => {
    render(
      <JobLogView
        loading={false}
        onDuplicateQuote={vi.fn()}
        onExportCsv={vi.fn()}
        quotes={quotes}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Lihat JOB-001" }));

    expect(screen.getByText("Detail quote")).toBeInTheDocument();
    expect(screen.getByText("Duplex")).toBeInTheDocument();
  });

  it("duplicates quote to new draft", () => {
    const onDuplicateQuote = vi.fn();
    render(
      <JobLogView
        loading={false}
        onDuplicateQuote={onDuplicateQuote}
        onExportCsv={vi.fn()}
        quotes={quotes}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Duplikat JOB-001" }));

    expect(onDuplicateQuote).toHaveBeenCalledWith(
      expect.objectContaining({ sourceQuoteId: "q1" }),
    );
  });

  it("exports visible quotes as CSV", () => {
    const onExportCsv = vi.fn();
    render(
      <JobLogView
        loading={false}
        onDuplicateQuote={vi.fn()}
        onExportCsv={onExportCsv}
        quotes={quotes}
      />,
    );

    fireEvent.change(screen.getByLabelText("Cari"), {
      target: { value: "beta" },
    });

    expect(onExportCsv).toHaveBeenCalledWith(
      [quotes[1]],
      expect.stringContaining("JOB-002"),
    );
  });

  it("shows skeleton rows in the table while quotes load", () => {
    render(
      <JobLogView
        loading={true}
        onDuplicateQuote={vi.fn()}
        onExportCsv={vi.fn()}
        quotes={quotes}
      />,
    );

    expect(screen.getAllByTestId("table-skeleton-row").length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText("JOB-001")).not.toBeInTheDocument();
  });
});
