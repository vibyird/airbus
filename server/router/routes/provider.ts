import Router from '@koa/router'
import yaml from 'js-yaml'
import url from 'url'
import { findProvider } from '@server/services/provider'
import shadowrocketConfig from '@server/assets/shadowrocket.conf'

interface ClashConfig {
  proxies: {
    name: string
  }[]
}

const router = new Router()

router.get('/proxy/:token', async (ctx) => {
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
    const upstream = new url.URL(/^proxy\+/.test(subscribeUrl) ? subscribeUrl.replace(/^proxy\+/, '') : subscribeUrl)
    if (!upstream) {
      ctx.throw(502)
      return
    }

    const res = await fetch(upstream, {
      method: ctx.method,
      headers: {
        'User-Agent': userAgent,
      },
    })

    if (res.status !== 200) {
      ctx.throw(res.status || 502)
      return
    }

    const body = await res.text()
    if (/Clash|Stash/i.test(userAgent)) {
      // get headers
      const headers: Record<string, string | string[]> = {
        'Content-Type': 'application/x-yaml; charset=utf-8',
      }
      for (const [k, v] of res.headers.entries()) {
        if (['profile-update-interval', 'profile-web-page-url', 'subscription-userinfo'].includes(k)) {
          headers[k] = v
        }
      }

      const config = yaml.load(body) as ClashConfig
      const proxies = config.proxies
        .filter((proxy) => (excludeRegex ? !excludeRegex.test(proxy.name) : true))
        .map((proxy) => {
          proxy.name = proxy.name.replace('🇹🇼', '🇨🇳')
          return proxy
        })

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
          const [, name] = proxy.split('#')
          if (!name) {
            return true
          }
          const realName = decodeURIComponent(name)
          return !excludeRegex.test(realName)
        })
        .map((proxy) => {
          const [url, name] = proxy.split('#')
          const realName = decodeURIComponent(name)
          return `${url}#${encodeURIComponent(realName.replace('🇹🇼', '🇨🇳'))}`
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

router.get('/config/:filename', async (ctx) => {
  const filename = ctx.params.filename

  if ('shadowrocket.conf' === filename) {
    ctx.set({
      'Content-Type': 'text/plain, charset=utf-8',
      'Content-Disposition': 'attachment; filename=shadowrocket.conf',
    })
    ctx.body = shadowrocketConfig
    return
  }
  ctx.throw(404)
})

router.get('/rule/*path', async (ctx) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/${ctx.params.path}`,
    {
      method: ctx.method,
      headers: {
        'User-Agent': ctx.get('user-agent'),
      },
    },
  )

  if (res.status !== 200) {
    ctx.throw(res.status || 502)
    return
  }

  for (const [key, value] of res.headers.entries()) {
    ctx.set(key, value)
  }
  ctx.body = Buffer.from(await res.arrayBuffer())
})

export default router
