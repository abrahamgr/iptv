import { data } from 'react-router'
import { editChannelSchema } from '~/lib/channel-schemas'
import { updateChannel } from '~/lib/playlist-service.server'
import type { Route } from './+types/edit'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const result = editChannelSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return data(
      { intent: 'editChannel' as const, errors: result.error.format() },
      { status: 400 },
    )
  }

  const { channelId, ...fields } = result.data
  updateChannel(channelId, {
    ...fields,
    logo: fields.logo || null,
    tvgName: fields.tvgName || null,
  })

  return null
}
