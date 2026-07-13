import { Field, Input } from '../../../components/ui/Form'

export function CalculatorField({ label, unit, ...props }) {
  const accessibleLabel = unit ? `${label} (${unit})` : label
  return (
    <Field label={label}>
      <div className="relative">
        <Input aria-label={accessibleLabel} className={unit ? 'pr-16' : ''} inputMode="decimal" {...props} />
        {unit ? <span className="pointer-events-none absolute inset-y-0 right-3 top-1.5 flex items-center text-xs font-bold uppercase tracking-wide text-slate-400">{unit}</span> : null}
      </div>
    </Field>
  )
}

