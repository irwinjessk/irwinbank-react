import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { listAgentsAgence } from '@/features/agences/api/agences-api'
import { listClients, updateClient } from '@/features/clients/api/clients-api'

export default function ConseillersPanel({ token, agence, onClose, onChange }) {
  const [agents, setAgents] = useState([])
  const [clients, setClients] = useState([])
  const [choix, setChoix] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [agentsAgence, sansConseiller] = await Promise.all([
        listAgentsAgence(token, agence.id),
        listClients(token, { agence: agence.id, sans_conseiller: '1' }),
      ])
      setAgents(agentsAgence)
      setClients(sansConseiller)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMessage('')
    setChoix({})
    load()
  }, [token, agence.id])

  async function designer(client) {
    setError('')
    setSaving(client.id)
    try {
      const fiche = await updateClient(token, client.id, { ...client, conseiller: choix[client.id] })
      setMessage(`${fiche.prenom} ${fiche.nom} est suivi par ${fiche.conseiller_nom}.`)
      await load()
      onChange?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Conseillers · {agence.nom}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Agents : {agents.length ? agents.map((agent) => agent.username).join(', ') : 'aucun agent rattaché'}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>Fermer</Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : clients.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tous les clients de cette agence ont un conseiller.</p>
      ) : (
        <DataTable
          rows={clients}
          columns={[
            { key: 'numero', label: 'Numéro', render: (row) => row.numero_client },
            {
              key: 'nom',
              label: 'Client sans conseiller',
              render: (row) => <Link to={`/app/clients/${row.id}`} className="font-medium hover:underline">{row.prenom} {row.nom}</Link>,
            },
            {
              key: 'conseiller',
              label: 'Conseiller',
              render: (row) => (
                <select
                  className={inputClass}
                  value={choix[row.id] ?? ''}
                  onChange={(e) => setChoix({ ...choix, [row.id]: e.target.value })}
                  aria-label={`Conseiller de ${row.prenom} ${row.nom}`}
                  disabled={!agents.length}
                >
                  <option value="">Choisir</option>
                  {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.username}</option>)}
                </select>
              ),
            },
            {
              key: 'action',
              label: '',
              render: (row) => (
                <Button type="button" variant="outline" disabled={!choix[row.id] || saving === row.id} onClick={() => designer(row)}>
                  {saving === row.id ? 'Désignation…' : 'Désigner'}
                </Button>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
