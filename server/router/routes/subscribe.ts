import Router from '@koa/router'
import clashConfig from '@server/assets/clash.yaml'
import { findProvider } from '@server/services/provider'

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

  const { name: fileName, realName: subscribeName, token: providerToken, subscribeUrl } = provider
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
  const url = `${ctx.protocol}://${ctx.host}`
  if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
    ctx.set({
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename=${fileName}.yaml`,
    })
    ctx.body = clashConfig
      .replace(/\${url}/g, url)
      .replace(/\${subscribeName}/g, subscribeName)
      .replace(
        /\${subscribeUrl}/g,
        /^proxy\+/.test(subscribeUrl) ? `${url}/api/provider/proxy/${providerToken}` : subscribeUrl,
      )
      .replace(
        /([^\r\n]*)\$\{directDomain\}([^\r\n]*)(\r?\n)/m,
        directDomains.map((directDomain) => `$1${directDomain}$2$3`).join(''),
      )
    return
  } else if (/Shadowrocket/i.test(userAgent)) {
    ctx.redirect(`${url}/api/provider/proxy/${providerToken}`)
    return
  }
  ctx.throw(404)
})

export default router
