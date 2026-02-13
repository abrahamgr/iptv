import { ChannelGrid } from './ChannelGrid'

interface Channel {
  id: number
  name: string
  url: string
  logo: string | null
  groupTitle: string
}

interface CategorySectionProps {
  title: string
  channels: Channel[]
  playlistId: number
}

export function CategorySection({
  title,
  channels,
  playlistId,
}: CategorySectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-200">{title}</h2>
      <ChannelGrid channels={channels} playlistId={playlistId} />
    </section>
  )
}
