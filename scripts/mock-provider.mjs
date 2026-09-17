/**
 * A tiny OpenAI-compatible upstream used to exercise the public router locally
 * without spending real provider credits. Not part of the product.
 *
 *   bun scripts/mock-provider.mjs        # listens on 54322
 *
 * Point a provider's base URL at http://localhost:54322/v1 to use it.
 */

const PORT = Number(process.env.MOCK_PROVIDER_PORT ?? 54322)

Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname.endsWith('/models')) {
      return Response.json({ object: 'list', data: [{ id: 'mock-model' }] })
    }

    if (url.pathname.endsWith('/chat/completions')) {
      const body = await request.json()
      const prompt = JSON.stringify(body.messages ?? []).length

      return Response.json({
        id: `chatcmpl-${crypto.randomUUID()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: body.model ?? 'mock-model',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello from the mock provider.' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: Math.max(1, Math.ceil(prompt / 4)),
          completion_tokens: 7,
        },
      })
    }

    return Response.json({ error: { message: 'not found' } }, { status: 404 })
  },
})

console.log(`mock provider listening on http://localhost:${PORT}/v1`)
