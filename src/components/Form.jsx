import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'

// Front-end-only form engine. No network requests: submit validates, then shows a success
// state with a generated reference number.
//
// field: { name, label, type?: text|email|tel|select|textarea|checkbox|number|date|vin|zip|radio,
//          required?, options?, placeholder?, autoComplete?, hint?, span?: true, min?, max?, pattern? }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const VIN = /^[A-HJ-NPR-Z0-9]{17}$/i

export function validateField(f, value) {
  const v = typeof value === 'string' ? value.trim() : value
  if (f.required) {
    if (f.type === 'checkbox' && !v) return f.requiredMessage || 'Please check this box to continue.'
    if (f.type === 'checkgroup' && (!v || !v.length)) return f.requiredMessage || 'Choose at least one option.'
    if (f.type !== 'checkbox' && f.type !== 'checkgroup' && (v === '' || v == null)) return `${f.label} is required.`
  }
  if (!v) return ''
  if (f.type === 'email' && !EMAIL.test(v)) return 'Enter an email like name@example.com.'
  if (f.type === 'tel' && String(v).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '').length !== 10)
    return 'Enter a 10-digit phone number, like 251-237-9447.'
  if (f.type === 'vin' && !VIN.test(v)) return 'A VIN is 17 letters and numbers (no I, O or Q).'
  if (f.type === 'zip' && !/^\d{5}$/.test(v)) return 'Enter a 5-digit ZIP code.'
  if (f.type === 'number') {
    const n = Number(String(v).replace(/[,$]/g, ''))
    if (isNaN(n)) return `${f.label} must be a number.`
    if (f.min != null && n < f.min) return `${f.label} must be at least ${f.min}.`
    if (f.max != null && n > f.max) return `${f.label} must be ${f.max} or less.`
  }
  if (f.validate) return f.validate(v) || ''
  return ''
}

export function makeRef(prefix = 'JBA') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `${prefix}-${s}`
}

