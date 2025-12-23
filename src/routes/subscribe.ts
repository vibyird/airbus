import Router from '@koa/router'
import http from 'http'
import https from 'https'
import yaml from 'js-yaml'
import url from 'url'
import clashConfig from '../assets/clash.yaml'
import { findSubscriber } from '../service/subscribe'

interface ClashConfig {
  proxies: {
    name: string
  }[]
}

const router = new Router()
router.get('/:token', async (ctx) => {
  const token = ctx.params.token
  if (!token) {
    ctx.throw(404)
    return
  }

  let subscriber = await findSubscriber(token)
  if (!subscriber) {
    ctx.throw(404)
    return
  }

  const { subscribeName: fileName } = subscriber

  if (!/https?:/.test(subscriber.subscribeUrl)) {
    subscriber = await findSubscriber(subscriber.subscribeUrl)
    if (!subscriber) {
      ctx.throw(404)
      return
    }
  }

  const { subscribeName } = subscriber
  const directDomains = []
  if (process.env.DIRECT_DOMAINS) {
    directDomains.push(
      ...process.env.DIRECT_DOMAINS.split(',')
        .map((domain) => domain.trim())
        .filter(Boolean),
    )
  }
  directDomains.push(...subscriber.directDomains)

  const userAgent = ctx.get('user-agent')
  if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
    ctx.set({
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename=${fileName}.yaml`,
    })
    ctx.body = clashConfig
      .replace(/\${subscribeName}/g, subscribeName)
      .replace(
        /\${subscribeUrl}/g,
        `${ctx.protocol}://${ctx.host}${ctx.url.replace(`/${token}`, `/provider/${token}`)}`,
      )
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

  let subscriber = await findSubscriber(token)
  if (!subscriber) {
    ctx.throw(404)
    return
  }

  if (!/https?:/.test(subscriber.subscribeUrl)) {
    subscriber = await findSubscriber(subscriber.subscribeUrl)
    if (!subscriber) {
      ctx.throw(404)
      return
    }
  }

  const { subscribeUrl } = subscriber

  const userAgent = ctx.get('user-agent')
  if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
    const upstream = new url.URL(subscribeUrl)
    if (!upstream) {
      ctx.throw(502)
      return
    }

    const res = await new Promise<http.IncomingMessage>((resolve, reject) => {
      ;(upstream.protocol === 'https:' ? https : http)
        .get(upstream, { headers: { 'User-Agent': userAgent } }, (res) => {
          resolve(res)
        })
        .on('error', (e) => {
          reject(e)
        })
    })

    if (res.statusCode !== 200) {
      ctx.throw(res.statusCode || 502)
      return
    }

    // get headers
    const headers: Record<string, string | string[]> = {
      'Content-Type': 'application/x-yaml; charset=utf-8',
    }
    for (const [k, v] of Object.entries(res.headers)) {
      if (['profile-update-interval', 'profile-web-page-url', 'subscription-userinfo'].includes(k) && v !== undefined) {
        headers[k] = Array.isArray(v) ? v.slice() : v
      }
    }

    // get proxies
    const chunks = []
    for await (const chunk of res) {
      chunks.push(chunk)
    }
    const config = yaml.load(Buffer.concat(chunks).toString()) as ClashConfig
    const proxies = config.proxies.filter((proxy) => !/(?:Traffic|Expire|网址|流量|到期|重置)/i.test(proxy.name))

    // set headers and body
    ctx.set(headers)
    ctx.body = yaml.dump({
      proxies,
    })
    return
  }
  ctx.throw(404)
})

export default router
