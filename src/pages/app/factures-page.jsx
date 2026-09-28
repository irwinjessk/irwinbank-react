import { useEffect, useState } from 'react'
import DataTable from '@/components/data/data-table'
import ExportButtons from '@/components/data/export-buttons'
import { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { listFactures, renvoyerFacture } from '@/features/factures/api/factures-api'
import { formatMontant } from '@/lib/money'

const libellesStatut = { EN_ATTENTE: 'En attente', ENVOYEE: 'Envoyée', ECHEC: 'Échec' }
const couleursStatut = { EN_ATTENTE: 'text-muted-foreground', ENVOYEE: 'text-primary', ECHEC: 'text-destructive' }

export default function FacturesPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [filtres, setFiltres] = useState({ numero_facture: '', statut_envoi: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState(null)
  const [appliques, setAppliques] = useState({})

  async function load(params = filtres) {
    setLoading(true)
    setError('')
    try {
      setRows(await listFactures(token, params))
      setAppliques(params)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load({})
  }, [token])

  async function renvoyer(id) {
    setError('')
    setSendingId(id)
    try {
      const facture = await renvoyerFacture(token, id)
      setRows((current) => current.map((row) => (row.id === id ? facture : row)))
    } catch (err) {
      setError(err.message)
    } finally {
      setSendingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          load()
        }}
      >
        <input className={inputClass} placeholder="Numéro de facture" value={filtres.numero_facture} onChange={(e) => setFiltres({ ...filtres, numero_facture: e.target.value })} />
        <select className={inputClass} value={filtres.statut_envoi} onChange={(e) => setFiltres({ ...filtres, statut_envoi: e.target.value })}>
          <option value="">Tous les statuts</option>
          {Object.entries(libellesStatut).map(([code, libelle]) => <option key={code} value={code}>{libelle}</option>)}
        </select>
        <Button type="submit" variant="outline">Filtrer</Button>
      </form>
      <ExportButtons ressource="factures" filtres={appliques} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'numero', label: 'Numéro', render: (row) => row.numero_facture },
            { key: 'date', label: 'Date', render: (row) => new Date(row.cree_le).toLocaleString('fr-FR') },
            { key: 'email', label: 'Destinataire', render: (row) => row.email_destinataire },
            { key: 'montant', label: 'Montant', render: (row) => formatMontant(row.montant) },
            { key: 'statut', label: 'Envoi', render: (row) => <span className={couleursStatut[row.statut_envoi]}>{libellesStatut[row.statut_envoi]}</span> },
            {
              key: 'action',
              label: '',
              render: (row) => (
                <Button variant="outline" type="button" disabled={sendingId === row.id} onClick={() => renvoyer(row.id)}>
                  {sendingId === row.id ? 'Envoi…' : 'Renvoyer'}
                </Button>
              ),
            },
          ]}
        />
      )}
    </section>
  )
}
