export interface ParsedChannel {
  name: string
  url: string
  logo: string | null
  groupTitle: string
  tvgId: string | null
  tvgName: string | null
}

function extractAttribute(line: string, attr: string): string | null {
  const regex = new RegExp(`${attr}="([^"]*)"`, 'i')
  const match = line.match(regex)
  return match ? match[1] : null
}

export function parseM3U(content: string): ParsedChannel[] {
  const lines = content.split(/\r?\n/)
  const channels: ParsedChannel[] = []

  if (!lines[0]?.trim().startsWith('#EXTM3U')) {
    throw new Error('Invalid M3U file: missing #EXTM3U header')
  }

  let currentInfo: Omit<ParsedChannel, 'url'> | null = null

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (line.startsWith('#EXTINF:')) {
      // Extract channel name (text after the last comma)
      const commaIndex = line.lastIndexOf(',')
      const name =
        commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unknown'

      currentInfo = {
        name,
        logo: extractAttribute(line, 'tvg-logo'),
        groupTitle: extractAttribute(line, 'group-title') || 'Uncategorized',
        tvgId: extractAttribute(line, 'tvg-id'),
        tvgName: extractAttribute(line, 'tvg-name'),
      }
    } else if (!line.startsWith('#') && currentInfo) {
      channels.push({ ...currentInfo, url: line })
      currentInfo = null
    }
  }

  return channels
}
