import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { activerEspaceClient, desactiverEspaceClient } from '@/features/clients/api/clients-api'

const statuts = {
  AUCUN: { libelle: 'Non ouvert', classe: 'bg-muted text-muted-foreground' },
  EN_ATTENTE: { libelle: 'Code remis, en attente d’activation', classe: 'bg-accent/15 text-accent' },
  ACTIF: { libelle: 'Actif', classe: 'bg-primary/10 text-primary' },
  DESACTIVE: { libelle: 'Désactivé', classe: 'bg-destructive/10 text-destructive' },
}

export default function EspacePanel({ client, gerable, onChange }) {
  const { token } = useAuth()
  const [code, setCode] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const { statut, code_expire_le: expireLe } = client.espace
  const affichage = statuts[statut]

  async function generer() {
    const message = statut === 'ACTIF'
      ? 'Générer un nouveau code réinitialise l’accès du client : son mot de passe actuel ne fonctionnera plus. Continuer ?'
      : null
    if (message && !window.confirm(message)) return
    setError('')
    setPending(true)
    try {
      const resultat = await activerEspaceClient(token, client.id)
      setCode({ valeur: resultat.code, expireLe: resultat.expire_le })
      onChange(resultat.client)
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  async function desactiver() {
    if (!window.confirm('Désactiver l’espace en ligne ? Le client ne pourra plus se connecter.')) return
    setError('')
    setPending(true)
    try {
      setCode(null)
      onChange(await desactiverEspaceClient(token, client.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium">Espace client en ligne</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs ${affichage.classe}`}>{affichage.libelle}</span>
          {statut === 'EN_ATTENTE' && expireLe ? (
            <span className="text-xs text-muted-foreground">code valable jusqu’au {new Date(expireLe).toLocaleString('fr-FR')}</span>
          ) : null}
        </div>
        {gerable && !client.archive ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={generer}>
              {statut === 'AUCUN' ? 'Ouvrir l’espace en ligne' : 'Générer un nouveau code'}
            </Button>
            {statut === 'ACTIF' || statut === 'EN_ATTENTE' ? (
              <Button type="button" variant="outline" disabled={pending} onClick={desactiver}>Désactiver</Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {code ? (
        <div className="rounded-md border border-primary/40 bg-primary/5 p-4">
          <p className="text-sm">Code d’activation à remettre au client :</p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.3em] text-primary">{code.valeur}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Numéro client : <span className="font-medium text-foreground">{client.numero_client}</span>
            {' · '}valable jusqu’au {new Date(code.expireLe).toLocaleString('fr-FR')}, une seule utilisation.
            Le client l’utilise sur la page « Activer mon espace » ({window.location.origin}/activer). Le code a aussi été envoyé à {client.email}.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Ce code ne sera plus affiché après avoir quitté la page.</p>
        </div>
      ) : null}

      {statut === 'AUCUN' && !code ? (
        <p className="text-xs text-muted-foreground">
          Le client pourra consulter ses comptes, ses opérations, ses factures, télécharger ses relevés et modifier son e-mail et son mot de passe.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
