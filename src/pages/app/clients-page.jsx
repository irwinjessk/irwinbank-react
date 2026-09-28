import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { listAgences } from '@/features/agences/api/agences-api'
import { useAuth } from '@/features/auth/context/auth-context'
import { listBanques } from '@/features/banques/api/banques-api'
import { createClient, listClients } from '@/features/clients/api/clients-api'

const emptyForm = { nom: '', prenom: '', email: '', banque: '', agence: '' }

export default function ClientsPage() {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [searchParams, setSearchParams] = useSearchParams()
  const agenceFiltre = searchParams.get('agence') ?? ''
  const [rows, setRows] = useState([])
  const [banques, setBanques] = useState([])
  const [agences, setAgences] = useState([])
  const [recherche, setRecherche] = useState({ nom: '', email: '', numero_client: '' })
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load(filtres = {}) {
    setLoading(true)
    setError('')
    try {
      setRows(await listClients(token, { agence: agenceFiltre, ...filtres }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listBanques(token).then(setBanques).catch((err) => setError(err.message))
    listAgences(token).then(setAgences).catch((err) => setError(err.message))
  }, [token])

  useEffect(() => {
    load(recherche)
  }, [token, agenceFiltre])

  useEffect(() => {
    if (!isAdmin && user?.banque_id) setForm((courant) => ({ ...courant, banque: String(user.banque_id) }))
  }, [isAdmin, user])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createClient(token, form)
      setForm({ ...emptyForm, banque: isAdmin ? '' : form.banque })
      await load(recherche)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const agencesDeLaBanque = agences.filter((agence) => String(agence.banque) === form.banque && agence.actif)

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-6">
        <Field label="Nom"><input className={inputClass} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></Field>
        <Field label="Prénom"><input className={inputClass} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required /></Field>
        <Field label="E-mail"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Banque">
          <select
            className={inputClass}
            value={form.banque}
            onChange={(e) => setForm({ ...form, banque: e.target.value, agence: '' })}
            required
            disabled={!isAdmin}
          >
            <option value="">Choisir</option>
            {banques.filter((banque) => banque.actif || String(banque.id) === form.banque).map((banque) => <option key={banque.id} value={banque.id}>{banque.nom}</option>)}
          </select>
        </Field>
        {isAdmin ? (
          <Field label="Agence">
            <select className={inputClass} value={form.agence} onChange={(e) => setForm({ ...form, agence: e.target.value })}>
              <option value="">Agence principale</option>
              {agencesDeLaBanque.map((agence) => <option key={agence.id} value={agence.id}>{agence.nom}</option>)}
            </select>
          </Field>
        ) : (
          <Field label="Agence">
            <input className={inputClass} value={user?.agence_nom ?? ''} disabled />
          </Field>
        )}
        <div className="flex items-end"><Button disabled={saving}>{saving ? 'Inscription…' : 'Inscrire'}</Button></div>
      </form>
      <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); load(recherche) }}>
        <input className={inputClass} placeholder="Nom, prénom" value={recherche.nom} onChange={(e) => setRecherche({ ...recherche, nom: e.target.value })} />
        <input className={inputClass} placeholder="E-mail" value={recherche.email} onChange={(e) => setRecherche({ ...recherche, email: e.target.value })} />
        <input className={inputClass} placeholder="Numéro client" value={recherche.numero_client} onChange={(e) => setRecherche({ ...recherche, numero_client: e.target.value })} />
        <select
          className={inputClass}
          value={agenceFiltre}
          onChange={(e) => setSearchParams(e.target.value ? { agence: e.target.value } : {})}
          aria-label="Filtrer par agence"
        >
          <option value="">Toutes les agences</option>
          {agences.map((agence) => (
            <option key={agence.id} value={agence.id}>{isAdmin ? `${agence.banque_nom} · ${agence.nom}` : agence.nom}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">Rechercher</Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'numero', label: 'Numéro', render: (row) => row.numero_client },
            {
              key: 'nom',
              label: 'Client',
              render: (row) => (
                <Link to={`/app/clients/${row.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  {row.prenom} {row.nom}
                </Link>
              ),
            },
            { key: 'email', label: 'E-mail', render: (row) => row.email },
            { key: 'banque', label: 'Banque', render: (row) => row.banque_nom },
            { key: 'agence', label: 'Agence', render: (row) => row.agence_nom },
            { key: 'conseiller', label: 'Conseiller', render: (row) => row.conseiller_nom || '—' },
            {
              key: 'fiche',
              label: '',
              render: (row) => <Link to={`/app/clients/${row.id}`} className="text-sm text-muted-foreground hover:underline">Voir la fiche →</Link>,
            },
          ]}
        />
      )}
    </section>
  )
}
