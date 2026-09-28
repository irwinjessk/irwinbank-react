import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import StatCard from '@/components/data/stat-card'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { listAgences, listAgentsAgence } from '@/features/agences/api/agences-api'
import { useAuth } from '@/features/auth/context/auth-context'
import { archiverClient, changerAgence, getClient, listClients, restaurerClient, updateClient } from '@/features/clients/api/clients-api'
import { cloturerCompte, listComptes, openCompte } from '@/features/comptes/api/comptes-api'
import EspacePanel from '@/features/clients/components/espace-panel'
import ClotureDialog from '@/features/comptes/components/cloture-dialog'
import { listTransactions } from '@/features/operations/api/operations-api'
import { formatMontant } from '@/lib/money'

const libellesType = { COURANT: 'Courant', EPARGNE: 'Épargne' }
const libellesOperation = { DEPOT: 'Dépôt', RETRAIT: 'Retrait', VIREMENT: 'Virement' }

export default function ClientDetailPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const [client, setClient] = useState(null)
  const [comptes, setComptes] = useState([])
  const [clients, setClients] = useState([])
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [edition, setEdition] = useState(null)
  const [saving, setSaving] = useState(false)
  const [typeCompte, setTypeCompte] = useState('COURANT')
  const [soldeInitial, setSoldeInitial] = useState('')
  const [opening, setOpening] = useState(false)
  const [aCloturer, setACloturer] = useState(null)
  const [agences, setAgences] = useState([])
  const [agents, setAgents] = useState([])
  const [nouvelleAgence, setNouvelleAgence] = useState('')
  const [moving, setMoving] = useState(false)
  const [motifArchivage, setMotifArchivage] = useState(null)

  async function load() {
    try {
      const [fiche, tousComptes, tousClients, mouvements] = await Promise.all([
        getClient(token, id),
        listComptes(token),
        listClients(token),
        listTransactions(token, { client: id }),
      ])
      setClient(fiche)
      setComptes(tousComptes)
      setClients(tousClients)
      setOperations(mouvements.slice(0, 10))
      const [agencesBanque, agentsAgence] = await Promise.all([
        listAgences(token, { banque: fiche.banque }),
        listAgentsAgence(token, fiche.agence),
      ])
      setAgences(agencesBanque)
      setAgents(agentsAgence)
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

  const sesComptes = comptes.filter((compte) => compte.client === Number(id))
  const numeroCompte = (compteId) => comptes.find((compte) => compte.id === compteId)?.numero_compte ?? `#${compteId}`
  const avoirs = sesComptes
    .filter((compte) => compte.statut === 'OUVERT')
    .reduce((total, compte) => total + Number(compte.solde), 0)

  async function enregistrer(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      setClient(await updateClient(token, id, edition))
      setEdition(null)
      setMessage('Fiche client mise à jour.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function archiver(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      setClient(await archiverClient(token, id, motifArchivage))
      setMotifArchivage(null)
      setMessage('Fiche archivée. Elle reste consultable et peut être restaurée.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function restaurer() {
    setError('')
    setMessage('')
    try {
      setClient(await restaurerClient(token, id))
      setMessage('Fiche restaurée.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function deplacer(event) {
    event.preventDefault()
    setError('')
    setMoving(true)
    try {
      const fiche = await changerAgence(token, id, nouvelleAgence)
      setNouvelleAgence('')
      setMessage(`Client rattaché à ${fiche.agence_nom}. Numéro et comptes inchangés.`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setMoving(false)
    }
  }

  async function ouvrir(event) {
    event.preventDefault()
    setError('')
    setOpening(true)
    try {
      const compte = await openCompte(token, { client: id, type_compte: typeCompte, solde_initial: soldeInitial })
      setSoldeInitial('')
      setMessage(`Compte ${compte.numero_compte} ouvert${Number(compte.solde) > 0 ? ` avec un dépôt initial de ${formatMontant(compte.solde)}` : ''}.`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setOpening(false)
    }
  }

  async function confirmerCloture(choix) {
    const compte = await cloturerCompte(token, aCloturer.id, choix)
    setACloturer(null)
    setMessage(`Compte ${compte.numero_compte} clôturé.`)
    await load()
  }

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>
  if (!client) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-destructive">{error || 'Client introuvable.'}</p>
        <Link to="/app/clients" className="text-sm underline">Retour aux clients</Link>
      </section>
    )
  }

  const gerable = user?.role === 'ADMIN' || user?.agence_id === client.agence
  const modifiable = gerable && !client.archive
  const comptesOuverts = sesComptes.filter((compte) => compte.statut === 'OUVERT').length

  return (
    <section className="space-y-6">
      <Link to="/app/clients" className="text-sm text-muted-foreground hover:underline">← Tous les clients</Link>

      <div className="rounded-lg border border-border bg-card p-5">
        {edition ? (
          <form onSubmit={enregistrer} className="grid gap-3 md:grid-cols-5">
            <Field label="Nom"><input className={inputClass} value={edition.nom} onChange={(e) => setEdition({ ...edition, nom: e.target.value })} required /></Field>
            <Field label="Prénom"><input className={inputClass} value={edition.prenom} onChange={(e) => setEdition({ ...edition, prenom: e.target.value })} required /></Field>
            <Field label="E-mail"><input type="email" className={inputClass} value={edition.email} onChange={(e) => setEdition({ ...edition, email: e.target.value })} required /></Field>
            <Field label="Conseiller">
              <select className={inputClass} value={edition.conseiller} onChange={(e) => setEdition({ ...edition, conseiller: e.target.value })}>
                <option value="">Aucun</option>
                {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.username}</option>)}
              </select>
            </Field>
            <div className="flex items-end gap-2">
              <Button disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
              <Button type="button" variant="outline" onClick={() => setEdition(null)} disabled={saving}>Annuler</Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{client.numero_client}</p>
              <h2 className="mt-1 text-xl font-semibold">{client.prenom} {client.nom}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {client.email} · {client.banque_nom} · client depuis le {new Date(client.date_inscription).toLocaleDateString('fr-FR')}
              </p>
              <p className="mt-2 text-sm">
                Agence : <span className="font-medium">{client.agence_nom}</span>
                {' · '}Conseiller : <span className="font-medium">{client.conseiller_nom || 'à désigner'}</span>
              </p>
            </div>
            {modifiable ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMessage('')
                    setEdition({ nom: client.nom, prenom: client.prenom, email: client.email, conseiller: client.conseiller ?? '' })
                  }}
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  disabled={comptesOuverts > 0}
                  title={comptesOuverts > 0 ? 'Clôturez d’abord les comptes ouverts' : undefined}
                  onClick={() => {
                    setMessage('')
                    setMotifArchivage('')
                  }}
                >
                  Archiver
                </Button>
              </div>
            ) : null}
            {gerable && client.archive ? <Button variant="outline" onClick={restaurer}>Restaurer</Button> : null}
          </div>
        )}
      </div>

      {client.archive ? (
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <span className="font-medium">Client archivé</span> le {new Date(client.date_archivage).toLocaleDateString('fr-FR')}
          {client.archive_par_nom ? ` par ${client.archive_par_nom}` : ''} · motif : {client.motif_archivage}.
          <span className="text-muted-foreground"> La fiche et son historique restent consultables, en lecture seule.</span>
        </p>
      ) : null}

      {motifArchivage !== null ? (
        <form onSubmit={archiver} className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-4">
          <Field label="Motif de l’archivage">
            <input className={inputClass} value={motifArchivage} onChange={(e) => setMotifArchivage(e.target.value)} placeholder="Départ du client, décès, doublon…" required />
          </Field>
          <Button variant="destructive" disabled={!motifArchivage.trim()}>Confirmer l’archivage</Button>
          <Button type="button" variant="outline" onClick={() => setMotifArchivage(null)}>Annuler</Button>
        </form>
      ) : null}

      {client.archive ? null : modifiable ? (
        <form onSubmit={deplacer} className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-4">
          <Field label="Changer d’agence">
            <select className={inputClass} value={nouvelleAgence} onChange={(e) => setNouvelleAgence(e.target.value)} required>
              <option value="">Nouvelle agence</option>
              {agences.filter((agence) => agence.id !== client.agence).map((agence) => (
                <option key={agence.id} value={agence.id}>{agence.nom} ({agence.ville})</option>
              ))}
            </select>
          </Field>
          <Button variant="outline" disabled={moving || !nouvelleAgence}>{moving ? 'Transfert…' : 'Transférer'}</Button>
          <p className="text-xs text-muted-foreground">Le numéro client et les comptes restent les mêmes ; le transfert est inscrit au journal.</p>
        </form>
      ) : (
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Client d’une autre agence : vous pouvez effectuer ses dépôts et retraits au guichet (page Mouvements), mais pas modifier sa fiche ni ses comptes.
        </p>
      )}

      <EspacePanel client={client} gerable={gerable} onChange={setClient} />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Avoirs" value={formatMontant(avoirs)} hint="Somme des comptes ouverts" />
        <StatCard label="Comptes ouverts" value={sesComptes.filter((compte) => compte.statut === 'OUVERT').length} />
        <StatCard label="Comptes clôturés" value={sesComptes.filter((compte) => compte.statut === 'CLOTURE').length} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-sm font-medium">Comptes</h3>
          {modifiable ? <form onSubmit={ouvrir} className="flex items-end gap-2">
            <select className={inputClass} value={typeCompte} onChange={(e) => setTypeCompte(e.target.value)} aria-label="Type de compte">
              <option value="COURANT">Courant</option>
              <option value="EPARGNE">Épargne</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass} w-40`}
              value={soldeInitial}
              onChange={(e) => setSoldeInitial(e.target.value)}
              placeholder="Solde initial"
              aria-label="Solde initial (F CFA)"
            />
            <Button disabled={opening}>{opening ? 'Ouverture…' : 'Ouvrir un compte'}</Button>
          </form> : null}
        </div>
        <DataTable
          rows={sesComptes}
          columns={[
            {
              key: 'numero',
              label: 'Numéro',
              render: (row) => <Link to={`/app/comptes/${row.id}`} className="font-medium text-primary hover:underline">{row.numero_compte}</Link>,
            },
            { key: 'type', label: 'Type', render: (row) => libellesType[row.type_compte] },
            { key: 'solde', label: 'Solde', render: (row) => formatMontant(row.solde) },
            { key: 'statut', label: 'Statut', render: (row) => (row.statut === 'OUVERT' ? 'Ouvert' : 'Clôturé') },
            {
              key: 'action',
              label: '',
              render: (row) => row.statut === 'OUVERT' && modifiable ? (
                <Button variant="outline" type="button" onClick={() => { setMessage(''); setACloturer(row) }}>Clôturer</Button>
              ) : '—',
            },
          ]}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Dernières opérations</h3>
        <DataTable
          rows={operations}
          columns={[
            { key: 'date', label: 'Date', render: (row) => new Date(row.date_transaction).toLocaleString('fr-FR') },
            { key: 'compte', label: 'Compte', render: (row) => numeroCompte(row.compte) },
            { key: 'type', label: 'Opération', render: (row) => libellesOperation[row.type_transaction] },
            { key: 'montant', label: 'Montant', render: (row) => `${row.sens === 'CREDIT' ? '+' : '−'} ${formatMontant(row.montant)}` },
            { key: 'description', label: 'Libellé', render: (row) => row.description || '—' },
          ]}
        />
      </div>

      {aCloturer ? (
        <ClotureDialog
          compte={aCloturer}
          comptes={comptes}
          clients={clients}
          onConfirm={confirmerCloture}
          onCancel={() => setACloturer(null)}
        />
      ) : null}
    </section>
  )
}
