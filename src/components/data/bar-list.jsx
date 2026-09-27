export default function BarList({ items }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Aucune donnée sur la période.</p>
  }
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{item.label}</span>
          <span className="h-2 rounded-full bg-muted">
            <span className="block h-2 rounded-full bg-accent" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="tabular-nums">{item.display ?? item.value}</span>
        </li>
      ))}
    </ul>
  )
}
