import Router from '@koa/router'
import http from 'http'
import https from 'https'
import yaml from 'js-yaml'
import url from 'url'
import clashConfig from '../assets/clash.yaml'
import { findProvider } from '../service/subscribe'

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

  let provider = await findProvider(token)
  if (!provider) {
    ctx.throw(404)
    return
  }

  const { name: fileName, realName: subscribeName, token: providerToken } = provider
  const directDomains = []
  if (process.env.DIRECT_DOMAINS) {
    directDomains.push(
      ...process.env.DIRECT_DOMAINS.split(',')
        .map((domain) => domain.trim())
        .filter(Boolean),
    )
  }
  directDomains.push(...provider.directDomains)

  const userAgent = ctx.get('user-agent')
  if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
    ctx.set({
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename=${fileName}.yaml`,
    })
    ctx.body = clashConfig
      .replace(/\${url}/g, `${ctx.protocol}://${ctx.host}`)
      .replace(/\${subscribeName}/g, subscribeName)
      .replace(
        /\${subscribeUrl}/g,
        `${ctx.protocol}://${ctx.host}${ctx.url.replace(`/${token}`, `/provider/${providerToken}`)}`,
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

  let provider = await findProvider(token)
  if (!provider) {
    ctx.throw(404)
    return
  }

  const { subscribeUrl, excludeRegex } = provider

  const userAgent = ctx.get('user-agent')
  if (/Clash|Stash|Shadowrocket/i.test(userAgent)) {
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

    // get body
    const chunks = []
    for await (const chunk of res) {
      chunks.push(chunk)
    }
    const body = Buffer.concat(chunks).toString()

    if (/Clash|Stash/i.test(userAgent)) {
      // get headers
      const headers: Record<string, string | string[]> = {
        'Content-Type': 'application/x-yaml; charset=utf-8',
      }
      for (const [k, v] of Object.entries(res.headers)) {
        if (
          ['profile-update-interval', 'profile-web-page-url', 'subscription-userinfo'].includes(k) &&
          v !== undefined
        ) {
          headers[k] = Array.isArray(v) ? v.slice() : v
        }
      }

      const config = yaml.load(body) as ClashConfig
      const proxies = config.proxies.filter((proxy) => (excludeRegex ? !excludeRegex.test(proxy.name) : true))

      // set headers and body
      ctx.set(headers)
      ctx.body = yaml.dump({
        proxies,
      })
      return
    } else if (/Shadowrocket/i.test(userAgent)) {
      const lines = Buffer.from(body, 'base64')
        .toString('utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

      const config = []
      const status = lines.filter((line) => /^STATUS=/i.test(line)).shift()
      if (status) {
        config.push(status)
      }

      const proxies = lines
        .filter((line) => !/^STATUS=/i.test(line))
        .filter((proxy) => {
          if (!excludeRegex) {
            return true
          }
          let [, name] = proxy.split('#')
          if (!name) {
            return true
          }
          return !excludeRegex.test(decodeURIComponent(name))
        })

      if (proxies.length > 0) {
        config.push(...proxies)
      }

      // set headers and body
      ctx.body = Buffer.from(config.join('\n'), 'utf8').toString('base64')
    } else {
      ctx.throw(404)
    }
  } else {
    ctx.throw(404)
  }
})

export default router
