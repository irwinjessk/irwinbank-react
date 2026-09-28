import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { activerEspace } from '@/features/espace/api/espace-api'

export default function ActivationPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ numero_client: '', code: '', mot_de_passe: '', confirmation: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const changer = (champ) => (event) => setForm({ ...form, [champ]: event.target.value })

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.mot_de_passe !== form.confirmation) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setPending(true)
    try {
      const resultat = await activerEspace({
        numero_client: form.numero_client.trim(),
        code: form.code.trim(),
        mot_de_passe: form.mot_de_passe,
      })
      navigate('/connexion', {
        replace: true,
        state: { message: `Espace activé. Connectez-vous avec votre numéro client ${resultat.numero_client} et votre mot de passe.` },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <p className="text-xs tracking-[0.22em] text-accent">ADA BANK</p>
          <h1 className="mt-2 text-2xl font-semibold">Activer mon espace client</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Saisissez le numéro client et le code d’activation remis par votre agence (aussi envoyés par e-mail), puis choisissez votre mot de passe.
          </p>
        </div>
        <Field label="Numéro client">
          <input className={inputClass} value={form.numero_client} onChange={changer('numero_client')} placeholder="CLI-202609-123456" autoComplete="username" required />
        </Field>
        <Field label="Code d’activation">
          <input className={`${inputClass} font-mono uppercase tracking-widest`} value={form.code} onChange={changer('code')} placeholder="XXXX-XXXX" autoComplete="one-time-code" required />
        </Field>
        <Field label="Nouveau mot de passe">
          <input type="password" className={inputClass} value={form.mot_de_passe} onChange={changer('mot_de_passe')} autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirmer le mot de passe">
          <input type="password" className={inputClass} value={form.confirmation} onChange={changer('confirmation')} autoComplete="new-password" minLength={8} required />
        </Field>
        <p className="text-xs text-muted-foreground">Au moins 8 caractères, pas trop courant ni proche de votre numéro client.</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" disabled={pending}>{pending ? 'Activation…' : 'Activer mon espace'}</Button>
        <p className="text-center text-sm text-muted-foreground">
          Déjà activé ? <Link to="/connexion" className="text-primary hover:underline">Se connecter</Link>
        </p>
      </form>
    </main>
  )
}
