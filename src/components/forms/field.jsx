export default function Field({ label, children }) {
  return (
    <label className="block text-sm text-muted-foreground">
      {label}
      <div className="mt-1 text-foreground">{children}</div>
    </label>
  )
}

export const inputClass = 'w-full rounded-md border border-input bg-background px-3 py-2'
