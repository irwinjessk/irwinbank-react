const formatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMontant(valeur) {
  const nombre = Number(valeur)
  if (Number.isNaN(nombre)) return '—'
  return `${formatter.format(nombre)} F CFA`
}
