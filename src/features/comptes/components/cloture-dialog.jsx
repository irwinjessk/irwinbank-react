import { useState } from 'react'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { formatMontant } from '@/lib/money'

const modes = {
  VIREMENT: 'Virement vers un autre compte ADA',
  ESPECES: 'Remise en espèces',
  CHEQUE: 'Chèque de banque',
}

export default function ClotureDialog({ compte, comptes, clients, onConfirm, onCancel }) {
  const [form, setForm] = useState({ motif: 'DEMANDE_CLIENT', mode_restitution: '', compte_destinataire: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const solde = Number(compte.solde)
  const aRestituer = solde > 0
  const nomClient = (id) => {
    const client = clients.find((item) => item.id === id)
    return client ? `${client.prenom} ${client.nom}` : `Client #${id}`
  }
  const destinations = comptes
    .filter((item) => item.statut === 'OUVERT' && item.id !== compte.id)
    .sort((a, b) => Number(b.client === compte.client) - Number(a.client === compte.client))

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onConfirm({ ...form, mode_restitution: aRestituer ? form.mode_restitution : '' })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-primary/40 p-4" role="dialog" aria-modal="true" aria-labelledby="cloture-titre">
      <form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div>
          <h2 id="cloture-titre" className="text-lg font-semibold">Clôturer le compte {compte.numero_compte}</h2>
          <p className="text-sm text-muted-foreground">
            {nomClient(compte.client)} · solde actuel <strong className="text-foreground">{formatMontant(compte.solde)}</strong>
          </p>
        </div>

        <Field label="Motif">
          <select className={inputClass} value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })}>
            <option value="DEMANDE_CLIENT">Demande du client</option>
            <option value="DECISION_BANQUE">Décision de la banque</option>
          </select>
        </Field>

        {aRestituer ? (
          <>
            <Field label="Restitution du solde au client">
              <select className={inputClass} value={form.mode_restitution} onChange={(e) => setForm({ ...form, mode_restitution: e.target.value })} required>
                <option value="">Choisir</option>
                {Object.entries(modes).map(([code, libelle]) => <option key={code} value={code}>{libelle}</option>)}
              </select>
            </Field>
            {form.mode_restitution === 'VIREMENT' ? (
              <Field label="Compte qui reçoit le solde">
                <select className={inputClass} value={form.compte_destinataire} onChange={(e) => setForm({ ...form, compte_destinataire: e.target.value })} required>
                  <option value="">Choisir</option>
                  {destinations.map((item) => (
                    <option key={item.id} value={item.id}>{item.numero_compte} · {nomClient(item.client)}</option>
                  ))}
                </select>
              </Field>
            ) : null}
            {form.mode_restitution ? (
              <p className="rounded-md bg-muted p-3 text-sm">
                {formatMontant(compte.solde)} seront restitués au client ({modes[form.mode_restitution].charAt(0).toLowerCase() + modes[form.mode_restitution].slice(1)}), puis le compte sera clôturé. Une facture sera émise.
              </p>
            ) : null}
          </>
        ) : (
          <p className="rounded-md bg-muted p-3 text-sm">Le solde est à zéro : le compte peut être clôturé directement.</p>
        )}

        <p className="text-xs text-muted-foreground">Cette action est définitive : plus aucune opération ne sera acceptée sur ce compte.</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Annuler</Button>
          <Button type="submit" variant="destructive" disabled={saving}>{saving ? 'Clôture…' : 'Confirmer la clôture'}</Button>
        </div>
      </form>
    </div>
  )
}
