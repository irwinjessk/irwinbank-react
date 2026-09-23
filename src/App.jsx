import { Button } from '@/components/ui/button'

const appName = import.meta.env.VITE_APP_NAME ?? 'IrwinBank'

export default function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold tracking-tight">{appName}</h1>
      <Button>Commencer</Button>
    </main>
  )
}