export function Field({ f, value, error, onChange, onBlur, idBase }) {
  const id = `${idBase}-${f.name}`
  const errId = `${id}-err`
  const hintId = `${id}-hint`
  const describedBy = [f.hint && hintId, error && errId].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    name: f.name,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    'aria-required': f.required || undefined,
    onBlur,
  }
  const label = (
    <>
      {f.label}
      {f.required && (
        <span className="req" aria-hidden="true">
          *
        </span>
      )}
    </>
  )
  const tail = (
    <>
      {f.hint && (
        <span className="hint" id={hintId}>
          {f.hint}
        </span>
      )}
      {error && (
        <span className="error" id={errId}>
          <Icon name="info" size={16} /> {error}
        </span>
      )}
    </>
  )
  const span = f.span ? ' span-all' : ''

  if (f.type === 'checkbox') {
    return (
      <div className={`field${span}`}>
        <label className="check">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} {...common} />
          <span>{label}</span>
        </label>
        {tail}
      </div>
    )
  }
  if (f.type === 'checkgroup' || f.type === 'radio') {
    const multi = f.type === 'checkgroup'
    const arr = multi ? value || [] : value
    return (
      <fieldset className={`field${span}`} aria-describedby={describedBy}>
        <legend>{label}</legend>
        <div className="option-grid">
          {f.options.map((o) => {
            const [val, text] = Array.isArray(o) ? o : [o, o]
            const checked = multi ? arr.includes(val) : arr === val
            return (
              <label className={`option${checked ? ' is-on' : ''}`} key={val}>
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={f.name}
                  value={val}
                  checked={checked}
                  onChange={() => onChange(multi ? (checked ? arr.filter((x) => x !== val) : [...arr, val]) : val)}
                />
                <span>{text}</span>
              </label>
            )
          })}
        </div>
        {tail}
      </fieldset>
    )
  }
  let control
  if (f.type === 'select') {
    control = (
      <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)} autoComplete={f.autoComplete} {...common}>
        <option value="">{f.placeholder || 'Select…'}</option>
        {f.options.map((o) => {
          const [val, text] = Array.isArray(o) ? o : [o, o]
          return (
            <option key={val} value={val}>
              {text}
            </option>
          )
        })}
      </select>
    )
  } else if (f.type === 'textarea') {
    control = <textarea className="textarea" rows={4} value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} {...common} />
  } else {
    const typeMap = { email: 'email', tel: 'tel', number: 'text', date: 'date', vin: 'text', zip: 'text' }
    control = (
      <input
        className="input"
        type={typeMap[f.type] || 'text'}
        inputMode={f.type === 'number' || f.type === 'zip' ? 'numeric' : f.type === 'tel' ? 'tel' : undefined}
        value={value ?? ''}
        placeholder={f.placeholder}
        autoComplete={f.autoComplete}
        min={f.type === 'date' ? f.min : undefined}
        max={f.type === 'date' ? f.max : undefined}
        maxLength={f.type === 'vin' ? 17 : f.maxLength}
        style={f.type === 'vin' ? { textTransform: 'uppercase' } : undefined}
        onChange={(e) => onChange(e.target.value)}
        {...common}
      />
    )
  }
  return (
    <div className={`field${span}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {tail}
    </div>
  )
}

export function SuccessState({ refNo, title = 'Thanks — we received your request.', children, onReset }) {
  const ref = useRef(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div className="success-box" role="status" tabIndex={-1} ref={ref}>
      <span className="badge badge-new">
        <Icon name="check" size={16} /> Submitted
      </span>
      <h3 style={{ margin: '4px 0 0' }}>{title}</h3>
      <p className="mb-0">
        Your reference number is <span className="ref">{refNo}</span>.
      </p>
      {children || <p className="mb-0 muted">A member of our team will follow up shortly. This is a demo site, so nothing was sent.</p>}
      {onReset && (
        <button type="button" className="btn btn-secondary btn-sm mt-1" onClick={onReset}>
          Start a new request
        </button>
      )}
    </div>
  )
}

/**
 * Generic form. Pass `fields` for a single step, or `steps: [{ title, fields }]` for a wizard.
 */
export default function SmartForm({
  fields,
  steps,
  submitLabel = 'Submit',
  initial = {},
  successTitle,
  successBody,
  refPrefix,
  onSuccess,
  footer,
  compact = false,
  ariaLabel,
}) {
  const allSteps = steps || [{ title: null, fields }]
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [done, setDone] = useState(null)
  const idBase = useId()
  const formRef = useRef(null)
  const current = allSteps[step]
  const visible = (f) => !f.showIf || f.showIf(values)

  const set = (name, val, f) => {
    setValues((v) => ({ ...v, [name]: val }))
    if (touched[name] || errors[name]) setErrors((e) => ({ ...e, [name]: validateField(f, val) }))
  }
  const blur = (f) => {
    setTouched((t) => ({ ...t, [f.name]: true }))
    setErrors((e) => ({ ...e, [f.name]: validateField(f, values[f.name]) }))
  }
  const validateStep = () => {
    const errs = {}
    for (const f of current.fields.filter(visible)) {
      const msg = validateField(f, values[f.name])
      if (msg) errs[f.name] = msg
    }
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      const el = formRef.current?.querySelector(`[name="${first}"]`)
      el?.focus()
    }
    return !first
  }
  const submit = (e) => {
    e.preventDefault()
    if (!validateStep()) return
    if (step < allSteps.length - 1) {
      setStep(step + 1)
      setTimeout(() => formRef.current?.querySelector('input,select,textarea')?.focus(), 0)
      return
    }
    const refNo = makeRef(refPrefix)
    setDone(refNo)
    onSuccess?.(values, refNo)
  }

  if (done)
    return (
      <SuccessState
        refNo={done}
        title={successTitle}
        onReset={() => {
          setDone(null)
          setValues(initial)
          setStep(0)
          setErrors({})
          setTouched({})
        }}
      >
        {typeof successBody === 'function' ? successBody(values) : successBody}
      </SuccessState>
    )

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-label={ariaLabel} className={compact ? 'form-compact' : undefined}>
      {allSteps.length > 1 && (
        <ol className="steps" aria-label="Form progress">
          {allSteps.map((s, i) => (
            <li key={s.title} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : undefined}>
              <span className="dot" aria-hidden="true">
                {i < step ? '✓' : i + 1}
              </span>
              {s.title}
              {i < step && <span className="sr-only"> (completed)</span>}
            </li>
          ))}
        </ol>
      )}
      {current.title && allSteps.length > 1 && <h3 className="mt-0">{current.title}</h3>}
      {current.intro && <p className="muted">{current.intro}</p>}
      <p className="hint mt-0">
        Fields marked <span className="req">*</span> are required.
      </p>
      <div className="form-grid">
        {current.fields.filter(visible).map((f) => (
          <Field key={f.name} f={f} idBase={idBase} value={values[f.name]} error={errors[f.name]} onChange={(val) => set(f.name, val, f)} onBlur={() => blur(f)} />
        ))}
      </div>
      {current.note && <p className="small muted mt-2">{current.note}</p>}
      <div className="row mt-3">
        {step > 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button type="submit" className="btn">
          {step < allSteps.length - 1 ? `Continue to ${allSteps[step + 1].title}` : submitLabel}
        </button>
      </div>
      {footer && <div className="mt-2">{footer}</div>}
    </form>
  )
}

// Reusable field sets
export const CONTACT_FIELDS = [
  { name: 'firstName', label: 'First name', required: true, autoComplete: 'given-name' },
  { name: 'lastName', label: 'Last name', required: true, autoComplete: 'family-name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel', placeholder: '251-555-0123' },
]
export const CONTACT_PREF = { name: 'contactPref', label: 'Preferred contact method', type: 'select', options: ['Phone', 'Email', 'Text'] }
export const COMMENTS = { name: 'comments', label: 'Questions or comments', type: 'textarea', span: true }
