import EmptyState from '@/components/data/empty-state'

export default function SectionPage({ title, description }) {
  return (
    <section className="space-y-4">
      <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      <EmptyState title={title} description="Les données s’afficheront ici." />
    </section>
  )
}
