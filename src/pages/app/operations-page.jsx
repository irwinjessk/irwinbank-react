import { useEffect, useState } from 'react'
import DataTable from '@/components/data/data-table'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { listComptes } from '@/features/comptes/api/comptes-api'
import { enregistrerTransaction, listTransactions } from '@/features/operations/api/operations-api'
import { formatMontant } from '@/lib/money'

const filtresVides = { type: '', compte: '', date_min: '', date_max: '', montant_min: '', montant_max: '' }
const libellesOperation = { DEPOT: 'Dépôt', RETRAIT: 'Retrait', VIREMENT: 'Virement' }

export default function OperationsPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [comptes, setComptes] = useState([])
  const [form, setForm] = useState({ type_transaction: 'DEPOT', compte: '', compte_contrepartie: '', montant: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filtres, setFiltres] = useState(filtresVides)

  const comptesOuverts = comptes.filter((compte) => compte.statut === 'OUVERT')

  async function load(criteres = filtres) {
    setLoading(true)
    setError('')
    try {
      setRows(await listTransactions(token, criteres))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function loadComptes() {
    return listComptes(token).then(setComptes).catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadComptes()
    load()
  }, [token])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await enregistrerTransaction(token, form)
      setForm({ ...form, montant: '', description: '' })
      await Promise.all([load(), loadComptes()])
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
        <Field label="Type">
          <select className={inputClass} value={form.type_transaction} onChange={(e) => setForm({ ...form, type_transaction: e.target.value })}>
            <option value="DEPOT">Dépôt</option>
            <option value="RETRAIT">Retrait</option>
            <option value="VIREMENT">Virement</option>
          </select>
        </Field>
        <Field label="Compte">
          <select className={inputClass} value={form.compte} onChange={(e) => setForm({ ...form, compte: e.target.value })} required>
            <option value="">Choisir</option>
            {comptesOuverts.map((compte) => <option key={compte.id} value={compte.id}>{compte.numero_compte} · {formatMontant(compte.solde)}</option>)}
          </select>
        </Field>
        {form.type_transaction === 'VIREMENT' ? (
          <Field label="Destinataire">
            <select className={inputClass} value={form.compte_contrepartie} onChange={(e) => setForm({ ...form, compte_contrepartie: e.target.value })} required>
              <option value="">Choisir</option>
              {comptesOuverts.filter((compte) => String(compte.id) !== form.compte).map((compte) => <option key={compte.id} value={compte.id}>{compte.numero_compte}</option>)}
            </select>
          </Field>
        ) : null}
        <Field label="Montant"><input type="number" min="0.01" step="0.01" className={inputClass} value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} required /></Field>
        <Field label="Description"><input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="flex items-end"><Button disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button></div>
      </form>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          load()
        }}
      >
        <select className={inputClass} value={filtres.type} onChange={(e) => setFiltres({ ...filtres, type: e.target.value })} aria-label="Filtrer par type">
          <option value="">Tous les types</option>
          <option value="DEPOT">Dépôts</option>
          <option value="RETRAIT">Retraits</option>
          <option value="VIREMENT">Virements</option>
        </select>
        <select className={inputClass} value={filtres.compte} onChange={(e) => setFiltres({ ...filtres, compte: e.target.value })} aria-label="Filtrer par compte">
          <option value="">Tous les comptes</option>
          {comptes.map((compte) => <option key={compte.id} value={compte.id}>{compte.numero_compte}</option>)}
        </select>
        <label className="text-xs text-muted-foreground">
          Du
          <input type="date" className={inputClass} value={filtres.date_min} onChange={(e) => setFiltres({ ...filtres, date_min: e.target.value })} />
        </label>
        <label className="text-xs text-muted-foreground">
          Au
          <input type="date" className={inputClass} value={filtres.date_max} onChange={(e) => setFiltres({ ...filtres, date_max: e.target.value })} />
        </label>
        <input type="number" min="0" step="0.01" className={inputClass} placeholder="Montant min" value={filtres.montant_min} onChange={(e) => setFiltres({ ...filtres, montant_min: e.target.value })} />
        <input type="number" min="0" step="0.01" className={inputClass} placeholder="Montant max" value={filtres.montant_max} onChange={(e) => setFiltres({ ...filtres, montant_max: e.target.value })} />
        <Button type="submit" variant="outline">Filtrer</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFiltres(filtresVides)
            load(filtresVides)
          }}
        >
          Réinitialiser
        </Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!loading ? <p className="text-xs text-muted-foreground">{rows.length} mouvement(s)</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'date', label: 'Date', render: (row) => new Date(row.date_transaction).toLocaleString('fr-FR') },
            { key: 'type', label: 'Type', render: (row) => libellesOperation[row.type_transaction] },
            { key: 'montant', label: 'Montant', render: (row) => `${row.sens === 'CREDIT' ? '+' : '−'} ${formatMontant(row.montant)}` },
            { key: 'compte', label: 'Compte', render: (row) => comptes.find((compte) => compte.id === row.compte)?.numero_compte ?? `#${row.compte}` },
            { key: 'description', label: 'Libellé', render: (row) => row.description || '—' },
          ]}
        />
      )}
    </section>
  )
}
