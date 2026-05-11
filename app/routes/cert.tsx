import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function loader() {
  const path = resolve(process.cwd(), 'data/cert.pem')
  try {
    const pem = await readFile(path)
    return new Response(new Uint8Array(pem), {
      headers: {
        'Content-Type': 'application/x-x509-ca-cert',
        'Content-Disposition': 'attachment; filename="iptv-local.crt"',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response(
      'Certificate not generated. Run: npm run cert:generate',
      {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      },
    )
  }
}
