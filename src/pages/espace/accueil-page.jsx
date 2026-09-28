import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import StatCard from '@/components/data/stat-card'
import { useAuth } from '@/features/auth/context/auth-context'
import { getProfil, listMesComptes, listMesOperations } from '@/features/espace/api/espace-api'
import { libelleOperation, libellesTypeCompte } from '@/features/espace/libelles'
import { formatMontant } from '@/lib/money'

export default function EspaceAccueilPage() {
  const { token } = useAuth()
  const [profil, setProfil] = useState(null)
  const [comptes, setComptes] = useState([])
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getProfil(token), listMesComptes(token), listMesOperations(token)])
      .then(([fiche, sesComptes, mouvements]) => {
        setProfil(fiche)
        setComptes(sesComptes)
        setOperations(mouvements.slice(0, 5))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  const ouverts = comptes.filter((compte) => compte.statut === 'OUVERT')
  const avoirs = ouverts.reduce((total, compte) => total + Number(compte.solde), 0)

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Bonjour {profil.prenom}</h1>
        <p className="text-sm text-muted-foreground">Voici la situation de vos comptes chez {profil.banque_nom}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Avoirs" value={formatMontant(avoirs)} hint="Total des comptes ouverts" />
        <StatCard label="Comptes ouverts" value={ouverts.length} />
        <StatCard label="Mon agence" value={profil.agence_nom} hint={`${profil.agence_ville} · conseiller : ${profil.conseiller_nom || 'à désigner'}`} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Mes comptes</h2>
        {comptes.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {comptes.map((compte) => (
              <Link
                key={compte.id}
                to={`/espace/comptes/${compte.id}`}
                className="rounded-lg border border-border bg-card p-4 transition hover:border-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs tracking-wide text-muted-foreground uppercase">{libellesTypeCompte[compte.type_compte]}</p>
                    <p className="mt-1 font-mono text-sm">{compte.numero_compte}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${compte.statut === 'OUVERT' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {compte.statut === 'OUVERT' ? 'Ouvert' : 'Clôturé'}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-primary">{formatMontant(compte.solde)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun compte pour le moment : rapprochez-vous de votre agence.</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Dernières opérations</h2>
          <Link to="/espace/operations" className="text-sm text-primary hover:underline">Tout voir</Link>
        </div>
        <DataTable
          rows={operations}
          columns={[
            { key: 'date', label: 'Date', render: (row) => new Date(row.date_transaction).toLocaleString('fr-FR') },
            { key: 'compte', label: 'Compte', render: (row) => row.compte_numero },
            { key: 'type', label: 'Opération', render: (row) => libelleOperation(row) },
            { key: 'montant', label: 'Montant', render: (row) => `${row.sens === 'CREDIT' ? '+' : '−'} ${formatMontant(row.montant)}` },
          ]}
        />
      </div>
    </section>
  )
}
