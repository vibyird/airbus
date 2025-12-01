import Router from 'koa-router'
import clashConfig from '../assets/clash.yaml'
import { findSubscriber } from '../service/subscribe'

const router = new Router()
router.get('/:token', async (ctx) => {
  const token = ctx.params.token
  if (!token) {
    ctx.status = 404
    ctx.body = 'Not Found'
    return
  }

  try {
    const subscriber = await findSubscriber(token)
    if (!subscriber) {
      ctx.status = 404
      ctx.body = 'Not Found'
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

    const { subscribeName, subscribeUrl } = subscriber
    directDomains.push(...subscriber.directDomains)

    const userAgent = ctx.get('user-agent')
    if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
      ctx.set({
        'Content-Type': 'application/x-yaml; charset=utf-8',
        'Content-Disposition': `attachment; filename=${subscribeName}.yaml`,
      })
      ctx.body = clashConfig
        .replace(/\${subscribeName}/g, subscribeName)
        .replace(/\${subscribeUrl}/g, subscribeUrl)
        .replace(
          /([^\r\n]*)\$\{directDomain\}([^\r\n]*)(\r?\n)/m,
          directDomains.map((directDomain) => `$1${directDomain}$2$3`).join(''),
        )
      return
    } else {
      ctx.status = 404
      ctx.body = 'Not Found'
      return
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = 'Server Error'
  }
})

export default router
