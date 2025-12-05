import Router from '@koa/router'
import http from 'http'
import https from 'https'
import url from 'url'
import clashConfig from '../assets/clash.yaml'
import { findSubscriber } from '../service/subscribe'

const router = new Router()
router.get('/:token', async (ctx) => {
  const token = ctx.params.token
  if (!token) {
    ctx.throw(404)
    return
  }

  const subscriber = await findSubscriber(token)
  if (!subscriber) {
    ctx.throw(404)
    return
  }
  const directDomains = []
  if (process.env.DIRECT_DOMAINS) {
    directDomains.push(
      ...process.env.DIRECT_DOMAINS.split(',')
        .map((domain) => domain.trim())
        .filter(Boolean),
    )
  }
  const { subscribeName } = subscriber
  directDomains.push(...subscriber.directDomains)

  const userAgent = ctx.get('user-agent')
  if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
    ctx.set({
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename=${subscribeName}.yaml`,
    })
    ctx.body = clashConfig
      .replace(/\${subscribeName}/g, subscribeName)
      .replace(/\${subscribeUrl}/g, `${ctx.protocol}://${ctx.host}/subscribe/provider/${token}`)
      .replace(
        /([^\r\n]*)\$\{directDomain\}([^\r\n]*)(\r?\n)/m,
        directDomains.map((directDomain) => `$1${directDomain}$2$3`).join(''),
      )
    return
  }
  ctx.throw(404)
})

router.get('/provider/:token', async (ctx) => {
  const token = ctx.params.token
  if (!token) {
    ctx.throw(404)
    return
  }

  const subscriber = await findSubscriber(token)
  if (!subscriber) {
    ctx.throw(404)
    return
  }
  const { subscribeUrl } = subscriber
  const userAgent = ctx.get('user-agent')
  if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
    const upstreamUrl = new url.URL(subscribeUrl)
    if (!upstreamUrl) {
      ctx.throw(502)
      return
    }
    const upstream = await new Promise<http.IncomingMessage>((resolve, reject) => {
      ;(upstreamUrl.protocol === 'https:' ? https : http)
        .get(upstreamUrl, { headers: { 'user-agent': userAgent } }, (upstream) => {
          resolve(upstream)
        })
        .on('error', (e) => {
          reject(e)
        })
    })

    // set status
    ctx.status = upstream.statusCode || 404
    // set headers
    const headers: Record<string, string | string[]> = {}
    for (const [k, v] of Object.entries(upstream.headers)) {
      if (v !== undefined) {
        // remove undefined
        headers[k] = Array.isArray(v) ? v.slice() : v
      }
    }
    ctx.set(headers)
    // set body
    const chunks = []
    for await (const chunk of upstream) {
      chunks.push(chunk) // 每个 chunk 已经是 Buffer
    }
    ctx.body = Buffer.concat(chunks)
    return
  }
  ctx.throw(404)
})

export default router
