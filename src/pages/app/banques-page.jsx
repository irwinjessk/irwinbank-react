import { useEffect, useState } from 'react'
import DataTable from '@/components/data/data-table'
import ExportButtons from '@/components/data/export-buttons'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { createBanque, listBanques, topBanques, updateBanque } from '@/features/banques/api/banques-api'

export default function BanquesPage() {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [rows, setRows] = useState([])
  const [filtres, setFiltres] = useState({ pays: '', ville: '' })
  const [form, setForm] = useState({ nom: '', pays: '', ville: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [appliques, setAppliques] = useState({})
  const [message, setMessage] = useState('')

  async function load(request = () => listBanques(token)) {
    setLoading(true)
    setError('')
    try {
      setRows(await request())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  function annulerEdition() {
    setEditId(null)
    setForm({ nom: '', pays: '', ville: '', email: '' })
  }

  async function action(requete, succes) {
    setError('')
    setMessage('')
    try {
      await requete()
      setMessage(succes)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      if (editId) {
        await updateBanque(token, editId, form)
        setMessage(`Banque « ${form.nom} » mise à jour.`)
      } else {
        await createBanque(token, form)
        setMessage(`Banque « ${form.nom} » enregistrée. Un e-mail de bienvenue est envoyé à ${form.email}.`)
      }
      annulerEdition()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      {isAdmin ? (
        <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-5">
          <Field label="Nom"><input className={inputClass} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></Field>
          <Field label="Pays"><input className={inputClass} value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })} required /></Field>
          <Field label="Ville"><input className={inputClass} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} required /></Field>
          <Field label="E-mail">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required={!editId} />
          </Field>
          <div className="flex items-end gap-2">
            <Button disabled={saving}>{saving ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Enregistrer'}</Button>
            {editId ? <Button type="button" variant="outline" onClick={annulerEdition}>Annuler</Button> : null}
          </div>
        </form>
      ) : null}
      {isAdmin ? (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setAppliques(filtres)
            load(() => listBanques(token, filtres))
          }}
        >
          <input className={inputClass} placeholder="Pays" value={filtres.pays} onChange={(e) => setFiltres({ ...filtres, pays: e.target.value })} />
          <input className={inputClass} placeholder="Ville" value={filtres.ville} onChange={(e) => setFiltres({ ...filtres, ville: e.target.value })} />
          <Button type="submit" variant="outline">Filtrer</Button>
          <Button type="button" variant="outline" onClick={() => load(() => topBanques(token))}>Top 15</Button>
        </form>
      ) : null}
      <ExportButtons ressource="banques" filtres={appliques} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'nom', label: 'Nom', render: (row) => row.nom },
            { key: 'pays', label: 'Pays', render: (row) => row.pays },
            { key: 'ville', label: 'Ville', render: (row) => row.ville },
            { key: 'email', label: 'E-mail', render: (row) => row.email || '—' },
            { key: 'clients', label: 'Clients', render: (row) => row.nombre_clients },
            { key: 'statut', label: 'Statut', render: (row) => (row.actif ? 'Active' : 'Désactivée') },
            ...(isAdmin ? [{
              key: 'actions',
              label: '',
              render: (row) => (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMessage('')
                      setEditId(row.id)
                      setForm({ nom: row.nom, pays: row.pays, ville: row.ville, email: row.email ?? '' })
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => action(() => updateBanque(token, row.id, { actif: !row.actif }), `Banque « ${row.nom} » ${row.actif ? 'désactivée' : 'réactivée'}.`)}
                  >
                    {row.actif ? 'Désactiver' : 'Réactiver'}
                  </Button>
                </div>
              ),
            }] : []),
          ]}
        />
      )}
    </section>
  )
}
