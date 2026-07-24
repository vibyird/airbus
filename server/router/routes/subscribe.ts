import { findProvider, getClashConfig } from '@server/services/provider'
import { Hono as Router } from 'hono'

const router = new Router()

router.get('/:token', async (ctx) => {
  const token = ctx.req.param('token')
  if (!token) {
    return ctx.notFound()
  }

  const userAgent = ctx.req.header('User-Agent') ?? ''
  const url = new URL(ctx.req.url)
  const baseUrl = `${url.protocol}//${url.host}`
  if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
    const res = await getClashConfig(token, baseUrl)
    if (!res) {
      return ctx.notFound()
    }

    const { headers, body } = res
    return new Response(body, {
      headers,
    })
  } else if (/Shadowrocket/i.test(userAgent)) {
    const provider = await findProvider(token)
    if (!provider) {
      return ctx.notFound()
    }

    const { token: providerToken } = provider
    return ctx.redirect(`${baseUrl}/api/provider/proxy/${providerToken}`)
  }
  return ctx.notFound()
})

export default router
