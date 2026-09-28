import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import StatCard from '@/components/data/stat-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { getCompte } from '@/features/comptes/api/comptes-api'
import { listFactures, renvoyerFacture } from '@/features/factures/api/factures-api'
import { listTransactions } from '@/features/operations/api/operations-api'
import { formatMontant } from '@/lib/money'

const libellesOperation = { DEPOT: 'Dépôt', RETRAIT: 'Retrait', VIREMENT: 'Virement' }
const libellesStatut = { EN_ATTENTE: 'En attente', ENVOYEE: 'Envoyée', ECHEC: 'Échec' }

function Info({ label, children }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm font-medium">{children}</p>
    </div>
  )
}

export default function CompteDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [compte, setCompte] = useState(null)
  const [operations, setOperations] = useState([])
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    try {
      const [fiche, mouvements, facturesCompte] = await Promise.all([
        getCompte(token, id),
        listTransactions(token, { compte: id }),
        listFactures(token, { compte: id }),
      ])
      setCompte(fiche)
      setOperations(mouvements)
      setFactures(facturesCompte)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [token, id])

  async function renvoyer(facture) {
    setError('')
    setMessage('')
    try {
      const resultat = await renvoyerFacture(token, facture.id)
      setMessage(`Facture ${resultat.numero_facture} : ${libellesStatut[resultat.statut_envoi]}.`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>
  if (!compte) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-destructive">{error || 'Compte introuvable.'}</p>
        <Link to="/app/comptes" className="text-sm underline">Retour aux comptes</Link>
      </section>
    )
  }

  const factureDe = (operationId) => factures.find((facture) => facture.transaction === operationId)
  const credits = operations.filter((op) => op.sens === 'CREDIT').reduce((total, op) => total + Number(op.montant), 0)
  const debits = operations.filter((op) => op.sens === 'DEBIT').reduce((total, op) => total + Number(op.montant), 0)

  return (
    <section className="space-y-6">
      <Link to="/app/comptes" className="text-sm text-muted-foreground hover:underline">← Tous les comptes</Link>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Compte {compte.type_compte === 'EPARGNE' ? 'épargne' : 'courant'}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{compte.numero_compte}</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${compte.statut === 'OUVERT' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {compte.statut === 'OUVERT' ? 'Ouvert' : 'Clôturé'}
          </span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Titulaire">
            <Link to={`/app/clients/${compte.client}`} className="text-primary hover:underline">{compte.client_nom}</Link>
            <span className="block text-xs font-normal text-muted-foreground">{compte.client_numero}</span>
          </Info>
          <Info label="Banque · agence">{compte.banque_nom} · {compte.agence_nom}</Info>
          <Info label="Ouvert le">{new Date(compte.date_ouverture).toLocaleDateString('fr-FR')}</Info>
          <Info label="Clôture">
            {compte.date_cloture
              ? `${new Date(compte.date_cloture).toLocaleDateString('fr-FR')}${compte.motif_cloture_libelle ? ` · ${compte.motif_cloture_libelle}` : ''}`
              : '—'}
          </Info>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Solde" value={formatMontant(compte.solde)} />
        <StatCard label="Total crédité" value={formatMontant(credits)} hint={`${operations.filter((op) => op.sens === 'CREDIT').length} opération(s)`} />
        <StatCard label="Total débité" value={formatMontant(debits)} hint={`${operations.filter((op) => op.sens === 'DEBIT').length} opération(s)`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Historique des opérations</h3>
        <DataTable
          rows={operations}
          columns={[
            { key: 'date', label: 'Date', render: (row) => new Date(row.date_transaction).toLocaleString('fr-FR') },
            { key: 'type', label: 'Opération', render: (row) => libellesOperation[row.type_transaction] },
            { key: 'montant', label: 'Montant', render: (row) => `${row.sens === 'CREDIT' ? '+' : '−'} ${formatMontant(row.montant)}` },
            { key: 'description', label: 'Libellé', render: (row) => row.description || '—' },
            {
              key: 'facture',
              label: 'Facture',
              render: (row) => {
                const facture = factureDe(row.id)
                if (!facture) return '—'
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{facture.numero_facture} · {libellesStatut[facture.statut_envoi]}</span>
                    <Button type="button" variant="outline" onClick={() => renvoyer(facture)}>Renvoyer</Button>
                  </div>
                )
              },
            },
          ]}
        />
      </div>
    </section>
  )
}
