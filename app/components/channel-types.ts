export type Channel = {
  id: number
  playlistId?: number
  name: string
  logo: string | null
}

export type FullChannel = Channel & {
  playlistId: number
  url: string
  groupTitle: string
  tvgName: string | null
}

export type PlaylistOption = {
  id: number
  name: string
}
