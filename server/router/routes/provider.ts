import shadowrocketConfig from '@server/assets/shadowrocket.conf'
import { getClashProxyConfig, getShadowrocketProxyConfig } from '@server/services/provider'
import { HTTPError } from '@server/utils/utils'
import { Hono as Router } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import http from 'http'

const router = new Router()

router.get('/proxy/:token', async (ctx) => {
  try {
    const token = ctx.req.param('token')
    const userAgent = ctx.req.header('User-Agent')
    if (!token || !userAgent) {
      return ctx.notFound()
    }

    let res: { headers: Headers; body: string } | null = null
    if (/Clash|Stash/i.test(userAgent)) {
      res = await getClashProxyConfig(token, userAgent)
    } else if (/Shadowrocket/i.test(userAgent)) {
      res = await getShadowrocketProxyConfig(token, userAgent)
    } else {
      return ctx.notFound()
    }

    if (!res) {
      return ctx.notFound()
    }

    const { headers, body } = res
    return new Response(body, {
      headers,
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      if (![101, 204, 205, 304].includes(err.status) && http.STATUS_CODES[err.status]) {
        throw new HTTPException(err.status as ContentfulStatusCode)
      }
      throw new HTTPException(500)
    }
    throw err
  }
})

router.get('/config/:filename', async (ctx) => {
  const filename = ctx.req.param('filename')

  if ('shadowrocket.conf' === filename) {
    ctx.header('Content-Disposition', 'attachment; filename=shadowrocket.conf')
    return ctx.text(shadowrocketConfig)
  }
  return ctx.notFound()
})

router.get('/rule/:path{.+}', async (ctx) => {
  const path = ctx.req.param('path')

  return await fetch(`https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/${path}`)
})

export default router
