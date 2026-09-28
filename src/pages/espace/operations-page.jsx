import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import ExportButtons from '@/components/data/export-buttons'
import StatCard from '@/components/data/stat-card'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { getMonCompte, listMesComptes, listMesOperations } from '@/features/espace/api/espace-api'
import { libelleOperation, libellesOperation, libellesTypeCompte } from '@/features/espace/libelles'
import { formatMontant } from '@/lib/money'

const filtresVides = { compte: '', type: '', date_min: '', date_max: '' }

export default function EspaceOperationsPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [compte, setCompte] = useState(null)
  const [comptes, setComptes] = useState([])
  const [operations, setOperations] = useState([])
  const [filtres, setFiltres] = useState({ ...filtresVides, compte: id ?? '' })
  const [appliques, setAppliques] = useState({ ...filtresVides, compte: id ?? '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const initiaux = { ...filtresVides, compte: id ?? '' }
    setFiltres(initiaux)
    setAppliques(initiaux)
    setError('')
    Promise.all([id ? getMonCompte(token, id) : Promise.resolve(null), listMesComptes(token)])
      .then(([fiche, sesComptes]) => {
        setCompte(fiche)
        setComptes(sesComptes)
      })
      .catch((err) => setError(err.message))
  }, [token, id])

  useEffect(() => {
    setLoading(true)
    listMesOperations(token, appliques)
      .then(setOperations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, appliques])

  const changer = (champ) => (event) => setFiltres({ ...filtres, [champ]: event.target.value })
  const credits = operations.filter((op) => op.sens === 'CREDIT').reduce((total, op) => total + Number(op.montant), 0)
  const debits = operations.filter((op) => op.sens === 'DEBIT').reduce((total, op) => total + Number(op.montant), 0)

  return (
    <section className="space-y-6">
      {id ? (
        <div className="space-y-3">
          <Link to="/espace" className="text-sm text-muted-foreground hover:underline">← Mes comptes</Link>
          {compte ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{libellesTypeCompte[compte.type_compte]}</p>
              <h1 className="mt-1 font-mono text-lg font-semibold">{compte.numero_compte}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ouvert le {new Date(compte.date_ouverture).toLocaleDateString('fr-FR')} · {compte.agence_nom}
                {compte.statut === 'OUVERT' ? '' : ` · clôturé le ${new Date(compte.date_cloture).toLocaleDateString('fr-FR')}`}
              </p>
              <p className="mt-3 text-3xl font-semibold text-primary">{formatMontant(compte.solde)}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <h1 className="text-xl font-semibold">Mes opérations</h1>
      )}

      <form
        onSubmit={(event) => { event.preventDefault(); setAppliques(filtres) }}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {id ? null : (
          <Field label="Compte">
            <select className={inputClass} value={filtres.compte} onChange={changer('compte')}>
              <option value="">Tous mes comptes</option>
              {comptes.map((c) => <option key={c.id} value={c.id}>{c.numero_compte}</option>)}
            </select>
          </Field>
        )}
        <Field label="Opération">
          <select className={inputClass} value={filtres.type} onChange={changer('type')}>
            <option value="">Toutes</option>
            {Object.entries(libellesOperation).map(([code, libelle]) => <option key={code} value={code}>{libelle}</option>)}
          </select>
        </Field>
        <Field label="Du"><input type="date" className={inputClass} value={filtres.date_min} onChange={changer('date_min')} /></Field>
        <Field label="Au"><input type="date" className={inputClass} value={filtres.date_max} onChange={changer('date_max')} /></Field>
        <div className="flex items-end gap-2">
          <Button>Filtrer</Button>
          <Button type="button" variant="outline" onClick={() => { const vides = { ...filtresVides, compte: id ?? '' }; setFiltres(vides); setAppliques(vides) }}>
            Effacer
          </Button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Opérations" value={operations.length} />
        <StatCard label="Total crédité" value={formatMontant(credits)} />
        <StatCard label="Total débité" value={formatMontant(debits)} />
      </div>

      <ExportButtons ressource="espace-client/transactions" filtres={appliques} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <DataTable
          rows={operations}
          columns={[
            { key: 'date', label: 'Date', render: (row) => new Date(row.date_transaction).toLocaleString('fr-FR') },
            ...(id ? [] : [{ key: 'compte', label: 'Compte', render: (row) => row.compte_numero }]),
            { key: 'type', label: 'Opération', render: (row) => libelleOperation(row) },
            {
              key: 'montant',
              label: 'Montant',
              render: (row) => (
                <span className={row.sens === 'CREDIT' ? 'text-primary' : ''}>
                  {row.sens === 'CREDIT' ? '+' : '−'} {formatMontant(row.montant)}
                </span>
              ),
            },
            { key: 'description', label: 'Libellé', render: (row) => row.description || '—' },
          ]}
        />
      )}
    </section>
  )
}
