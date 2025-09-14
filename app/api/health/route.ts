export const dynamic = 'force-static'

export async function GET() {
  return new Response(
    JSON.stringify({ status: 'healthy' }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  )
}