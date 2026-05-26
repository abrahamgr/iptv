import { z } from 'zod'

export const editChannelSchema = z.object({
  channelId: z.coerce.number().int().positive(),
  playlistId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Name is required'),
  url: z.string().trim().min(1, 'URL is required'),
  logo: z.string().trim().optional().or(z.literal('')),
  groupTitle: z.string().trim().min(1, 'Category is required'),
  tvgName: z.string().trim().optional().or(z.literal('')),
})

export type EditChannelInput = z.infer<typeof editChannelSchema>
export type EditChannelErrors = z.ZodFormattedError<EditChannelInput>
