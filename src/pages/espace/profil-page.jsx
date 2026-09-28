import { useEffect, useState } from 'react'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { changerMotDePasse, getProfil, updateEmail } from '@/features/espace/api/espace-api'

function Info({ label, children }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm font-medium">{children}</p>
    </div>
  )
}

const motsDePasseVides = { ancien: '', nouveau: '', confirmation: '' }

export default function EspaceProfilPage() {
  const { token } = useAuth()
  const [profil, setProfil] = useState(null)
  const [email, setEmail] = useState('')
  const [motsDePasse, setMotsDePasse] = useState(motsDePasseVides)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(null)

  useEffect(() => {
    getProfil(token)
      .then((fiche) => {
        setProfil(fiche)
        setEmail(fiche.email)
      })
      .catch((err) => setError(err.message))
  }, [token])

  async function enregistrerEmail(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setPending('email')
    try {
      const fiche = await updateEmail(token, email.trim())
      setProfil(fiche)
      setMessage('Adresse e-mail mise à jour : vos prochains justificatifs y seront envoyés.')
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(null)
    }
  }

  async function enregistrerMotDePasse(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (motsDePasse.nouveau !== motsDePasse.confirmation) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }
    setPending('mdp')
    try {
      await changerMotDePasse(token, motsDePasse.ancien, motsDePasse.nouveau)
      setMotsDePasse(motsDePasseVides)
      setMessage('Mot de passe modifié. Utilisez-le à votre prochaine connexion.')
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(null)
    }
  }

  if (!profil) return error ? <p className="text-sm text-destructive">{error}</p> : <p className="text-sm text-muted-foreground">Chargement…</p>

  const changer = (champ) => (event) => setMotsDePasse({ ...motsDePasse, [champ]: event.target.value })

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Mon profil</h1>

      <div className="grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Nom">{profil.prenom} {profil.nom}</Info>
        <Info label="Numéro client">{profil.numero_client}</Info>
        <Info label="Client depuis le">{new Date(profil.date_inscription).toLocaleDateString('fr-FR')}</Info>
        <Info label="Banque">{profil.banque_nom}</Info>
        <Info label="Agence">{profil.agence_nom} ({profil.agence_ville})</Info>
        <Info label="Conseiller">{profil.conseiller_nom || 'à désigner'}</Info>
      </div>
      <p className="text-xs text-muted-foreground">
        Pour corriger votre nom ou changer d’agence, adressez-vous à votre conseiller : ces informations sont gérées par la banque.
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={enregistrerEmail} className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Adresse e-mail de contact</h2>
          <Field label="E-mail">
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Button disabled={pending === 'email' || email.trim() === profil.email}>
            {pending === 'email' ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </form>

        <form onSubmit={enregistrerMotDePasse} className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Changer de mot de passe</h2>
          <Field label="Mot de passe actuel">
            <input type="password" className={inputClass} value={motsDePasse.ancien} onChange={changer('ancien')} autoComplete="current-password" required />
          </Field>
          <Field label="Nouveau mot de passe">
            <input type="password" className={inputClass} value={motsDePasse.nouveau} onChange={changer('nouveau')} autoComplete="new-password" minLength={8} required />
          </Field>
          <Field label="Confirmer">
            <input type="password" className={inputClass} value={motsDePasse.confirmation} onChange={changer('confirmation')} autoComplete="new-password" minLength={8} required />
          </Field>
          <Button disabled={pending === 'mdp'}>{pending === 'mdp' ? 'Modification…' : 'Modifier le mot de passe'}</Button>
        </form>
      </div>
    </section>
  )
}
