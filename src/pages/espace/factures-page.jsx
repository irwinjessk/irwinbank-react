import { useEffect, useState } from 'react'
import DataTable from '@/components/data/data-table'
import ExportButtons from '@/components/data/export-buttons'
import { useAuth } from '@/features/auth/context/auth-context'
import { listMesFactures } from '@/features/espace/api/espace-api'
import { formatMontant } from '@/lib/money'

export default function EspaceFacturesPage() {
  const { token } = useAuth()
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listMesFactures(token)
      .then(setFactures)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Mes factures</h1>
        <p className="text-sm text-muted-foreground">Un justificatif est émis pour chaque opération sur vos comptes.</p>
      </div>
      <ExportButtons ressource="espace-client/factures" />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <DataTable
          rows={factures}
          columns={[
            { key: 'numero', label: 'Numéro', render: (row) => <span className="font-mono text-xs">{row.numero_facture}</span> },
            { key: 'date', label: 'Date', render: (row) => new Date(row.cree_le).toLocaleString('fr-FR') },
            { key: 'montant', label: 'Montant', render: (row) => formatMontant(row.montant) },
            { key: 'email', label: 'Envoyée à', render: (row) => row.email_destinataire },
          ]}
        />
      )}
    </section>
  )
}
