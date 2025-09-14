export const dynamic = 'force-static'
export const runtime = 'edge'

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'content-type': 'application/json' },
  })
}