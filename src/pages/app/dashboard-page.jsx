import { useEffect, useState } from 'react'
import BarList from '@/components/data/bar-list'
import StatCard from '@/components/data/stat-card'
import { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { listAgences } from '@/features/agences/api/agences-api'
import { useAuth } from '@/features/auth/context/auth-context'
import { fetchDashboard } from '@/features/dashboard/api/dashboard-api'
import { formatMontant } from '@/lib/money'

const libellesType = { DEPOT: 'Dépôts', RETRAIT: 'Retraits', VIREMENT: 'Virements' }

function Panel({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { token, user } = useAuth()
  const [periode, setPeriode] = useState({ date_min: '', date_max: '', agence: '' })
  const [agences, setAgences] = useState([])
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(filtres = {}) {
    setLoading(true)
    setError('')
    try {
      setData(await fetchDashboard(token, filtres))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    listAgences(token).then(setAgences).catch((err) => setError(err.message))
  }, [token])

  const statut = (code) => data?.comptes_par_statut.find((ligne) => ligne.statut === code)?.nombre ?? 0

  return (
    <section className="space-y-6">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          load(periode)
        }}
      >
        <label className="text-xs text-muted-foreground">
          Du
          <input type="date" className={inputClass} value={periode.date_min} onChange={(e) => setPeriode({ ...periode, date_min: e.target.value })} />
        </label>
        <label className="text-xs text-muted-foreground">
          Au
          <input type="date" className={inputClass} value={periode.date_max} onChange={(e) => setPeriode({ ...periode, date_max: e.target.value })} />
        </label>
        <label className="text-xs text-muted-foreground">
          Agence
          <select className={inputClass} value={periode.agence} onChange={(e) => setPeriode({ ...periode, agence: e.target.value })}>
            <option value="">{user?.role === 'ADMIN' ? 'Toutes les agences' : 'Toute ma banque'}</option>
            {agences.map((agence) => (
              <option key={agence.id} value={agence.id}>
                {user?.role === 'ADMIN' ? `${agence.banque_nom} · ${agence.nom}` : agence.nom}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="outline">Appliquer</Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.transactions_par_type.map((ligne) => (
              <StatCard key={ligne.type} label={libellesType[ligne.type]} value={formatMontant(ligne.volume)} hint={`${ligne.nombre} opération(s)`} />
            ))}
            <StatCard label="Comptes ouverts" value={statut('OUVERT')} hint={`${statut('CLOTURE')} clôturé(s)`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Volume par jour">
              <BarList
                items={data.transactions_par_jour.map((ligne) => ({
                  key: ligne.jour,
                  label: new Date(ligne.jour).toLocaleDateString('fr-FR'),
                  value: Number(ligne.volume),
                  display: formatMontant(ligne.volume),
                }))}
              />
            </Panel>
            {data.top_banques ? (
              <Panel title="Top 15 des banques (clients)">
                <BarList items={data.top_banques.map((banque) => ({ key: banque.id, label: banque.nom, value: banque.nombre_clients }))} />
              </Panel>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}
